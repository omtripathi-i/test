const STORAGE_KEY = "taskflow.tasks.v1";

const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterButtons = document.querySelectorAll(".filter-btn");
const taskItemTemplate = document.getElementById("taskItemTemplate");

/** @type {{id: string, title: string, completed: boolean, dueDate: string}[]} */
let tasks = [];
let currentFilter = "all";

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch {
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getVisibleTasks() {
  if (currentFilter === "active") return tasks.filter((task) => !task.completed);
  if (currentFilter === "completed") return tasks.filter((task) => task.completed);
  return tasks;
}

function updateCount() {
  const remaining = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left`;
}

function renderTasks() {
  taskList.textContent = "";

  const visibleTasks = getVisibleTasks();

  if (!visibleTasks.length) {
    const emptyState = document.createElement("li");
    emptyState.className = "task-item";
    emptyState.textContent = "No tasks in this view.";
    taskList.append(emptyState);
    updateCount();
    return;
  }

  visibleTasks.forEach((task) => {
    const item = taskItemTemplate.content.firstElementChild.cloneNode(true);

    const toggle = item.querySelector(".task-toggle");
    const title = item.querySelector(".task-title");
    const dueDate = item.querySelector(".task-date");
    const deleteBtn = item.querySelector(".delete-btn");

    title.textContent = task.title;
    toggle.checked = task.completed;
    dueDate.textContent = formatDate(task.dueDate);

    if (task.completed) {
      item.classList.add("completed");
    }

    toggle.addEventListener("change", () => {
      task.completed = toggle.checked;
      saveTasks();
      renderTasks();
    });

    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter((existingTask) => existingTask.id !== task.id);
      saveTasks();
      renderTasks();
    });

    taskList.append(item);
  });

  updateCount();
}

function addTask() {
  const title = taskInput.value.trim();

  if (!title) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    completed: false,
    dueDate: taskDate.value
  });

  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskDate.value = "";
  taskInput.focus();
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

loadTasks();
renderTasks();
