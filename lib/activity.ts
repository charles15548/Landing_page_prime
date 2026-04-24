export const ACTIVITY_EVENTS = {
  VISIT: "visit",
  DOWNLOAD_CLICK: "download_click",
} as const;

export type ActivityEventType =
  (typeof ACTIVITY_EVENTS)[keyof typeof ACTIVITY_EVENTS];

export const EVENT_TYPE_CODE: Record<ActivityEventType, 1 | 2> = {
  [ACTIVITY_EVENTS.VISIT]: 1,
  [ACTIVITY_EVENTS.DOWNLOAD_CLICK]: 2,
};

export const DOWNLOAD_SOURCES = ["hero_cta", "footer_badge"] as const;

export type DownloadSource = (typeof DOWNLOAD_SOURCES)[number];

export function isActivityEventType(value: unknown): value is ActivityEventType {
  return value === ACTIVITY_EVENTS.VISIT || value === ACTIVITY_EVENTS.DOWNLOAD_CLICK;
}

export function isDownloadSource(value: unknown): value is DownloadSource {
  return (
    typeof value === "string" &&
    (DOWNLOAD_SOURCES as readonly string[]).includes(value)
  );
}
