// Main application JS for Task Manager
// See README for inline comments and logic

const STORAGE_KEY = 'tm_tasks_v1';
const taskForm = document.getElementById('taskForm');
const taskTableBody = document.getElementById('taskTableBody');

function saveToLocal(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadFromLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse local tasks', e);
    return [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Flatpickr for date
  flatpickr('#dueDate', {
    dateFormat: 'Y-m-d',
    allowInput: true,
    locale: navigator.language || 'default'
  });
  // Flatpickr for time (12-hour format with AM/PM)
  flatpickr('#dueTime', {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'h:i K',
    time_24hr: false,
    allowInput: true,
    locale: navigator.language || 'default'
  });
  renderTasks(loadFromLocal());
});

function formatDateTime(date, time) {
  if (!date && !time) return '';
  if (!date) return time;
  if (!time) return date;
  // Format using local string if possible
  try {
    const d = new Date(date + ' ' + time);
    return d.toLocaleString(navigator.language);
  } catch {
    return `${date} ${time}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderTasks(loadFromLocal());
});

function renderTasks(tasks) {
  taskTableBody.innerHTML = '';
  tasks.forEach((task, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="task-title ${'priority-' + task.priority.toLowerCase()} ${task.completed ? 'completed' : ''}">${task.title}</td>
      <td>${task.description || ''}</td>
      <td class="${'priority-' + task.priority.toLowerCase()}">${task.priority}</td>
      <td>${formatDateTime(task.dueDate, task.dueTime)}</td>
      <td>${task.completed ? 'Completed' : 'Pending'}</td>
      <td><div class="task-actions">
        <button class="button complete" data-idx="${idx}" title="${task.completed ? 'Undo' : 'Complete'}"><i class="fa ${task.completed ? 'fa-rotate-left' : 'fa-check'}"></i></button>
        <button class="button edit" data-idx="${idx}" title="Edit"><i class="fa fa-pen"></i></button>
        <button class="button delete" data-idx="${idx}" title="Delete"><i class="fa fa-trash"></i></button>
      </div></td>
    `;
    taskTableBody.appendChild(tr);
  });
}

async function fetchTasksFromAPI() {
  try {
    const res = await fetch('/api.php');
    if (!res.ok) throw new Error('Server returned ' + res.status);
    const payload = await res.json();
    saveToLocal(payload.data);
    return payload.data;
  } catch (err) {
    console.warn('Server fetch failed, falling back to local storage', err);
    return loadFromLocal();
  }
}

async function addTaskToAPI(task) {
  try {
    const res = await fetch('/api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Server create failed');
    const json = await res.json();
    return json.data; // expect server to return new id
  } catch (err) {
    // offline: save locally
    const tasks = loadFromLocal();
    tasks.push(task);
    saveToLocal(tasks);
    return { id: 'local-' + Date.now() };
  }
}

async function addTask(e) {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const priority = document.getElementById('priority').value;
  const dueDate = document.getElementById('dueDate').value;
  let dueTime = document.getElementById('dueTime').value;
  // Convert 12-hour time with AM/PM to 24-hour format (HH:mm:ss)
  if (dueTime) {
    // Try to parse using Date object
    const tempDate = new Date(`1970-01-01T${dueTime}`);
    if (!isNaN(tempDate.getTime())) {
      // Get hours, minutes, seconds in 24-hour format
      const hours = tempDate.getHours().toString().padStart(2, '0');
      const minutes = tempDate.getMinutes().toString().padStart(2, '0');
      const seconds = tempDate.getSeconds().toString().padStart(2, '0');
      dueTime = `${hours}:${minutes}:${seconds}`;
    } else {
      // Fallback: try manual conversion for 'h:mm AM/PM'
      const match = dueTime.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        const ap = match[3].toUpperCase();
        if (ap === 'PM' && h < 12) h += 12;
        if (ap === 'AM' && h === 12) h = 0;
        dueTime = `${h.toString().padStart(2, '0')}:${m}:00`;
      }
    }
  }
  // Add tags, recurring, completed
  const task = {
    title,
    description,
    priority,
    due_date: dueDate,
    due_time: dueTime,
    tags: null,
    recurring: null,
    completed: 'Pending' // Always set to Pending for new tasks
  };
  await addTaskToAPI(task);
  const tasks = await fetchTasksFromAPI();
  renderTasks(tasks);
  taskForm.reset();
}

taskForm.addEventListener('submit', addTask);

document.addEventListener('DOMContentLoaded', async () => {
  const tasks = await fetchTasksFromAPI();
  renderTasks(tasks);
});

taskTableBody.addEventListener('click', async function(e) {
  const btn = e.target.closest('button');
  const idx = btn?.dataset.idx;
  if (typeof idx === 'undefined') return;
  let tasks = await fetchTasksFromAPI();
  if (btn.classList.contains('delete')) {
    Swal.fire({
      title: 'Delete Task?',
      text: 'Are you sure you want to delete this task?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#1976d2',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Optionally implement delete in backend
        tasks.splice(idx, 1);
        saveToLocal(tasks);
        renderTasks(tasks);
        Swal.fire('Deleted!', 'Task has been deleted.', 'success');
      }
    });
  } else if (btn.classList.contains('complete')) {
    // Toggle completed status and update in backend
    const task = tasks[idx];
    task.completed = (task.completed === 'Pending') ? 'Completed' : 'Pending';
    await addTaskToAPI(task); // This should be a PATCH/PUT in a real app
    const updatedTasks = await fetchTasksFromAPI();
    renderTasks(updatedTasks);
  } else if (btn.classList.contains('edit')) {
    // Simple edit: populate form with task data
    const t = tasks[idx];
    document.getElementById('title').value = t.title;
    document.getElementById('description').value = t.description;
    document.getElementById('priority').value = t.priority;
    document.getElementById('dueDate').value = t.due_date || '';
    document.getElementById('dueTime').value = t.due_time || '';
    // Remove the old task so submit will overwrite
    tasks.splice(idx, 1);
    saveToLocal(tasks);
    renderTasks(tasks);
  }
});
