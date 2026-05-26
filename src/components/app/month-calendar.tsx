"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CalendarEvent = {
  id: string;
  type: string;
  title: string;
  property: string;
  href: string;
  status: string;
  tone: string;
  dateKey?: string | null;
};

const TONE_CLASSES: Record<string, string> = {
  danger: "bg-error/10 text-error border-error/20",
  success: "bg-secondary/10 text-secondary border-secondary/20",
  info: "bg-secondary-container text-on-secondary-container border-secondary/20",
  neutral: "bg-surface-container text-on-surface-variant border-outline-variant/40",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendar({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const firstEventDate = events.find((event) => event.dateKey)?.dateKey;
  const initialDate = firstEventDate ? new Date(`${firstEventDate}T12:00:00`) : today;
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Map events to the days they fall in the current month
  const eventsByDay: Record<number, CalendarEvent[]> = {};
  for (const event of events) {
    if (!event.dateKey) continue;
    const d = new Date(`${event.dateKey}T12:00:00`);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      eventsByDay[day] = eventsByDay[day] ? [...eventsByDay[day], event] : [event];
    }
  }

  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  const rows: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const isToday = (day: number) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-primary">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
            onClick={prevMonth}
            type="button"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
            onClick={nextMonth}
            type="button"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 border-b border-outline-variant/50 pb-2 mb-1">
            {DAYS.map((d) => (
              <div className="text-center text-xs font-bold uppercase text-on-surface-variant" key={d}>
                {d}
              </div>
            ))}
          </div>
          {rows.map((row, rowIdx) => (
            <div className="grid grid-cols-7 border-b border-outline-variant/20" key={rowIdx}>
              {row.map((cell, cellIdx) => {
                const cellEvents = cell.day ? (eventsByDay[cell.day] ?? []) : [];
                return (
                  <div
                    className={`min-h-[88px] border-r border-outline-variant/20 p-1.5 last:border-r-0 ${
                      cell.day && isToday(cell.day) ? "bg-primary-container/10" : ""
                    }`}
                    key={cellIdx}
                  >
                    {cell.day ? (
                      <>
                        <span
                          className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                            isToday(cell.day)
                              ? "bg-secondary text-on-secondary"
                              : "text-on-surface"
                          }`}
                        >
                          {cell.day}
                        </span>
                        {cellEvents.slice(0, 3).map((event) => (
                          <Link
                            className={`mb-0.5 block truncate rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${TONE_CLASSES[event.tone] ?? TONE_CLASSES.neutral}`}
                            href={event.href}
                            key={`${event.type}-${event.id}`}
                            title={`${event.type}: ${event.title} — ${event.property}`}
                          >
                            {event.title}
                          </Link>
                        ))}
                        {cellEvents.length > 3 ? (
                          <span className="text-[10px] text-on-surface-variant">
                            +{cellEvents.length - 3} more
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {Object.keys(eventsByDay).length === 0 && (
        <p className="mt-4 text-center text-sm text-on-surface-variant">
          No scheduled events this month.
        </p>
      )}
    </div>
  );
}
