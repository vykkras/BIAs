const KEY = 'bia_processes';

export function getProcesses() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveProcesses(processes) {
  localStorage.setItem(KEY, JSON.stringify(processes));
}
