/**
 * @file Board.jsx
 * @description The main board area which renders categories, columns, and tasks in a draggable grid.
 */

import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus,
  Trash2,
  Maximize2,
  Search,
  Filter,
  Clock,
  Pencil,
} from "lucide-react";
import Column from "./Column";

const Board = ({
  activeProject,
  categories,
  columns,
  tasks,
  filteredTasks,
  filters,
  setFilters,
  zenModeCategoryId,
  setZenModeCategoryId,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddColumn,
  onEditColumn,
  onDeleteColumn,
  onAddTask,
  activeTimerTaskId,
  setActiveTimerTaskId,
  onTaskAction,
}) => {
  if (!activeProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <Plus size={32} className="text-zinc-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          No Project Selected
        </h3>
        <p className="text-sm text-zinc-500 max-w-xs text-center">
          Select an existing project from the sidebar or create a new one to
          begin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Board Header / Project Info - FIXED at top */}
      <div className="p-8 pb-0">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
              {zenModeCategoryId
                ? categories.find((c) => c.id === zenModeCategoryId)?.title
                : activeProject.name}
            </h2>
            {!zenModeCategoryId && activeProject.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                {activeProject.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {zenModeCategoryId
                  ? "Focus Mode"
                  : `${categories.length} Categories`}
              </span>
              {!zenModeCategoryId && (
                <>
                  <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    {
                      tasks.filter((t) => {
                        const col = columns.find((c) => c.id === t.columnId);
                        const cat = categories.find(
                          (c) => c.id === col?.categoryId,
                        );
                        return cat?.projectId === activeProject.id;
                      }).length
                    }{" "}
                    Tasks in Project
                  </span>
                </>
              )}
            </div>
          </div>

          {!zenModeCategoryId && (
            <div className="flex items-center gap-3">
              <button
                onClick={onAddCategory}
                className="flex items-center gap-2 px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all shadow-sm"
              >
                <Plus size={16} /> Category
              </button>
              <button
                onClick={() => onAddColumn(categories[0]?.id)}
                disabled={categories.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-zinc-200 dark:shadow-none disabled:opacity-50"
              >
                <Plus size={16} /> Column
              </button>
            </div>
          )}
        </div>

        {/* Filters & Search - FIXED below header */}
        <div className="flex flex-wrap items-center gap-4 mb-6 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 backdrop-blur-sm">
          <div className="flex-1 min-w-[240px] relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:text-zinc-100 transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 shadow-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Only</option>
              <option value="standard">Standard</option>
            </select>

            <button
              onClick={() =>
                setFilters({ ...filters, overdueOnly: !filters.overdueOnly })
              }
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm border ${
                filters.overdueOnly
                  ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  : "bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              }`}
            >
              <Clock size={14} /> Overdue
            </button>

            {(filters.search ||
              filters.priority !== "all" ||
              filters.overdueOnly) && (
              <button
                onClick={() =>
                  setFilters({
                    search: "",
                    priority: "all",
                    status: "all",
                    overdueOnly: false,
                  })
                }
                className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Draggable Area - Unified Scroll Container */}
      <div className="flex-1 overflow-auto p-8 pt-4 custom-scrollbar">
        <Droppable droppableId="board" type="category" direction="vertical">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-16 pb-20 w-max min-w-full"
            >
              {categories
                .filter((c) => !zenModeCategoryId || c.id === zenModeCategoryId)
                .map((category, index) => (
                  <Draggable
                    key={category.id}
                    draggableId={category.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6 group/cat">
                          <div
                            className="flex items-center gap-3"
                            {...provided.dragHandleProps}
                          >
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
                              {category.title}
                            </h3>
                            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-400 uppercase">
                              {
                                columns.filter(
                                  (col) => col.categoryId === category.id,
                                ).length
                              }{" "}
                              Columns
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEditCategory(category)}
                              className="opacity-0 group-hover/cat:opacity-100 p-1.5 text-zinc-400 hover:text-blue-500 transition-all"
                              title="Edit Category"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() =>
                                setZenModeCategoryId(
                                  zenModeCategoryId ? null : category.id,
                                )
                              }
                              className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                              title={
                                zenModeCategoryId
                                  ? "Exit Focus"
                                  : "Enter Focus Mode"
                              }
                            >
                              <Maximize2 size={16} />
                            </button>
                            <button
                              onClick={() => onDeleteCategory(category)}
                              className="opacity-0 group-hover/cat:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 transition-all"
                              title="Delete Category"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <Droppable
                          droppableId={category.id}
                          type="column"
                          direction="horizontal"
                        >
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="flex gap-8 pb-4 min-h-[200px]"
                            >
                              {columns
                                .filter((c) => c.categoryId === category.id)
                                .map((column, index) => (
                                  <Column
                                    key={column.id}
                                    column={column}
                                    index={index}
                                    tasks={filteredTasks.filter(
                                      (t) => t.columnId === column.id,
                                    )}
                                    onAddTask={onAddTask}
                                    onEditColumn={onEditColumn}
                                    onDeleteColumn={onDeleteColumn}
                                    activeTimerTaskId={activeTimerTaskId}
                                    setActiveTimerTaskId={setActiveTimerTaskId}
                                    onTaskAction={onTaskAction}
                                  />
                                ))}
                              {provided.placeholder}
                              {columns.filter(
                                (c) => c.categoryId === category.id,
                              ).length === 0 && (
                                <div className="flex items-center justify-center w-80 h-40 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl">
                                  <p className="text-xs font-bold text-zinc-300 dark:text-zinc-800 uppercase tracking-widest">
                                    No columns yet
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}

              {categories.length === 0 && (
                <div className="p-20 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-3xl text-center min-w-[600px]">
                  <p className="text-sm font-bold text-zinc-300 dark:text-zinc-800 uppercase tracking-widest">
                    Add your first category to start building your board
                  </p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default Board;
