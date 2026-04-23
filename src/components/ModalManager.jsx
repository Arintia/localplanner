/**
 * @file ModalManager.jsx
 * @description Centralized modal orchestration with premium UI and specialized viewing modes.
 */

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import toast from "react-hot-toast";
import {
  Bold,
  Italic,
  Heading,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  X,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Repeat,
  Clock,
  Check,
  Layout,
  Info,
  ExternalLink,
  Paperclip,
  Save,
  Book,
  Copy,
  Trash,
  Layers,
  ChevronRight,
  Sparkles,
  Trash2,
} from "lucide-react";
import Modal from "./common/Modal";

const ModalManager = ({
  modal,
  closeModal,
  formData,
  setFormData,
  handleFormSubmit,
  insertMarkdown,
  descriptionRef,
  categories,
  activeTabId,
  confirmModal,
  setConfirmModal,
  mdModal,
  setMdModal,
  handleMdSubmit,
  templates,
  saveAsTemplate,
  deleteTemplate,
}) => {
  // Local state for link/image modals
  const [mdData, setMdData] = useState({ title: "", url: "" });

  if (!modal || (!modal.isOpen && !confirmModal?.isOpen && !mdModal?.isOpen))
    return null;

  const type = modal.type || "";
  const isTask = type.toLowerCase().includes("task");

  const inputClass =
    "w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:text-zinc-100 transition-all shadow-inner";
  const labelClass =
    "block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-2 ml-1";

  // Form Title Logic
  let modalTitle = "DIALOG";
  if (type === "viewTask") modalTitle = "TASK INSPECTION";
  else if (type === "editTask") modalTitle = "EDIT TASK";
  else if (type === "editCategory") modalTitle = "EDIT CATEGORY";
  else if (type === "editProject") modalTitle = "EDIT PROJECT";
  else if (type === "editColumn") modalTitle = "EDIT COLUMN";
  else if (type === "shortcuts") modalTitle = "KEYBOARD SHORTCUTS";
  else if (type) modalTitle = type.toUpperCase().replace("_", " ");

  // --- Specialized Rendering for VIEW TASK ---
  if (type === "viewTask") {
    return (
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modalTitle}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-10 pb-6">
          {/* Header Section */}
          <div className="relative group">
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-zinc-900 dark:bg-white rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
            <div className="flex items-start justify-between gap-6">
              <h2 className="text-4xl font-black text-zinc-900 dark:text-white leading-[1.1] tracking-tight flex-1">
                {formData.title || "Untitled Task"}
              </h2>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap gap-2 mt-6">
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-sm ${formData.priority === "high" ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30" : "bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-700"}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${formData.priority === "high" ? "bg-rose-500" : "bg-zinc-400"}`}
                ></div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {formData.priority || "standard"}
                </span>
              </div>
              {formData.deadline && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-700 shadow-sm">
                  <Calendar size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {formData.deadline}
                  </span>
                </div>
              )}
              {formData.recurrence !== "none" && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-700 shadow-sm">
                  <Repeat size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {formData.recurrence}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Paperclip size={16} />
              </div>
              <span className={labelClass}>Notes & Context</span>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-none min-h-[160px]">
              {formData.description ? (
                <div
                  className="prose prose-zinc dark:prose-invert max-w-none 
                  prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed
                  prose-headings:text-zinc-900 dark:prose-headings:text-white prose-headings:font-black
                  prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-4 prose-blockquote:border-zinc-900 dark:prose-blockquote:border-white
                  prose-blockquote:bg-zinc-50 dark:prose-blockquote:bg-zinc-800/30 prose-blockquote:p-4 prose-blockquote:rounded-r-xl
                "
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <div className="rounded-xl overflow-hidden my-6 shadow-2xl">
                            <SyntaxHighlighter
                              style={atomDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code
                            className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-900 dark:text-zinc-100 font-mono text-[0.9em]"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      img({ node, ...props }) {
                        return (
                          <img
                            className="rounded-2xl shadow-2xl border-4 border-white dark:border-zinc-800"
                            {...props}
                          />
                        );
                      },
                    }}
                  >
                    {formData.description}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-300 dark:text-zinc-700">
                  <Info size={40} strokeWidth={1} className="mb-4" />
                  <p className="italic text-sm font-medium uppercase tracking-[0.2em]">
                    No detail has been provided for this task.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Checklist Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={16} />
                </div>
                <span className={labelClass}>Task Checklist</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                    style={{
                      width: `${(formData.checklist?.filter((i) => i.completed).length / formData.checklist?.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-[10px] font-black text-zinc-400 tabular-nums uppercase">
                  {formData.checklist?.filter((i) => i.completed).length || 0}{" "}
                  OF {formData.checklist?.length || 0}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {formData.checklist && formData.checklist.length > 0 ? (
                formData.checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300 ${
                      item.completed
                        ? "bg-emerald-50/30 border-emerald-100/50 dark:bg-emerald-950/10 dark:border-emerald-900/20 opacity-70"
                        : "bg-white dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        item.completed
                          ? "bg-emerald-500 border-emerald-500 scale-110 shadow-lg shadow-emerald-500/30"
                          : "border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      {item.completed && (
                        <Check
                          size={14}
                          className="text-white"
                          strokeWidth={4}
                        />
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold transition-all ${item.completed ? "text-zinc-400 line-through" : "text-zinc-800 dark:text-zinc-200"}`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2rem] bg-zinc-50/50 dark:bg-transparent">
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                    Board is Clean
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // --- STANDARD MODAL CONTENT ---
  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modalTitle}
        maxWidth={isTask || type === "shortcuts" ? "max-w-2xl" : "max-w-md"}
        footer={
          type !== "shortcuts" && (
            <button
              type="submit"
              form="mainForm"
              className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all hover:shadow-2xl"
            >
              Confirm Changes
            </button>
          )
        }
      >
        <form id="mainForm" onSubmit={handleFormSubmit} className="space-y-6">
          {/* COMPACT BLUEPRINT SHELF */}
          {type === "task" && templates.length > 0 && (
            <div className="space-y-4 pb-8 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <Layers size={14} />
                </div>
                <span className={labelClass}>Select Task Blueprint</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                {templates.map((tmpl) => (
                  <div key={tmpl.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          title: tmpl.text,
                          description: tmpl.description,
                          priority: tmpl.priority,
                          recurrence: tmpl.recurrence,
                          checklist: tmpl.checklist || [],
                        });
                        toast.success(`Applied Blueprint`);
                      }}
                      className="w-full text-left px-4 py-3 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all group/card shadow-sm"
                    >
                      <span className="text-xs font-bold truncate block text-zinc-800 dark:text-zinc-200">
                        {tmpl.text}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTemplate(tmpl.id);
                        toast.error("Blueprint removed");
                      }}
                      className="absolute -top-1 -right-1 p-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SHORTCUTS MODAL */}
          {type === "shortcuts" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Navigation
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { key: "Ctrl + B", desc: "Toggle Sidebar" },
                      { key: "Ctrl + 1-9", desc: "Switch Project Tabs" },
                      { key: "Esc", desc: "Close Modal / Exit Focus" },
                    ].map((s) => (
                      <div
                        key={s.key}
                        className="flex items-center justify-between group"
                      >
                        <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                          {s.desc}
                        </span>
                        <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-black text-zinc-900 dark:text-white shadow-sm">
                          {s.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Actions
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { key: "P", desc: "New Project" },
                      { key: "C", desc: "New Category" },
                      { key: "Ctrl + C", desc: "New Column" },
                      { key: "Ctrl + Z/Y", desc: "Undo / Redo" },
                    ].map((s) => (
                      <div
                        key={s.key}
                        className="flex items-center justify-between group"
                      >
                        <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                          {s.desc}
                        </span>
                        <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-black text-zinc-900 dark:text-white shadow-sm">
                          {s.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-start gap-4">
                <Info size={18} className="text-blue-500 mt-1 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                  Use these shortcuts to navigate the workspace faster.
                  Project-specific shortcuts like adding categories only work
                  when a project is active.
                </p>
              </div>
            </div>
          )}

          {/* PROJECT MODAL */}
          {(type === "project" || type === "editProject") && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Project Name</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={inputClass}
                  placeholder="e.g. Website Launch"
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`${inputClass} min-h-[100px]`}
                  placeholder="What is this project about?"
                />
              </div>
            </div>
          )}

          {/* TASK/CATEGORY/COLUMN TITLE */}
          {(type === "category" ||
            type === "editCategory" ||
            type === "column" ||
            type === "editColumn" ||
            (isTask && type !== "viewTask")) && (
            <div>
              <label className={labelClass}>
                {isTask ? "Task Summary" : "Title"}
              </label>
              <input
                type="text"
                autoFocus
                required
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={inputClass}
                placeholder={
                  isTask ? "Actionable task name..." : "Enter title..."
                }
              />
            </div>
          )}

          {/* COLUMN CONFIG */}
          {(type === "column" || type === "editColumn") && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Target Category</label>
                <select
                  value={formData.targetCategory || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, targetCategory: e.target.value })
                  }
                  className={inputClass}
                  required
                >
                  <option value="">Select a category...</option>
                  {categories
                    .filter((c) => c.projectId === activeTabId)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Column Background Color</label>
                <div className="flex flex-wrap gap-2.5">
                  {["zinc", "blue", "emerald", "amber", "rose", "purple"].map(
                    (cid) => (
                      <button
                        key={cid}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, colorId: cid })
                        }
                        className={`w-10 h-10 rounded-full border-4 transition-all ${formData.colorId === cid ? "border-zinc-900 dark:border-white scale-110 shadow-lg" : "border-transparent"} ${
                          cid === "zinc"
                            ? "bg-zinc-500"
                            : cid === "blue"
                              ? "bg-blue-500"
                              : cid === "emerald"
                                ? "bg-emerald-500"
                                : cid === "amber"
                                  ? "bg-amber-500"
                                  : cid === "rose"
                                    ? "bg-rose-500"
                                    : "bg-purple-500"
                        }`}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TASK CONFIG */}
          {isTask && type !== "viewTask" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Priority</label>
                  <select
                    value={formData.priority || "standard"}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="standard">Standard</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input
                    type="date"
                    value={formData.deadline || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Repeat</label>
                  <select
                    value={formData.recurrence || "none"}
                    onChange={(e) =>
                      setFormData({ ...formData, recurrence: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="none">Manual Only</option>
                    <option value="daily">Every Day</option>
                    <option value="weekly">Every Week</option>
                    <option value="monthly">Every Month</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Task Details</label>
                <div className="flex items-center gap-1 mb-2.5 bg-zinc-50 dark:bg-zinc-800/30 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  {[
                    { id: "bold", icon: <Bold size={14} /> },
                    { id: "italic", icon: <Italic size={14} /> },
                    { id: "heading", icon: <Heading size={14} /> },
                    { id: "list", icon: <List size={14} /> },
                    { id: "code", icon: <Code size={14} /> },
                    { id: "quote", icon: <Quote size={14} /> },
                    { id: "link", icon: <LinkIcon size={14} /> },
                    { id: "image", icon: <ImageIcon size={14} /> },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => insertMarkdown(btn.id)}
                      className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-zinc-900 transition-all"
                    >
                      {btn.icon}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={descriptionRef}
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`${inputClass} min-h-[160px] font-mono text-xs leading-relaxed`}
                  placeholder="Task details and instructions..."
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Checklist Items</label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        checklist: [
                          ...(formData.checklist || []),
                          { id: Date.now(), text: "", completed: false },
                        ],
                      })
                    }
                    className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.checklist || []).map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 group/item"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed || false}
                        onChange={(e) => {
                          const nl = [...formData.checklist];
                          nl[idx].completed = e.target.checked;
                          setFormData({ ...formData, checklist: nl });
                        }}
                        className="w-4 h-4 rounded border-zinc-300 transition-all focus:ring-zinc-900"
                      />
                      <input
                        type="text"
                        value={item.text || ""}
                        onChange={(e) => {
                          const nl = [...formData.checklist];
                          nl[idx].text = e.target.value;
                          setFormData({ ...formData, checklist: nl });
                        }}
                        className="flex-1 bg-transparent border-none text-sm p-0 focus:ring-0"
                        placeholder="Task item..."
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            checklist: formData.checklist.filter(
                              (_, i) => i !== idx,
                            ),
                          })
                        }
                        className="opacity-0 group-hover/item:opacity-100 text-zinc-400 hover:text-red-500 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* SPECIALIZED MODAL FOR LINK/IMAGE INPUT */}
      <Modal
        isOpen={mdModal.isOpen}
        onClose={() => setMdModal({ isOpen: false, type: null })}
        title={mdModal.type === "link" ? "INSERT LINK" : "INSERT IMAGE"}
      >
        <div className="space-y-6">
          <div>
            <label className={labelClass}>
              {mdModal.type === "link" ? "Link Text" : "Image Description"}
            </label>
            <input
              type="text"
              autoFocus
              className={inputClass}
              value={mdData.title}
              onChange={(e) => setMdData({ ...mdData, title: e.target.value })}
              placeholder="e.g. My Website"
            />
          </div>
          <div>
            <label className={labelClass}>URL</label>
            <input
              type="text"
              className={inputClass}
              value={mdData.url}
              onChange={(e) => setMdData({ ...mdData, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <button
            onClick={() => {
              handleMdSubmit(mdData);
              setMdData({ title: "", url: "" });
            }}
            className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all"
          >
            Insert Markdown
          </button>
        </div>
      </Modal>

      {/* CONFIRMATION MODAL */}
      <Modal
        isOpen={confirmModal?.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title="DANGER ZONE"
        footer={
          <button
            onClick={confirmModal?.onConfirm}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg ${confirmModal?.confirmVariant === "danger" ? "bg-rose-600" : "bg-zinc-900"}`}
          >
            {confirmModal?.confirmText || "Confirm"}
          </button>
        }
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
          {confirmModal?.message}
        </p>
      </Modal>
    </>
  );
};

export default ModalManager;
