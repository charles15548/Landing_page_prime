"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useEffect } from "react";
import { ACTIVITY_EVENTS, type DownloadSource } from "@/lib/activity";

const STORAGE_KEY = "prime_landing_session_id";
const FIRST_VISIT_KEY = "prime_landing_first_visit_recorded";
const ENDPOINT = process.env.NEXT_PUBLIC_ACTIVITY_ENDPOINT ?? "/api/activity";
const TRACKING_ENABLED = process.env.NEXT_PUBLIC_ACTIVITY_ENABLED !== "false";
const DEBUG_LOGS = process.env.NEXT_PUBLIC_ACTIVITY_DEBUG_LOGS === "true";

type TrackingMetadata = Record<string, unknown>;
type DeliveryMode = "fetch" | "beacon";

type NavigatorWithExtras = Navigator & {
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  mozConnection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  webkitConnection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  deviceMemory?: number;
};

function logClient(step: string, details?: unknown) {
  if (!DEBUG_LOGS) {
    return;
  }

  if (typeof details === "undefined") {
    console.info(`[activity][client] ${step}`);
    return;
  }

  console.info(`[activity][client] ${step}`, details);
}

function getSessionId() {
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) {
    logClient("session_reused", { sessionId: existing });
    return existing;
  }

  const generated =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(STORAGE_KEY, generated);
  logClient("session_created", { sessionId: generated });
  return generated;
}

function getUtmData(currentUrl: URL) {
  return {
    utm_source: currentUrl.searchParams.get("utm_source"),
    utm_medium: currentUrl.searchParams.get("utm_medium"),
    utm_campaign: currentUrl.searchParams.get("utm_campaign"),
    utm_term: currentUrl.searchParams.get("utm_term"),
    utm_content: currentUrl.searchParams.get("utm_content"),
    gclid: currentUrl.searchParams.get("gclid"),
    fbclid: currentUrl.searchParams.get("fbclid"),
    msclkid: currentUrl.searchParams.get("msclkid"),
  };
}

function getClientContext() {
  const nav = navigator as NavigatorWithExtras;
  const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
  const currentUrl = new URL(window.location.href);
  const navigationEntry = performance
    .getEntriesByType("navigation")
    .find((entry): entry is PerformanceNavigationTiming => entry instanceof PerformanceNavigationTiming);

  return {
    session_id: getSessionId(),
    locale: navigator.language,
    locales: navigator.languages,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer || null,
    page: {
      href: currentUrl.href,
      path: currentUrl.pathname,
      query: currentUrl.search,
      hash: currentUrl.hash,
      title: document.title,
      visibility_state: document.visibilityState,
      history_length: window.history.length,
      ...getUtmData(currentUrl),
    },
    device: {
      platform: navigator.platform,
      user_agent: navigator.userAgent,
      cookie_enabled: navigator.cookieEnabled,
      do_not_track: navigator.doNotTrack,
      hardware_concurrency: navigator.hardwareConcurrency,
      max_touch_points: navigator.maxTouchPoints,
      device_memory_gb: nav.deviceMemory ?? null,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        avail_width: window.screen.availWidth,
        avail_height: window.screen.availHeight,
        color_depth: window.screen.colorDepth,
        pixel_depth: window.screen.pixelDepth,
      },
      viewport: {
        inner_width: window.innerWidth,
        inner_height: window.innerHeight,
        outer_width: window.outerWidth,
        outer_height: window.outerHeight,
        device_pixel_ratio: window.devicePixelRatio,
      },
      network: {
        effective_type: connection?.effectiveType ?? null,
        downlink_mbps: connection?.downlink ?? null,
        rtt_ms: connection?.rtt ?? null,
        save_data: connection?.saveData ?? null,
      },
    },
    performance: navigationEntry
      ? {
          navigation_type: navigationEntry.type,
          dom_content_loaded_ms: Math.round(navigationEntry.domContentLoadedEventEnd),
          load_event_end_ms: Math.round(navigationEntry.loadEventEnd),
          transfer_size_bytes: navigationEntry.transferSize,
          encoded_body_size_bytes: navigationEntry.encodedBodySize,
          decoded_body_size_bytes: navigationEntry.decodedBodySize,
          redirect_count: navigationEntry.redirectCount,
        }
      : null,
  };
}

async function sendActivityEvent(
  eventType: (typeof ACTIVITY_EVENTS)[keyof typeof ACTIVITY_EVENTS],
  metadata: TrackingMetadata = {},
  mode: DeliveryMode,
) {
  if (!TRACKING_ENABLED) {
    logClient("tracking_disabled_by_env");
    return;
  }

  const eventId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const clientContext = getClientContext();

  const payload = {
    eventId,
    eventType,
    pageUrl: window.location.href,
    metadata: {
      ...clientContext,
      ...metadata,
      client_event_id: eventId,
      client_timestamp: new Date().toISOString(),
    },
  };

  logClient("event_prepared", {
    eventType,
    eventId,
    mode,
    endpoint: ENDPOINT,
  });

  const payloadString = JSON.stringify(payload);

  if (mode === "beacon" && typeof navigator.sendBeacon === "function") {
    const body = new Blob([payloadString], { type: "application/json" });
    const sent = navigator.sendBeacon(ENDPOINT, body);
    logClient("beacon_attempt", { eventType, eventId, sent });

    if (sent) {
      logClient("event_sent_success", { eventType, eventId, transport: "beacon" });
      return;
    }
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payloadString,
      keepalive: true,
      cache: "no-store",
    });

    logClient("fetch_response", {
      eventType,
      eventId,
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      const text = await response.text();
      logClient("fetch_failed_body", { eventType, eventId, body: text.slice(0, 500) });
    }
  } catch (error) {
    logClient("fetch_error", {
      eventType,
      eventId,
      error: error instanceof Error ? error.message : String(error),
    });
    return;
  }
}

export function ActivityTracker() {
  useEffect(() => {
    const firstVisitRecorded =
      window.localStorage.getItem(FIRST_VISIT_KEY) === "true";
    if (!firstVisitRecorded) {
      window.localStorage.setItem(FIRST_VISIT_KEY, "true");
    }

    void sendActivityEvent(
      ACTIVITY_EVENTS.VISIT,
      {
        first_visit_on_device: !firstVisitRecorded,
      },
      "fetch",
    );
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      logClient("visibility_changed", { state: document.visibilityState });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}

type DownloadTrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  source: DownloadSource;
};

export function DownloadTrackedLink({
  source,
  onClick,
  ...props
}: DownloadTrackedLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const href = typeof props.href === "string" ? props.href : null;
    logClient("download_click_detected", { source, href });

    void sendActivityEvent(
      ACTIVITY_EVENTS.DOWNLOAD_CLICK,
      {
        download_source: source,
        download_url: href,
        click_text:
          typeof event.currentTarget.textContent === "string"
            ? event.currentTarget.textContent.trim()
            : null,
      },
      "beacon",
    );

    onClick?.(event);
  };

  return <a {...props} onClick={handleClick} />;
}
