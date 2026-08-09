const DAY_CODES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SLOT_MINUTES = 30;

export function dayCodeForDate(dateStr) {
  if (!dateStr) return null;
  return DAY_CODES[new Date(`${dateStr}T00:00:00`).getDay()];
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Splits every availability window for the given day into half-hour slots,
// e.g. 09:00-11:00 becomes ["09:00", "09:30", "10:00", "10:30"].
export function slotsForDay(availability, dayCode) {
  const windows = (availability || []).filter((a) => a.day === dayCode);
  const slots = [];
  for (const { startTime, endTime } of windows) {
    let cursor = toMinutes(startTime);
    const end = toMinutes(endTime);
    while (cursor + SLOT_MINUTES <= end) {
      slots.push(toHHMM(cursor));
      cursor += SLOT_MINUTES;
    }
  }
  return [...new Set(slots)].sort();
}

export function formatSlotLabel(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
