/**
 * @file CalendarView.jsx
 * @description Premium cross-project calendar grid with global task aggregation and drag-and-drop scheduling.
 */

import React, { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isToday,
  addDays,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Plus,
  MoreHorizontal,
  Sparkles,
  Filter,
  Search,
  X,
  Download,
  Info,
  ExternalLink,
} from "lucide-react";
import { exportTasksToICS } from "../../utils/icsExporter";
import toast from "react-hot-toast";

const CalendarView = ({
  tasks,
  projects,
  categories,
  columns,
  onTaskClick,
  updateTask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSyncInfo, setShowSyncInfo] = useState(false);

  // --- LOGIC: AGGREGATE TASKS ---
  // Filter only tasks that belong to an existing project
  const validTasks = useMemo(() => {
    return tasks.filter((t) => {
      const col = columns.find((c) => c.id === t.columnId);
      const cat = categories.find((c) => c.id === col?.categoryId);
      return projects.some((p) => p.id === cat?.projectId);
    });
  }, [tasks, columns, categories, projects]);

  const tasksWithDeadlines = useMemo(() => {
    return validTasks.filter((t) => t.deadline);
  }, [validTasks]);

  const unscheduledTasks = useMemo(() => {
    return validTasks.filter(
      (t) =>
        !t.deadline &&
        (t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [validTasks, searchQuery]);

  // Helper to find project name for a task
  const getProjectName = (task) => {
    const col = columns.find((c) => c.id === task.columnId);
    const cat = categories.find((c) => c.id === col?.categoryId);
    const proj = projects.find((p) => p.id === cat?.projectId);
    return proj?.name || "Unknown Project";
  };

  // --- CALENDAR GRID LOGIC ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // --- DRAG AND DROP HANDLERS ---
  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (e, date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      updateTask(taskId, { deadline: format(date, "yyyy-MM-dd") });
      toast.success("Task scheduled");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleSyncGCal = () => {
    if (tasksWithDeadlines.length === 0) {
      toast.error("No tasks with deadlines to export");
      return;
    }

    try {
      exportTasksToICS(tasksWithDeadlines);
      toast.success("ICS file generated successfully!", {
        duration: 4000,
        icon: <Sparkles className="text-amber-500" size={16} />,
      });
    } catch (err) {
      toast.error("Failed to generate export file");
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white dark:bg-zinc-950 animate-in fade-in duration-500">
      {/* LEFT SIDEBAR: UNSCHEDULED DRAWER */}
      <aside className="w-80 border-r border-zinc-100 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/20 backdrop-blur-3xl">
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                Queue
              </h3>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                Unscheduled Tasks
              </p>
            </div>
            <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Layers className="text-white dark:text-zinc-900" size={18} />
            </div>
          </div>

          <div className="relative mb-6">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Filter queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar space-y-3">
          {unscheduledTasks.length > 0 ? (
            unscheduledTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => onDragStart(e, task.id)}
                onClick={() => onTaskClick(task)}
                className="group p-4 bg-white dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-200 line-clamp-2 leading-relaxed uppercase tracking-tight">
                    {task.text}
                  </h4>
                  <div
                    className={`shrink-0 w-2 h-2 rounded-full mt-1 ${task.priority === "high" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-zinc-300 dark:bg-zinc-600"}`}
                  ></div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    {getProjectName(task)}
                  </span>
                  <ArrowUpRight
                    size={10}
                    className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <Sparkles
                size={32}
                className="text-zinc-200 dark:text-zinc-800 mb-4"
              />
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-relaxed">
                No unscheduled tasks, yay!
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CALENDAR GRID */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Calendar Header */}
        <header className="p-8 pb-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter tabular-nums">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-zinc-900 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-zinc-900 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onMouseEnter={() => setShowSyncInfo(true)}
              onMouseLeave={() => setShowSyncInfo(false)}
              onClick={handleSyncGCal}
              className="group flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-zinc-200 dark:shadow-none"
            >
              <Download
                size={16}
                className="group-hover:translate-y-0.5 transition-transform"
              />
              Export to Calendar (.ics)
            </button>
          </div>
        </header>

        {/* Sync Info Tooltip/Box */}
        {showSyncInfo && (
          <div className="absolute top-24 right-8 z-50 w-72 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4 text-blue-500">
              <Info size={18} />
              <h4 className="text-xs font-black uppercase tracking-widest">
                How Syncing Works
              </h4>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Clicking the export button generates a{" "}
              <strong>standardized .ics file</strong> containing all your
              deadlines. You can use the generated file to sync your calendars.
              <br />
              <br />
              To sync with Google Calendar:
              <br />
              1. Download the file.
              <br />
              2. Open Google Calendar.
              <br />
              3. Go to <strong>Settings &gt; Import & Export</strong>.
              <br />
              4. Upload this file to your calendar.
            </p>
          </div>
        )}

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-4 text-center">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto custom-scrollbar">
          {days.map((day, idx) => {
            const dayTasks = tasksWithDeadlines.filter((t) =>
              isSameDay(parseISO(t.deadline), day),
            );
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);

            return (
              <div
                key={idx}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, day)}
                className={`min-h-[140px] border-r border-b border-zinc-100 dark:border-zinc-800 p-3 transition-all flex flex-col group/day relative ${
                  isCurrentMonth
                    ? "bg-transparent"
                    : "bg-zinc-50/30 dark:bg-zinc-900/10"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-black tabular-nums transition-all ${
                      isTodayDate
                        ? "w-7 h-7 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg flex items-center justify-center scale-110 shadow-lg"
                        : isCurrentMonth
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-300 dark:text-zinc-700"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[9px] font-black text-zinc-400 tabular-nums uppercase">
                      {dayTasks.length} Events
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={`group/task px-3 py-2 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                        task.priority === "high"
                          ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 hover:border-rose-300 shadow-sm shadow-rose-500/10"
                          : "bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {task.priority === "high" && (
                          <AlertTriangle size={8} className="text-rose-500" />
                        )}
                        <p
                          className={`text-[10px] font-bold truncate leading-tight tracking-tight uppercase ${
                            task.priority === "high"
                              ? "text-rose-700 dark:text-rose-400"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {task.text}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest truncate max-w-[80%]">
                          {getProjectName(task)}
                        </span>
                        <ChevronRight
                          size={10}
                          className="text-zinc-300 group-hover/task:translate-x-0.5 transition-transform"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Drop Highlight */}
                <div className="absolute inset-1 rounded-2xl border-2 border-dashed border-zinc-900 dark:border-white opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
