/**
 * @file boardConstants.js
 * @description Curated theme colors and column styles for the Kanban board.
 */

export const COLUMN_COLORS = [
  {
    id: "zinc",
    bg: "bg-zinc-50/50 dark:bg-zinc-900/30",
    border: "border-zinc-100 dark:border-zinc-800",
    text: "text-zinc-700 dark:text-zinc-300",
    dot: "bg-zinc-300",
  },
  {
    id: "blue",
    bg: "bg-blue-50/50 dark:bg-blue-900/10",
    border: "border-blue-100 dark:border-blue-900/50",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-300",
  },
  {
    id: "emerald",
    bg: "bg-emerald-50/50 dark:bg-emerald-900/10",
    border: "border-emerald-100 dark:border-emerald-900/50",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-300",
  },
  {
    id: "amber",
    bg: "bg-amber-50/50 dark:bg-amber-900/10",
    border: "border-amber-100 dark:border-amber-900/50",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-300",
  },
  {
    id: "rose",
    bg: "bg-rose-50/50 dark:bg-rose-900/10",
    border: "border-rose-100 dark:border-rose-900/50",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-300",
  },
  {
    id: "purple",
    bg: "bg-purple-50/50 dark:bg-purple-900/10",
    border: "border-purple-100 dark:border-purple-900/50",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-300",
  },
];

export const PRIORITY_LEVELS = {
  HIGH: "high",
  STANDARD: "standard",
};

export const RECURRENCE_TYPES = {
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
};
