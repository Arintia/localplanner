/**
 * @file useBoardState.js
 * @description Core business logic hook for managing projects, categories, columns, and tasks.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useUndoRedo } from "./useUndoRedo";

export const useBoardState = () => {
  // --- CORE STATE ---
  const [projects, setProjects] = useLocalStorage("lp_projects", [
    {
      id: "p1",
      name: "My First Project",
      description: "Welcome to LocalPlanner!",
    },
  ]);
  const [openTabs, setOpenTabs] = useLocalStorage("lp_open_tabs", [
    { id: "p1", name: "My First Project" },
  ]);
  const [activeTabId, setActiveTabId] = useLocalStorage("lp_active_tab", "p1");
  const [categories, setCategories] = useLocalStorage("lp_categories", []);
  const [columns, setColumns] = useLocalStorage("lp_columns", []);
  const [tasks, setTasks] = useLocalStorage("lp_tasks", []);
  const [templates, setTemplates] = useLocalStorage("lp_templates", []);

  // --- UI STATE ---
  const [darkMode, setDarkMode] = useLocalStorage("lp_dark_mode", true);
  const [zenModeCategoryId, setZenModeCategoryId] = useState(null);
  const [activities, setActivities] = useState([]);

  // --- REFS ---
  const isInternalUpdate = useRef(false);

  // --- UNDO / REDO ---
  const setFullState = useCallback(
    (state) => {
      setProjects(state.projects);
      setCategories(state.categories);
      setColumns(state.columns);
      setTasks(state.tasks);
    },
    [setProjects, setCategories, setColumns, setTasks],
  );

  const {
    trackAction: recordHistory,
    undo,
    redo,
  } = useUndoRedo(
    { projects, categories, columns, tasks },
    setFullState,
    isInternalUpdate,
  );

  // Auto-track history on state changes (debounced)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      recordHistory({ projects, categories, columns, tasks });
    }, 300);

    return () => clearTimeout(timeout);
  }, [projects, categories, columns, tasks, recordHistory]);

  // --- ACTIONS ---

  const logActivity = (type, message, data = null) => {
    const newAction = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString(),
      data,
    };
    setActivities((prev) => [newAction, ...prev].slice(0, 50));
  };

  const addProject = (name, description) => {
    const newProj = { id: `p_${Date.now()}`, name, description };
    setProjects((prev) => [...prev, newProj]);
    setOpenTabs((prev) => [...prev, newProj]);
    setActiveTabId(newProj.id);
    logActivity("CREATE_PROJECT", `Created project "${name}"`, newProj);
    return newProj;
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setOpenTabs((prev) => prev.filter((t) => t.id !== id));
    if (activeTabId === id) setActiveTabId(null);
    logActivity("DELETE_PROJECT", `Deleted project`, { id });
  };

  const updateProject = (id, updates) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
    setOpenTabs((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, name: updates.name || t.name } : t,
      ),
    );
    logActivity("EDIT_PROJECT", `Updated project`, { id, ...updates });
  };

  const addCategory = (projectId, title) => {
    const newCat = { id: `cat_${Date.now()}`, projectId, title };
    setCategories((prev) => [...prev, newCat]);
    logActivity("CREATE_CATEGORY", `Created category "${title}"`, newCat);
    return newCat;
  };

  const deleteCategory = (categoryId) => {
    const columnsToDelete = columns
      .filter((c) => c.categoryId === categoryId)
      .map((c) => c.id);
    setTasks((prev) =>
      prev.filter((t) => !columnsToDelete.includes(t.columnId)),
    );
    setColumns((prev) => prev.filter((c) => c.categoryId !== categoryId));
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    logActivity("DELETE_CATEGORY", `Deleted category`, { id: categoryId });
  };

  const addColumn = (
    categoryId,
    title,
    isCompletion = false,
    colorId = "zinc",
  ) => {
    const newCol = {
      id: `col_${Date.now()}`,
      categoryId,
      title,
      isCompletion,
      colorId,
    };
    setColumns((prev) => [...prev, newCol]);
    logActivity("CREATE_COLUMN", `Created column "${title}"`, newCol);
    return newCol;
  };

  const deleteColumn = (columnId) => {
    setTasks((prev) => prev.filter((t) => t.columnId !== columnId));
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
    logActivity("DELETE_COLUMN", `Deleted column`, { id: columnId });
  };

  const updateColumn = (columnId, updates) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, ...updates } : c)),
    );
    if (updates.hasOwnProperty("isCompletion")) {
      setTasks((prev) =>
        prev.map((t) =>
          t.columnId === columnId
            ? { ...t, isCompleted: updates.isCompletion }
            : t,
        ),
      );
    }
    logActivity("EDIT_COLUMN", `Updated column`, { id: columnId, ...updates });
  };

  const addTask = (columnId, taskData) => {
    const newTask = {
      id: `t_${Date.now()}`,
      columnId,
      ...taskData,
      trackedTime: 0,
      lastOccurrence: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
    logActivity("CREATE_TASK", `Created task "${taskData.text}"`, newTask);
    return newTask;
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    logActivity("DELETE_TASK", `Deleted task`, { id: taskId });
  };

  const updateTask = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    );
    logActivity("EDIT_TASK", `Updated task`, { id: taskId, ...updates });
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newCompletedState = !task.isCompleted;
          const currentColumn = columns.find((c) => c.id === task.columnId);
          let newColumnId = task.columnId;

          if (newCompletedState) {
            const completionCol = columns.find(
              (c) =>
                c.categoryId === currentColumn.categoryId && c.isCompletion,
            );
            if (completionCol) newColumnId = completionCol.id;
          } else {
            if (currentColumn.isCompletion) {
              const todoCol = columns.find(
                (c) =>
                  c.categoryId === currentColumn.categoryId && !c.isCompletion,
              );
              if (todoCol) newColumnId = todoCol.id;
            }
          }
          logActivity(
            "TOGGLE_TASK",
            `${newCompletedState ? "Completed" : "Uncompleted"} task`,
            { id: taskId },
          );
          return {
            ...task,
            isCompleted: newCompletedState,
            columnId: newColumnId,
          };
        }
        return task;
      }),
    );
  };

  const toggleChecklistItem = (taskId, itemId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newChecklist = (t.checklist || []).map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item,
          );
          return { ...t, checklist: newChecklist };
        }
        return t;
      }),
    );
  };

  const saveAsTemplate = (task) => {
    // Check if a template with the same title already exists
    const exists = templates.find(
      (t) => t.text.toLowerCase() === task.text.toLowerCase(),
    );
    if (exists) {
      throw new Error("A template with this title already exists.");
    }

    const {
      deadline,
      id,
      columnId,
      lastOccurrence,
      trackedTime,
      isCompleted,
      ...templateData
    } = task;
    const newTemplate = {
      id: `tmpl_${Date.now()}`,
      ...templateData,
      createdAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
    logActivity(
      "SAVE_TEMPLATE",
      `Saved task "${task.text}" as template`,
      newTemplate,
    );
    return newTemplate;
  };

  const deleteTemplate = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    logActivity("DELETE_TEMPLATE", `Deleted template`, { id });
  };

  const importWorkspace = (data) => {
    if (data.projects) setProjects(data.projects);
    if (data.categories) setCategories(data.categories);
    if (data.columns) setColumns(data.columns);
    if (data.tasks) setTasks(data.tasks);
    if (data.templates) setTemplates(data.templates);
    if (data.projects?.[0]) {
      setOpenTabs([data.projects[0]]);
      setActiveTabId(data.projects[0].id);
    }
    logActivity("IMPORT_WORKSPACE", "Imported workspace data");
  };

  return {
    // State
    projects,
    activeTabId,
    openTabs,
    categories,
    columns,
    tasks,
    templates,
    darkMode,
    zenModeCategoryId,
    activities,
    // State Setters
    setProjects,
    setActiveTabId,
    setOpenTabs,
    setCategories,
    setColumns,
    setTasks,
    setTemplates,
    setDarkMode,
    setZenModeCategoryId,
    // Actions
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
    logActivity,
  };
};
