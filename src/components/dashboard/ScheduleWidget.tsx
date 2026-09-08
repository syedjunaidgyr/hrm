"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Calendar,
  Trash2,
  CheckCircle2,
  X,
  UserCheck,
} from "lucide-react";

export interface ScheduleEvent {
  id: string;
  dateStr: string; // YYYY-MM-DD
  time: string; // e.g., "09:00"
  duration?: string; // e.g., "09:30am - 10:00am"
  title: string;
  subtitle: string;
  type: "interview" | "review" | "meeting" | "evaluation";
  candidateId?: string;
  isCustom?: boolean;
}

export interface ScheduleWidgetProps {
  title?: string;
  role: "ADMIN" | "VENDOR";
  viewAllHref?: string;
  initialSubmissions?: Array<{
    id: string;
    status: string;
    candidateName: string;
    candidateId?: string;
    jobTitle?: string;
    jobCode?: string;
    vendorName?: string;
    createdAt?: Date | string;
  }>;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekDays(baseDate: Date): Date[] {
  const current = new Date(baseDate);
  const day = current.getDay(); // 0 = Sunday
  const sunday = new Date(current);
  sunday.setDate(current.getDate() - day);
  sunday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    days.push(d);
  }
  return days;
}

export const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({
  title = "Recruitment Schedule",
  role,
  viewAllHref = role === "ADMIN" ? "/admin/candidates" : "/vendor/candidates",
  initialSubmissions = [],
}) => {
  const [mounted, setMounted] = useState(false);
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New event form state
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newEndTime, setNewEndTime] = useState("11:00");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newType, setNewType] = useState<ScheduleEvent["type"]>("interview");

  const todayStr = useMemo(() => formatDateKey(new Date()), []);
  const selectedDateStr = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  const weekDays = useMemo(() => getWeekDays(currentWeekDate), [currentWeekDate]);

  // Storage key based on role
  const storageKey = `portal_schedule_events_${role.toLowerCase()}`;

  // Initialize events
  useEffect(() => {
    setMounted(true);

    const now = new Date();
    const todayK = formatDateKey(now);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowK = formatDateKey(tomorrow);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayK = formatDateKey(yesterday);

    const dayAfter = new Date(now);
    dayAfter.setDate(now.getDate() + 2);
    const dayAfterK = formatDateKey(dayAfter);

    // Default seeded events for current week
    const defaultEvents: ScheduleEvent[] =
      role === "ADMIN"
        ? [
            {
              id: "seed-1",
              dateStr: todayK,
              time: "09:00",
              duration: "09:30am - 10:00am",
              title: "Vendor Resume Review",
              subtitle: "ABC Technologies • 5 Profiles",
              type: "review",
            },
            {
              id: "seed-2",
              dateStr: todayK,
              time: "10:30",
              duration: "10:30am - 11:30am",
              title: "Task Review With Hiring Team",
              subtitle: "Frontend Lead Evaluation",
              type: "meeting",
            },
            {
              id: "seed-3",
              dateStr: todayK,
              time: "12:00",
              duration: "12:00pm - 01:00pm",
              title: "Candidate Evaluation Meeting",
              subtitle: "Engineering Director Sync",
              type: "evaluation",
            },
            {
              id: "seed-4",
              dateStr: tomorrowK,
              time: "11:00",
              duration: "11:00am - 11:45am",
              title: "Technical Interview Round 1",
              subtitle: "Full Stack Developer Assessment",
              type: "interview",
            },
            {
              id: "seed-5",
              dateStr: tomorrowK,
              time: "15:00",
              duration: "03:00pm - 03:45pm",
              title: "Vendor Intake Briefing",
              subtitle: "Apex Global Solutions • New JDs",
              type: "meeting",
            },
            {
              id: "seed-6",
              dateStr: dayAfterK,
              time: "14:00",
              duration: "02:00pm - 03:00pm",
              title: "Final Placement Offer Review",
              subtitle: "HR & Talent Operations",
              type: "evaluation",
            },
            {
              id: "seed-7",
              dateStr: yesterdayK,
              time: "16:00",
              duration: "04:00pm - 04:30pm",
              title: "Weekly Screening Debrief",
              subtitle: "Recruitment Leadership",
              type: "meeting",
            },
          ]
        : [
            {
              id: "seed-v-1",
              dateStr: todayK,
              time: "09:00",
              duration: "09:30am - 10:00am",
              title: "Candidate Feedback Evaluation",
              subtitle: "Client Review for Senior Engineer",
              type: "evaluation",
            },
            {
              id: "seed-v-2",
              dateStr: todayK,
              time: "10:30",
              duration: "10:30am - 11:30am",
              title: "Technical Interview Round",
              subtitle: "Candidate Screening Call",
              type: "interview",
            },
            {
              id: "seed-v-3",
              dateStr: todayK,
              time: "12:00",
              duration: "12:00pm - 01:00pm",
              title: "Final Candidate Placement Sync",
              subtitle: "Account Manager & Admin Call",
              type: "meeting",
            },
            {
              id: "seed-v-4",
              dateStr: tomorrowK,
              time: "14:00",
              duration: "02:00pm - 02:45pm",
              title: "Candidate Resume Submission Follow-up",
              subtitle: "Cloud Architect Profile Sync",
              type: "review",
            },
            {
              id: "seed-v-5",
              dateStr: dayAfterK,
              time: "10:00",
              duration: "10:00am - 10:45am",
              title: "Interview Prep with Candidate",
              subtitle: "Briefing for System Design Round",
              type: "interview",
            },
          ];

    // Load any custom events saved in localStorage
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge custom items with defaults (custom items won't collide by ID)
          const merged = [...defaultEvents, ...parsed.filter((p: ScheduleEvent) => p.isCustom)];
          setEvents(merged);
          return;
        }
      }
    } catch {
      // ignore
    }

    setEvents(defaultEvents);
  }, [role, storageKey]);

  // Filter events for the currently selected date
  const eventsForSelectedDate = useMemo(() => {
    return events
      .filter((e) => e.dateStr === selectedDateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDateStr]);

  // Set of dates that have events
  const datesWithEvents = useMemo(() => {
    return new Set(events.map((e) => e.dateStr));
  }, [events]);

  // Navigation handlers
  const handlePrevWeek = () => {
    const next = new Date(currentWeekDate);
    next.setDate(next.getDate() - 7);
    setCurrentWeekDate(next);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekDate);
    next.setDate(next.getDate() + 7);
    setCurrentWeekDate(next);
  };

  const handleTodayJump = () => {
    const now = new Date();
    setCurrentWeekDate(now);
    setSelectedDate(now);
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDate(new Date(day));
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvent: ScheduleEvent = {
      id: `custom-${Date.now()}`,
      dateStr: selectedDateStr,
      time: newTime,
      duration: `${newTime} - ${newEndTime}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || (role === "ADMIN" ? "Scheduled Session" : "Candidate Sync"),
      type: newType,
      isCustom: true,
    };

    const updated = [...events, newEvent];
    setEvents(updated);

    try {
      const customEvents = updated.filter((item) => item.isCustom);
      localStorage.setItem(storageKey, JSON.stringify(customEvents));
    } catch {
      // ignore
    }

    // Reset and close
    setNewTitle("");
    setNewSubtitle("");
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    try {
      const customEvents = updated.filter((item) => item.isCustom);
      localStorage.setItem(storageKey, JSON.stringify(customEvents));
    } catch {
      // ignore
    }
  };

  // Month label for the current week header
  const weekMonthYearLabel = useMemo(() => {
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    if (firstDay.getMonth() === lastDay.getMonth()) {
      return `${MONTH_NAMES[firstDay.getMonth()]} ${firstDay.getFullYear()}`;
    }
    return `${MONTH_NAMES[firstDay.getMonth()]} - ${MONTH_NAMES[lastDay.getMonth()]} ${lastDay.getFullYear()}`;
  }, [weekDays]);

  const selectedDayFullLabel = useMemo(() => {
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, [selectedDate]);

  return (
    <div className="bg-white rounded-[32px] p-6 border border-slate-200/60 shadow-xs space-y-5">
      {/* Widget Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-extrabold text-[#1A1A1A] tracking-tight">{title}</h3>
          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{weekMonthYearLabel}</p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Week Navigation */}
          <button
            type="button"
            onClick={handlePrevWeek}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            title="Previous Week"
            aria-label="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleTodayJump}
            className="px-2.5 py-1 rounded-full border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            title="Jump to Today"
          >
            Today
          </button>

          <button
            type="button"
            onClick={handleNextWeek}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            title="Next Week"
            aria-label="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <Link
            href={viewAllHref}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all ml-1"
            title="View Candidates"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Interactive Day Selector Strip */}
      <div className="flex items-center justify-between text-center border-b border-slate-100 pb-3.5">
        {weekDays.map((dayDate, idx) => {
          const dayKey = formatDateKey(dayDate);
          const isSelected = selectedDateStr === dayKey;
          const isToday = todayStr === dayKey;
          const hasEvents = datesWithEvents.has(dayKey);
          const dayName = DAY_NAMES[dayDate.getDay()];
          const dateNum = dayDate.getDate();

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => handleSelectDay(dayDate)}
              className={`group relative flex flex-col items-center justify-center py-2 px-2.5 sm:px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-[#1E1E1E] text-white shadow-md scale-105"
                  : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSelected ? "text-slate-300" : "text-slate-400 group-hover:text-slate-700"
                }`}
              >
                {dayName}
              </span>
              <span
                className={`text-sm mt-0.5 font-extrabold ${
                  isSelected ? "text-white" : "text-slate-700 group-hover:text-slate-900"
                }`}
              >
                {dateNum}
              </span>

              {/* Event indicator dot */}
              <div className="h-1.5 flex items-center justify-center mt-1">
                {hasEvents && (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? "bg-[#FDD868]" : "bg-slate-400 group-hover:bg-[#1E1E1E]"
                    }`}
                  />
                )}
              </div>

              {/* Subtle badge if today */}
              {isToday && !isSelected && (
                <span className="absolute -top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Status & Add Event Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">{selectedDayFullLabel}</span>
          <span className="text-[11px] font-semibold text-slate-400">
            • {eventsForSelectedDate.length}{" "}
            {eventsForSelectedDate.length === 1 ? "Event" : "Events"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-[11px] font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-all cursor-pointer"
        >
          <Plus className="w-3 h-3" /> Add Event
        </button>
      </div>

      {/* Timeline Items for the selected day */}
      <div className="space-y-3 min-h-[160px]">
        {eventsForSelectedDate.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <Clock className="w-7 h-7 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">No events scheduled</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              There are no meetings or reviews scheduled for this date.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E1E1E] text-white text-[11px] font-extrabold hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3 h-3" /> Schedule Event
            </button>
          </div>
        ) : (
          eventsForSelectedDate.map((event, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;

            return (
              <div key={event.id} className="group flex items-start gap-3">
                {/* Time Badge */}
                <span
                  className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold shrink-0 mt-1 transition-all ${
                    isFirst
                      ? "bg-[#1E1E1E] text-white shadow-2xs"
                      : isSecond
                      ? "border border-slate-300 bg-white text-slate-700 shadow-2xs"
                      : "bg-[#FDD868] text-slate-900 font-black shadow-2xs"
                  }`}
                >
                  {event.time}
                </span>

                {/* Event Card */}
                <div
                  className={`flex-1 p-3.5 rounded-2xl space-y-1 relative transition-all border ${
                    isFirst
                      ? "bg-[#1E1E1E] text-white border-transparent"
                      : isSecond
                      ? "bg-slate-50 border-slate-200/80 text-slate-900"
                      : "bg-white border-slate-200 text-slate-900 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-xs font-extrabold leading-snug ${
                        isFirst ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {event.title}
                    </p>

                    {event.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event.id)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-500/20 text-red-500 cursor-pointer`}
                        title="Delete event"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <p
                    className={`text-[10px] leading-normal ${
                      isFirst ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {event.duration ? `${event.duration} • ` : ""}
                    {event.subtitle}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-[#1A1A1A]">Schedule New Event</h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedDayFullLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Interview Round 2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ScheduleEvent["type"])}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white"
                >
                  <option value="interview">Candidate Interview</option>
                  <option value="review">Resume / Profile Review</option>
                  <option value="evaluation">Evaluation & Feedback</option>
                  <option value="meeting">Team / Vendor Sync Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Participant / Company / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Candidate: John Doe • ABC Technologies"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#1E1E1E] hover:bg-slate-800 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
