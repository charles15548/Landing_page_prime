import { NextResponse } from "next/server";
import { ACTIVITY_EVENTS, EVENT_TYPE_CODE, isActivityEventType } from "@/lib/activity";
import {
  getSupabaseAdminClient,
  isActivityTrackingEnabled,
} from "@/lib/supabase-admin";

type ActivityPayload = {
  eventType?: unknown;
  pageUrl?: unknown;
  metadata?: unknown;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const runtime = "nodejs";
const DEBUG_LOGS = process.env.ACTIVITY_DEBUG_LOGS === "true";

function logServer(step: string, details?: unknown) {
  if (!DEBUG_LOGS) {
    return;
  }

  if (typeof details === "undefined") {
    console.info(`[activity][server] ${step}`);
    return;
  }

  console.info(`[activity][server] ${step}`, details);
}

function safeText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function safeObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getClientIpAddress(request: Request) {
  if (process.env.ACTIVITY_CAPTURE_IP !== "true") {
    return null;
  }

  const directIp =
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip");

  if (directIp) {
    return directIp.trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) {
    return null;
  }

  const firstIp = forwardedFor.split(",")[0]?.trim();
  return firstIp && firstIp.length > 0 ? firstIp : null;
}

export async function POST(request: Request) {
  const requestId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  logServer("request_received", { requestId, method: request.method });

  if (!isActivityTrackingEnabled()) {
    logServer("tracking_disabled_by_env", { requestId });
    return NextResponse.json({ ok: true, tracking: "disabled" }, { status: 202 });
  }

  let body: ActivityPayload;
  try {
    body = (await request.json()) as ActivityPayload;
  } catch {
    logServer("invalid_json", { requestId });
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isActivityEventType(body.eventType)) {
    logServer("invalid_event_type", { requestId, eventType: body.eventType });
    return NextResponse.json({ error: "Invalid eventType" }, { status: 400 });
  }

  const metadata = safeObject(body.metadata);
  const pageUrl = safeText(body.pageUrl);
  const userAgent = request.headers.get("user-agent");
  const ipAddress = getClientIpAddress(request);
  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const acceptLanguage = request.headers.get("accept-language");
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry");
  const region =
    request.headers.get("x-vercel-ip-country-region") ?? null;
  const city = request.headers.get("x-vercel-ip-city") ?? null;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    logServer("supabase_not_configured", { requestId });
    return NextResponse.json(
      { ok: true, tracking: "not_configured" },
      { status: 202 },
    );
  }

  const row = {
    event_type: EVENT_TYPE_CODE[body.eventType],
    page_url: pageUrl,
    user_agent: userAgent,
    ip_address: ipAddress,
    metadata: {
      ...metadata,
      session_id:
        typeof metadata.session_id === "string" && UUID_PATTERN.test(metadata.session_id)
          ? metadata.session_id
          : null,
      event_name:
        body.eventType === ACTIVITY_EVENTS.VISIT
          ? ACTIVITY_EVENTS.VISIT
          : ACTIVITY_EVENTS.DOWNLOAD_CLICK,
      server_context: {
        request_id: requestId,
        server_received_at: new Date().toISOString(),
        host,
        origin,
        referer,
        accept_language: acceptLanguage,
        country,
        region,
        city,
        forwarded_proto: forwardedProto,
        forwarded_host: forwardedHost,
      },
    },
  };

  logServer("insert_attempt", {
    requestId,
    eventType: body.eventType,
    pageUrl,
    hasMetadata: Object.keys(metadata).length > 0,
  });

  const { error } = await supabase.from("user_activity").insert(row);

  if (error) {
    logServer("insert_failed", { requestId, message: error.message });
    return NextResponse.json(
      { error: "Failed to persist activity event" },
      { status: 500 },
    );
  }

  logServer("insert_success", { requestId, eventType: body.eventType });
  return NextResponse.json({ ok: true }, { status: 201 });
}
