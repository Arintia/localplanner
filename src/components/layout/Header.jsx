/**
 * @file Header.jsx
 * @description Application header containing project tabs and global controls.
 */

import React from "react";
import { X, Undo2, Redo2, Moon, Sun, Keyboard, Clock } from "lucide-react";
import { formatTime } from "../../utils/formatters";

const Header = ({
  openTabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onUndo,
  onRedo,
  darkMode,
  setDarkMode,
  onShortcutsClick,
  activeTimerTaskId,
  tasks,
}) => {
  const activeTimerTask = tasks.find((t) => t.id === activeTimerTaskId);

  return (
    <div className="flex items-end px-6 pt-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 min-h-[56px] relative transition-colors pr-48 shrink-0">
      <div className="flex items-end overflow-x-auto no-scrollbar flex-1">
        {openTabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 border-t border-x rounded-t-xl cursor-pointer text-sm font-medium transition-all whitespace-nowrap group/tab ${
              activeTabId === tab.id
                ? "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative -mb-[1px] shadow-[0_-2px_10px_rgba(0,0,0,0.02)]"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {tab.name}
            <button
              onClick={(e) => onTabClose(e, tab.id)}
              className={`ml-2 p-0.5 rounded-md transition-colors ${
                activeTabId === tab.id
                  ? "text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "text-transparent group-hover/tab:text-zinc-400 group-hover/tab:hover:text-red-500"
              }`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Global Actions */}
      <div className="absolute bottom-[8px] right-6 flex items-center gap-3">
        {/* History Controls */}
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onUndo}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 hover:scale-110 active:scale-95"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={onRedo}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 hover:scale-110 active:scale-95"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Preference Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 hover:scale-110 active:scale-95"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={onShortcutsClick}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard size={18} />
          </button>
        </div>

        {activeTimerTask && (
          <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-900 dark:bg-white rounded-full shadow-lg animate-in fade-in zoom-in duration-300">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white dark:text-zinc-900">
              Tracking task: {activeTimerTask.text}
            </span>
            <div className="w-px h-3 bg-zinc-700 dark:bg-zinc-200"></div>
            <span className="text-[11px] font-mono font-bold text-white dark:text-zinc-900">
              {formatTime(activeTimerTask.trackedTime)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
