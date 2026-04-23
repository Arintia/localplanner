/**
 * @file Modal.jsx
 * @description Unified modal wrapper for consistent UI and transitions.
 */

import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-900/40 dark:bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full ${maxWidth} overflow-hidden flex flex-col max-h-[90vh] transition-all scale-in duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest text-[10px]">
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
