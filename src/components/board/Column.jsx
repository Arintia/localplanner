/**
 * @file Column.jsx
 * @description A vertical column representing a task status (e.g., Todo, Doing, Done) within a category.
 */

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import TaskCard from './TaskCard';
import { COLUMN_COLORS } from '../../constants/boardConstants';

const Column = ({ 
  column, 
  index, 
  tasks, 
  onAddTask, 
  onEditColumn, 
  onDeleteColumn, 
  activeTimerTaskId,
  setActiveTimerTaskId,
  onTaskAction 
}) => {
  const theme = COLUMN_COLORS.find(c => c.id === column.colorId) || COLUMN_COLORS[0];

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`w-80 flex-shrink-0 flex flex-col rounded-2xl p-3 border transition-all duration-300 ${theme.bg} ${theme.border} shadow-sm`}
          style={{ ...provided.draggableProps.style }}
        >
          {/* Column Header */}
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between mb-4 px-2 group/col cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2 min-w-0">
              <h4 className={`text-sm font-black uppercase tracking-widest truncate ${theme.text}`}>
                {column.title}
              </h4>
              {column.isCompletion && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 ${theme.text}`}>
                {tasks.length}
              </span>
              <button 
                onClick={() => onEditColumn(column)} 
                className="opacity-0 group-hover/col:opacity-100 p-1 text-zinc-400 dark:text-zinc-500 hover:text-blue-500 transition-all"
              >
                <Pencil size={12} />
              </button>
              <button 
                onClick={() => onDeleteColumn(column)} 
                className="opacity-0 group-hover/col:opacity-100 p-1 text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Tasks Area */}
          <Droppable droppableId={column.id} type="task">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`flex-1 space-y-3 min-h-[150px] transition-colors rounded-xl ${
                  snapshot.isDraggingOver ? 'bg-zinc-900/5 dark:bg-white/5' : ''
                }`}
              >
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <TaskCard
                        innerRef={provided.innerRef}
                        draggableProps={provided.draggableProps}
                        dragHandleProps={provided.dragHandleProps}
                        task={task}
                        onToggleComplete={onTaskAction.onToggleComplete}
                        onDelete={onTaskAction.onDelete}
                        onEdit={onTaskAction.onEdit}
                        onView={onTaskAction.onView}
                        onToggleChecklistItem={onTaskAction.onToggleChecklistItem}
                        isActiveTimer={activeTimerTaskId === task.id}
                        onToggleTimer={() => setActiveTimerTaskId(activeTimerTaskId === task.id ? null : task.id)}
                        onSaveTemplate={onTaskAction.onSaveTemplate}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Task Button */}
          <button
            onClick={() => onAddTask(column.id)}
            className={`mt-4 flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all w-full border border-dashed border-transparent hover:border-current ${theme.text} hover:bg-white/40 dark:hover:bg-zinc-800/40`}
          >
            <Plus size={14} /> Add task
          </button>
        </div>
      )}
    </Draggable>
  );
};

export default Column;
