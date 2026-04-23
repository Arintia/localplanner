/**
 * @file TaskCard.jsx
 * @description Premium Kanban task card with interactive checklist and productivity timer.
 */

import React from 'react';
import { Circle, CheckCircle2, AlertTriangle, Calendar, Trash2, Pencil, Repeat, Clock, Play, Pause, Check, Save } from 'lucide-react';
import { formatTime } from '../../utils/formatters';

const TaskCard = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onView,
  onToggleChecklistItem,
  isActiveTimer,
  onToggleTimer,
  onSaveTemplate,
  innerRef,
  draggableProps,
  dragHandleProps
}) => {
  // Check for deadline status
  let isOverdue = false;
  let isEndingSoon = false;
  if (task.deadline && !task.isCompleted) {
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) isOverdue = true;
    else if (diffDays <= 2) isEndingSoon = true;
  }

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      style={{ ...draggableProps?.style }}
      className={`group relative bg-white dark:bg-zinc-900 border ${isOverdue ? 'border-red-200 dark:border-red-900/50' : 'border-zinc-200 dark:border-zinc-800'
        } rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-grab active:cursor-grabbing`}
    >
      {/* Timer Overlay */}
      {isActiveTimer && (
        <div className="absolute top-0 right-0 h-full w-1.5 bg-zinc-900 dark:bg-white rounded-r-xl animate-pulse"></div>
      )}

      {/* Task Content */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`mt-0.5 flex-shrink-0 transition-colors ${task.isCompleted ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-zinc-400'
            }`}
        >
          {task.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>

        <div className="flex-1 min-w-0" onClick={() => onView(task)}>
          <h4 className={`text-sm font-semibold truncate leading-snug transition-all ${task.isCompleted ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-zinc-800 dark:text-zinc-200'}`}>
            {task.text}
          </h4>

          {/* Inline Checklist */}
          {task.checklist && task.checklist.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {task.checklist.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-2 group/check cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onToggleChecklistItem(task.id, item.id); }}
                >
                  <div className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${
                    item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-300 dark:border-zinc-700 group-hover/check:border-zinc-400'
                  }`}>
                    {item.completed && <Check size={10} className="text-white" />}
                  </div>
                  <span className={`text-[11px] truncate transition-all ${item.completed ? 'text-zinc-400 line-through' : 'text-zinc-600 dark:text-zinc-400'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {task.checklist && task.checklist.length > 0 && (
              <div className="flex items-center gap-2 w-full mb-1">
                <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      task.checklist.filter(i => i.completed).length === task.checklist.length ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(task.checklist.filter(i => i.completed).length / task.checklist.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[9px] font-black text-zinc-400 tabular-nums">
                  {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                </span>
              </div>
            )}

            {task.trackedTime > 0 && (
              <span className={`flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                isActiveTimer ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
              }`}>
                <Clock size={10} /> {formatTime(task.trackedTime)}
              </span>
            )}
            
            {task.priority === 'high' && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase tracking-wider rounded-md border border-rose-100 dark:border-rose-900/30">
                <AlertTriangle size={10} /> High
              </span>
            )}

            {task.deadline && (
              <span className={`flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${isOverdue
                ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 animate-pulse'
                : isEndingSoon
                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                }`}>
                <Calendar size={10} /> {task.deadline}
              </span>
            )}

            {task.recurrence && task.recurrence !== 'none' && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-wider rounded-md border border-zinc-200 dark:border-zinc-700">
                <Repeat size={10} /> {task.recurrence}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleTimer(); }} 
          className={`p-1.5 border rounded-lg shadow-sm hover:shadow transition-all ${
            isActiveTimer 
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900' 
              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-emerald-500'
          }`}
          title={isActiveTimer ? "Pause Timer" : "Start Timer"}
        >
          {isActiveTimer ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSaveTemplate(task); }}
          className="p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-400 hover:text-amber-500 shadow-sm hover:shadow transition-all"
          title="Save as Template"
        >
          <Save size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          className="p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-400 hover:text-blue-500 shadow-sm hover:shadow transition-all"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-400 hover:text-red-500 shadow-sm hover:shadow transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
