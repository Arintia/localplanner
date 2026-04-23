/**
 * @file icsExporter.js
 * @description Utility to generate iCalendar (.ics) files for syncing tasks with external calendars.
 */

export const exportTasksToICS = (tasks, projectName = "LocalPlanner") => {
  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LocalPlanner//NONSGML v1.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  tasks.forEach((task) => {
    if (!task.deadline) return;

    const dateStr = task.deadline.replace(/-/g, "");
    const startTime = `${dateStr}T090000Z`;
    const endTime = `${dateStr}T100000Z`;
    const createdTime =
      new Date().toISOString().replace(/[:.-]/g, "").slice(0, 15) + "Z";

    icsContent.push("BEGIN:VEVENT");
    icsContent.push(`UID:${task.id}@localplanner.app`);
    icsContent.push(`DTSTAMP:${createdTime}`);
    icsContent.push(`DTSTART;VALUE=DATE:${dateStr}`);
    icsContent.push(`SUMMARY:${task.text}`);
    if (task.description) {
      icsContent.push(`DESCRIPTION:${task.description.replace(/\n/g, "\\n")}`);
    }
    icsContent.push(`PRIORITY:${task.priority === "high" ? "1" : "5"}`);
    icsContent.push("END:VEVENT");
  });

  icsContent.push("END:VCALENDAR");

  const blob = new Blob([icsContent.join("\r\n")], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${projectName.toLowerCase().replace(/\s+/g, "-")}-deadlines.ics`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
