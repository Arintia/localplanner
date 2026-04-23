/**
 * @file storage.js
 * @description Utilities for data persistence and portability (Import/Export).
 */

/**
 * Downloads a JSON object as a file.
 * @param {Object} data
 * @param {string} filename
 */
export const downloadJson = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Parses a JSON file from a file input event.
 * @param {Event} event
 * @returns {Promise<Object>}
 */
export const parseJsonFile = (event) => {
  return new Promise((resolve, reject) => {
    const file = event.target.files[0];
    if (!file) return reject("No file selected");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (err) {
        reject("Invalid JSON file");
      }
    };
    reader.onerror = () => reject("Error reading file");
    reader.readAsText(file);
  });
};
