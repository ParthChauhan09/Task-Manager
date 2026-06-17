/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatDateLabel(dateString: string): string {
  // dateString is in YYYY-MM-DD format
  const [year, month, day] = dateString.split('-').map(Number);
  // Create date using local timezone to avoid UTC shift
  const dateObj = new Date(year, month - 1, day);
  
  const today = new Date();
  const todayStr = formatDateISO(today);
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateISO(tomorrow);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateISO(yesterday);

  if (dateString === todayStr) {
    return "Today";
  } else if (dateString === tomorrowStr) {
    return "Tomorrow";
  } else if (dateString === yesterdayStr) {
    return "Yesterday";
  }

  // Format: "15 May 2026"
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return `${day} ${months[month - 1]} ${year}`;
}

export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return formatDateISO(new Date());
}

export function sortDatesChronologically(dates: string[]): string[] {
  return [...dates].sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
}
