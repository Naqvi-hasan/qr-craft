import { required, collectErrors } from "../lib/validators.js";
import { escapeVCard } from "../lib/escape.js";

// Calendar event (iCalendar VEVENT). Phone cameras offer "Add to calendar" when they scan it.
// Times are written as "floating" local time (no time zone), which is what people expect:
// 7 PM on the card = 7 PM in the phone's calendar.

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const compactDate = (d) => d.replace(/-/g, "");
const compactTime = (t) => `${t.replace(":", "")}00`;

function addDays(date, days) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function addHour(date, time) {
  const [h, m] = time.split(":").map(Number);
  if (h < 23) return [date, `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`];
  return [addDays(date, 1), `00:${String(m).padStart(2, "0")}`];
}

export function validateEvent(v) {
  const errors = collectErrors({
    title: required(v.title, "Event name"),
    startDate: required(v.startDate, "Date") || (DATE.test(v.startDate) ? null : "Pick a date"),
    startTime: v.startTime && !TIME.test(v.startTime) ? "Use a time like 19:00" : null,
    endDate: v.endDate && !DATE.test(v.endDate) ? "Pick a date" : null,
    endTime: v.endTime && !TIME.test(v.endTime) ? "Use a time like 21:00" : null,
  });
  if (Object.keys(errors).length) return errors;
  const start = `${v.startDate}T${v.startTime || "00:00"}`;
  const end = `${v.endDate || v.startDate}T${v.endTime || v.startTime || "00:00"}`;
  if ((v.endDate || v.endTime) && end < start) return { endTime: "The event can't end before it starts" };
  return {};
}

export function buildEventPayload(v) {
  const lines = ["BEGIN:VEVENT", `SUMMARY:${escapeVCard(v.title.trim())}`];
  if (v.startTime) {
    const [endDate, endTime] = v.endTime ? [v.endDate || v.startDate, v.endTime] : addHour(v.startDate, v.startTime);
    lines.push(`DTSTART:${compactDate(v.startDate)}T${compactTime(v.startTime)}`, `DTEND:${compactDate(endDate)}T${compactTime(endTime)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${compactDate(v.startDate)}`, `DTEND;VALUE=DATE:${compactDate(addDays(v.endDate || v.startDate, 1))}`);
  }
  if (v.location?.trim()) lines.push(`LOCATION:${escapeVCard(v.location.trim())}`);
  if (v.description?.trim()) lines.push(`DESCRIPTION:${escapeVCard(v.description.trim())}`);
  lines.push("END:VEVENT");
  return lines.join("\n");
}

export default {
  id: "event",
  label: "Event",
  icon: "calendar",
  title: "Add an event to the calendar",
  description: "One scan saves your event, with date, time and place, into the phone's calendar.",
  tip: "Leave the start time empty for an all-day event.",
  fields: [
    { name: "title", label: "Event name", type: "text", placeholder: "Griha Pravesh – Sharma Family", required: true, maxLength: 80 },
    { name: "startDate", label: "Date", type: "date", required: true, half: true },
    { name: "startTime", label: "Start time", type: "time", half: true },
    { name: "endDate", label: "End date (optional)", type: "date", half: true },
    { name: "endTime", label: "End time (optional)", type: "time", half: true },
    { name: "location", label: "Place", type: "text", placeholder: "B-204, Green Park, Pune", maxLength: 120 },
    { name: "description", label: "Details (optional)", type: "textarea", placeholder: "Lunch from 12:30 PM", maxLength: 300 },
  ],
  initialValues: { title: "", startDate: "", startTime: "", endDate: "", endTime: "", location: "", description: "" },
  validate: validateEvent,
  buildPayload: buildEventPayload,
};
