/**
 * @file Sidebar.jsx
 * @description Premium project navigation sidebar with workspace management tools.
 */

import React from 'react';
import {
  Layout, Plus, Settings, ChevronRight, Folder,
  Trash2, Pencil, Download, Upload, Calendar as CalendarIcon,
  Search, BarChart3, Clock
} from 'lucide-react';

const Sidebar = ({
  projects, activeTabId, onProjectClick, onAddProject,
  onEditProject, onDeleteProject, onExport, onImport,
  fileInputRef, handleFileChange, activeView, setActiveView
}) => {
  return (
    <aside className="w-72 h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-500 z-50">
      {/* Brand Header */}
      <div className="p-8">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all">
            <Layout className="text-white dark:text-zinc-900" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">LocalPlanner</h1>
          </div>
        </div>

        {/* Global Navigation Section */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-3 ml-1">Workspace</label>

          <button
            onClick={() => setActiveView('board')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${activeView === 'board'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl'
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
          >
            <Layout size={18} className={activeView === 'board' ? 'text-white dark:text-zinc-900' : 'text-zinc-400'} />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setActiveView('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${activeView === 'calendar'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl'
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
          >
            <CalendarIcon size={18} className={activeView === 'calendar' ? 'text-white dark:text-zinc-900' : 'text-zinc-400'} />
            <span>Global Calendar</span>
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
        <div className="flex items-center justify-between mb-4 px-1">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">My Projects</label>
          <button
            onClick={onAddProject}
            className="p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-900 transition-all"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-1">
          {projects.map((project) => (
            <div key={project.id} className="group relative">
              <button
                onClick={() => onProjectClick(project)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTabId === project.id && activeView === 'board'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md border border-zinc-200 dark:border-zinc-700'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Folder size={16} className={activeTabId === project.id && activeView === 'board' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'} />
                  <span className="truncate">{project.name}</span>
                </div>
                {activeTabId === project.id && activeView === 'board' && <ChevronRight size={14} className="text-zinc-400" />}
              </button>

              {/* Context Actions */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all pr-2">
                <button onClick={(e) => { e.stopPropagation(); onEditProject(project); }} className="p-1.5 text-zinc-400 hover:text-blue-500 rounded-md hover:bg-white dark:hover:bg-zinc-800 shadow-sm"><Pencil size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteProject(project); }} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-white dark:hover:bg-zinc-800 shadow-sm"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-8 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onExport}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300 hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-900 transition-all shadow-sm"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={onImport}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300 hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-900 transition-all shadow-sm"
          >
            <Upload size={14} /> Backup
          </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
      </div>
    </aside>
  );
};

export default Sidebar;
