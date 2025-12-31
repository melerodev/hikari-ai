export const cls = (...c) => c.filter(Boolean).join(" ")

export function timeAgo(date) {
  if (!date || isNaN(new Date(date).getTime())) {
    return "just now"
  }

  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const sec = Math.max(1, Math.floor((now - d) / 1000))

  if (!isFinite(sec)) {
    return "just now"
  }

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
  const ranges = [
    [3600, "minutes"], // less than 1 hour -> show minutes
    [86400, "hours"], // less than 1 day -> show hours
    [604800, "days"], // less than 1 week -> show days
    [2629800, "weeks"], // less than 1 month -> show weeks
    [31557600, "months"], // less than 1 year -> show months
  ]

  if (sec < 60) {
    return rtf.format(0, "minutes") // "hace 0 minutos" or "0 minutes ago"
  }

  let unit = "years"
  let value = -Math.floor(sec / 31557600)
  for (const [limit, u] of ranges) {
    if (sec < limit) {
      unit = u
      const div =
        unit === "minutes"
          ? 60
          : unit === "hours"
            ? 3600
            : unit === "days"
              ? 86400
              : unit === "weeks"
                ? 604800
                : 2629800
      value = -Math.floor(sec / div)
      break
    }
  }
  return rtf.format(value, /** @type {Intl.RelativeTimeFormatUnit} */ (unit))
}

export const makeId = (p) => `${p}${Math.random().toString(36).slice(2, 10)}`
