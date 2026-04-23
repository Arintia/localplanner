/**
 * @file formatters.js
 * @description Utility functions for data formatting.
 */

/**
 * Formats seconds into a HH:MM:SS string.
 * @param {number} totalSeconds
 * @returns {string}
 */
export const formatTime = (totalSeconds) => {
  if (!totalSeconds || totalSeconds < 0) return "00:00:00";
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Strips HTML-like tags or simplifies markdown for short previews.
 * @param {string} text
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
