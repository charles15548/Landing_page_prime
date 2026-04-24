import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
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

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/i, "");
}

export function isActivityTrackingEnabled() {
  return process.env.ACTIVITY_TRACKING_ENABLED !== "false";
}

export function getSupabaseAdminClient() {
  if (!isActivityTrackingEnabled()) {
    logServer("supabase_client_skipped_tracking_disabled");
    return null;
  }

  if (cachedClient) {
    logServer("supabase_client_reused");
    return cachedClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    logServer("supabase_client_missing_env", {
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasServiceRoleKey: Boolean(serviceRoleKey),
    });
    return null;
  }

  const normalizedUrl = normalizeSupabaseUrl(supabaseUrl);

  cachedClient = createClient(normalizedUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  logServer("supabase_client_created", { url: normalizedUrl });
  return cachedClient;
}
