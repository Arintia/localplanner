/**
 * @file App.jsx
 * @description Main application component orchestrating state, layout, and user interactions.
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { X, Sparkles } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Board from "./components/board/Board";
import ModalManager from "./components/ModalManager";
import CalendarView from "./components/calendar/CalendarView";
import { useBoardState } from "./hooks/useBoardState";

function App() {
  const {
    projects,
    activeTabId,
    openTabs,
    categories,
    columns,
    tasks,
    templates,
    darkMode,
    zenModeCategoryId,
    setProjects,
    setActiveTabId,
    setOpenTabs,
    setCategories,
    setColumns,
    setTasks,
    setDarkMode,
    setZenModeCategoryId,
    addProject,
    deleteProject,
    updateProject,
    addCategory,
    deleteCategory,
    addColumn,
    deleteColumn,
    updateColumn,
    addTask,
    deleteTask,
    updateTask,
    toggleTaskCompletion,
    toggleChecklistItem,
    saveAsTemplate,
    deleteTemplate,
    undo,
    redo,
    importWorkspace,
  } = useBoardState();

  // --- UI STATE ---
  const [activeView, setActiveView] = useState("board"); // 'board' | 'calendar'
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    priority: "all",
    status: "all",
    overdueOnly: false,
  });
  const [activeTimerTaskId, setActiveTimerTaskId] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    targetId: null,
  });
  const [formData, setFormData] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [mdModal, setMdModal] = useState({ isOpen: false, type: null });

  // --- REFS ---
  const fileInputRef = useRef(null);
  const descriptionRef = useRef(null);

  // --- DERIVED STATE ---
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeTabId),
    [projects, activeTabId],
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.text.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesPriority =
        filters.priority === "all" || task.priority === filters.priority;

      let matchesOverdue = true;
      if (filters.overdueOnly && task.deadline) {
        matchesOverdue =
          new Date(task.deadline) < new Date() && !task.isCompleted;
      }

      return matchesSearch && matchesPriority && matchesOverdue;
    });
  }, [tasks, filters]);

  // --- EFFECTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
      }
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        setFilters((f) => ({ ...f, search: "" }));
      }
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        setSidebarOpen((s) => !s);
      }
      if (e.key === "Escape") {
        setModal({ isOpen: false });
        setZenModeCategoryId(null);
      }

      // Content Creation Shortcuts
      if (!modal.isOpen) {
        if (e.key === "p" || e.key === "P") {
          e.preventDefault();
          setFormData({ title: "", description: "" });
          setModal({ isOpen: true, type: "project" });
        }
        if ((e.key === "c" || e.key === "C") && !e.ctrlKey) {
          e.preventDefault();
          if (activeTabId) {
            setFormData({ title: "" });
            setModal({ isOpen: true, type: "category" });
          }
        }
        if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
          e.preventDefault();
          const firstCat = categories.find(
            (cat) => cat.projectId === activeTabId,
          );
          if (firstCat) {
            setFormData({
              title: "",
              colorId: "zinc",
              isCompletion: false,
              targetCategory: firstCat.id,
            });
            setModal({ isOpen: true, type: "column", targetId: firstCat.id });
          }
        }
      }

      // Ctrl + Number for tabs
      if (e.ctrlKey && e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key) - 1;
        if (openTabs[index]) setActiveTabId(openTabs[index].id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    openTabs,
    setActiveTabId,
    setZenModeCategoryId,
    modal.isOpen,
    activeTabId,
    categories,
  ]);

  // Recurring tasks checker
  useEffect(() => {
    const checkRecurring = () => {
      const now = new Date();
      tasks.forEach((task) => {
        if (task.isCompleted && task.recurrence && task.recurrence !== "none") {
          const lastDate = new Date(task.lastOccurrence || 0);
          let shouldReset = false;

          if (
            task.recurrence === "daily" &&
            now.getDate() !== lastDate.getDate()
          )
            shouldReset = true;
          if (
            task.recurrence === "weekly" &&
            now.getTime() - lastDate.getTime() > 7 * 24 * 60 * 60 * 1000
          )
            shouldReset = true;
          if (
            task.recurrence === "monthly" &&
            now.getMonth() !== lastDate.getMonth()
          )
            shouldReset = true;

          if (shouldReset) {
            updateTask(task.id, {
              isCompleted: false,
              lastOccurrence: now.toISOString(),
            });
          }
        }
      });
    };
    const interval = setInterval(checkRecurring, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [tasks, updateTask]);

  // --- HANDLERS ---
  const onDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (type === "category") {
      const projectCats = categories.filter((c) => c.projectId === activeTabId);
      const otherCats = categories.filter((c) => c.projectId !== activeTabId);

      const [removed] = projectCats.splice(source.index, 1);
      projectCats.splice(destination.index, 0, removed);

      setCategories([...otherCats, ...projectCats]);
      return;
    }

    if (type === "column") {
      const sourceCatId = source.droppableId;
      const destCatId = destination.droppableId;
      const newCols = Array.from(columns);

      const colIndex = newCols.findIndex((c) => c.id === result.draggableId);
      if (colIndex === -1) return;

      const [column] = newCols.splice(colIndex, 1);
      column.categoryId = destCatId;

      // Calculate insertion index within the destination category
      const destCols = newCols.filter((c) => c.categoryId === destCatId);
      const insertPos =
        newCols.indexOf(destCols[destination.index]) || newCols.length;
      newCols.splice(insertPos === -1 ? newCols.length : insertPos, 0, column);

      setColumns(newCols);
      return;
    }

    // Task movement
    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;
    const taskList = Array.from(tasks);

    const taskIndex = taskList.findIndex((t) => t.id === result.draggableId);
    if (taskIndex === -1) return;

    const [task] = taskList.splice(taskIndex, 1);
    task.columnId = destColId;

    // Handle auto-completion based on destination column
    const destCol = columns.find((c) => c.id === destColId);
    if (destCol) {
      task.isCompleted = destCol.isCompletion;
    }

    const destTasksInCol = taskList.filter((t) => t.columnId === destColId);
    const insertPos =
      taskList.indexOf(destTasksInCol[destination.index]) || taskList.length;
    taskList.splice(insertPos === -1 ? taskList.length : insertPos, 0, task);

    setTasks(taskList);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const { type, targetId } = modal;

    if (type === "category") addCategory(activeTabId, formData.title);
    else if (type === "editCategory") {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === targetId ? { ...c, title: formData.title } : c,
        ),
      );
    } else if (type === "column")
      addColumn(
        formData.targetCategory || targetId,
        formData.title,
        formData.isCompletion,
        formData.colorId,
      );
    else if (type === "editColumn")
      updateColumn(targetId, {
        title: formData.title,
        isCompletion: formData.isCompletion,
        colorId: formData.colorId,
        categoryId: formData.targetCategory,
      });
    else if (type === "task")
      addTask(targetId, {
        text: formData.title,
        description: formData.description,
        priority: formData.priority,
        deadline: formData.deadline,
        recurrence: formData.recurrence,
        checklist: formData.checklist,
      });
    else if (type === "editTask")
      updateTask(targetId, {
        text: formData.title,
        description: formData.description,
        priority: formData.priority,
        deadline: formData.deadline,
        recurrence: formData.recurrence,
        checklist: formData.checklist,
      });
    else if (type === "project")
      addProject(formData.title, formData.description);
    else if (type === "editProject")
      updateProject(targetId, {
        name: formData.title,
        description: formData.description,
      });

    setModal({ isOpen: false });
    setFormData({});
  };

  const handleExport = () => {
    const data = { projects, categories, columns, tasks, templates };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `local-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        importWorkspace(data);
      } catch (err) {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  const insertMarkdown = (syntaxType) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = (formData.description || "").substring(start, end);

    let prefix = "",
      suffix = "",
      mock = "text";

    switch (syntaxType) {
      case "bold":
        prefix = "**";
        suffix = "**";
        break;
      case "italic":
        prefix = "_";
        suffix = "_";
        break;
      case "heading":
        prefix = "### ";
        break;
      case "list":
        prefix = "- ";
        break;
      case "code":
        prefix = "```javascript\n";
        suffix = "\n```";
        mock = "code block";
        break;
      case "quote":
        prefix = "> ";
        break;
      case "link":
        prefix = "[";
        suffix = "](url)";
        break;
      case "image":
        prefix = "![";
        suffix = "](url)";
        break;
    }

    if (syntaxType === "link" || syntaxType === "image") {
      setMdModal({ isOpen: true, type: syntaxType });
      return;
    }

    const content = selectedText || mock;
    const replacement = `${prefix}${content}${suffix}`;

    const newDescription =
      (formData.description || "").substring(0, start) +
      replacement +
      (formData.description || "").substring(end);
    setFormData((prev) => ({ ...prev, description: newDescription }));

    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + content.length,
      );
    }, 0);
  };

  const handleMdSubmit = (data) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const prefix = mdModal.type === "link" ? "[" : "![";
    const replacement = `${prefix}${data.title}](${data.url})`;

    const newDescription =
      (formData.description || "").substring(0, start) +
      replacement +
      (formData.description || "").substring(end);
    setFormData((prev) => ({ ...prev, description: newDescription }));
    setMdModal({ isOpen: false, type: null });
  };

  const onTaskAction = {
    onToggleComplete: toggleTaskCompletion,
    onDelete: deleteTask,
    onToggleChecklistItem: toggleChecklistItem,
    onEdit: (task) => {
      setFormData({
        title: task.text,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline,
        recurrence: task.recurrence || "none",
        checklist: task.checklist || [],
      });
      setModal({ isOpen: true, type: "editTask", targetId: task.id });
    },
    onView: (task) => {
      const taskObj = tasks.find((t) => t.id === task.id);
      setFormData({
        title: task.text,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline,
        recurrence: task.recurrence || "none",
        checklist: task.checklist || [],
        _rawTask: taskObj,
      });
      setModal({ isOpen: true, type: "viewTask", targetId: task.id });
    },
    onSaveTemplate: (task) => {
      try {
        saveAsTemplate(task);
        toast.success(`"${task.text}" saved as blueprint`, {
          icon: <Sparkles className="text-amber-500" size={18} />,
        });
      } catch (err) {
        toast.error(err.message);
      }
    },
  };

  const jumpToTaskOnBoard = (task) => {
    const col = columns.find((c) => c.id === task.columnId);
    const cat = categories.find((c) => c.id === col?.categoryId);
    if (cat) {
      const project = projects.find((p) => p.id === cat.projectId);
      if (project && !openTabs.find((t) => t.id === project.id)) {
        setOpenTabs([...openTabs, project]);
      }
      setActiveTabId(cat.projectId);
      setActiveView("board");
      // Delay modal to allow board transition
      setTimeout(() => onTaskAction.onView(task), 100);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className={`flex h-screen w-full transition-colors duration-500 ${darkMode ? "dark bg-zinc-950" : "bg-white"}`}
      >
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: darkMode ? "#18181b" : "#ffffff",
              color: darkMode ? "#ffffff" : "#18181b",
              border: `1px solid ${darkMode ? "#27272a" : "#e4e4e7"}`,
              borderRadius: "20px",
              fontSize: "16px",
              padding: "16px 24px",
              fontWeight: "600",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              minWidth: "320px",
            },
            duration: 3000,
          }}
        />

        {isSidebarOpen && !zenModeCategoryId && (
          <Sidebar
            projects={projects}
            activeTabId={activeTabId}
            activeView={activeView}
            setActiveView={setActiveView}
            onProjectClick={(p) => {
              if (!openTabs.find((t) => t.id === p.id))
                setOpenTabs([...openTabs, p]);
              setActiveTabId(p.id);
              setActiveView("board");
            }}
            onAddProject={() => {
              setFormData({ title: "", description: "" });
              setModal({ isOpen: true, type: "project" });
            }}
            onEditProject={(p) => {
              setFormData({ title: p.name, description: p.description });
              setModal({ isOpen: true, type: "editProject", targetId: p.id });
            }}
            onDeleteProject={(p) =>
              setConfirmModal({
                isOpen: true,
                title: "Delete Project",
                message: `Are you sure you want to delete the project "${p.name}"? This will permanently remove all categories, columns, and tasks within this project. This action cannot be undone.`,
                confirmText: "Delete Project",
                confirmVariant: "danger",
                onConfirm: () => {
                  deleteProject(p.id);
                  setConfirmModal({ isOpen: false });
                },
              })
            }
            onExport={handleExport}
            onImport={() => fileInputRef.current.click()}
            fileInputRef={fileInputRef}
            handleFileChange={handleImport}
          />
        )}

        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 relative overflow-hidden">
          {!zenModeCategoryId && (
            <Header
              openTabs={openTabs}
              activeTabId={activeTabId}
              onTabClick={(id) => {
                setActiveTabId(id);
                setActiveView("board");
              }}
              onTabClose={(e, id) => {
                e.stopPropagation();
                const newTabs = openTabs.filter((t) => t.id !== id);
                setOpenTabs(newTabs);
                if (activeTabId === id) setActiveTabId(newTabs[0]?.id || null);
              }}
              onUndo={undo}
              onRedo={redo}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onShortcutsClick={() =>
                setModal({ isOpen: true, type: "shortcuts" })
              }
              activeTimerTaskId={activeTimerTaskId}
              tasks={tasks}
            />
          )}

          {activeView === "board" ? (
            <Board
              activeProject={activeProject}
              categories={categories.filter((c) => c.projectId === activeTabId)}
              columns={columns}
              tasks={tasks}
              filteredTasks={filteredTasks}
              filters={filters}
              setFilters={setFilters}
              zenModeCategoryId={zenModeCategoryId}
              setZenModeCategoryId={setZenModeCategoryId}
              onAddCategory={() => setModal({ isOpen: true, type: "category" })}
              onEditCategory={(cat) => {
                setFormData({ title: cat.title });
                setModal({
                  isOpen: true,
                  type: "editCategory",
                  targetId: cat.id,
                });
              }}
              onDeleteCategory={(cat) =>
                setConfirmModal({
                  isOpen: true,
                  title: "Delete Category",
                  message: `Are you sure you want to delete "${cat.title}"? This will permanently remove all columns and tasks within this category.`,
                  confirmText: "Delete Category",
                  confirmVariant: "danger",
                  onConfirm: () => {
                    deleteCategory(cat.id);
                    setConfirmModal({ isOpen: false });
                  },
                })
              }
              onAddColumn={(catId) =>
                setModal({ isOpen: true, type: "column", targetId: catId })
              }
              onEditColumn={(col) => {
                setFormData({
                  title: col.title,
                  colorId: col.colorId,
                  isCompletion: col.isCompletion,
                  targetCategory: col.categoryId,
                });
                setModal({
                  isOpen: true,
                  type: "editColumn",
                  targetId: col.id,
                });
              }}
              onDeleteColumn={(col) =>
                setConfirmModal({
                  isOpen: true,
                  title: "Delete Column",
                  message: `Are you sure you want to delete the column "${col.title}"? All tasks within this column will be permanently deleted.`,
                  confirmText: "Delete Column",
                  confirmVariant: "danger",
                  onConfirm: () => {
                    deleteColumn(col.id);
                    setConfirmModal({ isOpen: false });
                  },
                })
              }
              onAddTask={(colId) => {
                setFormData({
                  title: "",
                  description: "",
                  deadline: "",
                  priority: "standard",
                  colorId: "zinc",
                  isCompletion: false,
                  recurrence: "none",
                });
                setModal({ isOpen: true, type: "task", targetId: colId });
              }}
              activeTimerTaskId={activeTimerTaskId}
              setActiveTimerTaskId={setActiveTimerTaskId}
              onTaskAction={onTaskAction}
            />
          ) : (
            <CalendarView
              tasks={tasks}
              projects={projects}
              categories={categories}
              columns={columns}
              onTaskClick={jumpToTaskOnBoard}
              updateTask={updateTask}
            />
          )}

          {zenModeCategoryId && (
            <button
              onClick={() => setZenModeCategoryId(null)}
              className="fixed top-8 right-8 z-[100] w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-2xl hover:scale-110 group/exit"
            >
              <X
                size={20}
                className="group-hover/exit:rotate-90 transition-transform"
              />
            </button>
          )}
        </main>

        <ModalManager
          modal={modal}
          closeModal={() => setModal({ isOpen: false })}
          formData={formData}
          setFormData={setFormData}
          handleFormSubmit={handleFormSubmit}
          insertMarkdown={insertMarkdown}
          descriptionRef={descriptionRef}
          categories={categories}
          activeTabId={activeTabId}
          confirmModal={confirmModal}
          setConfirmModal={setConfirmModal}
          mdModal={mdModal}
          setMdModal={setMdModal}
          handleMdSubmit={handleMdSubmit}
          templates={templates}
          saveAsTemplate={saveAsTemplate}
          deleteTemplate={deleteTemplate}
        />
      </div>
    </DragDropContext>
  );
}

export default App;
