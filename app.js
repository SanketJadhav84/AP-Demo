// Simple release checklist. Plain JavaScript, no build step.

const STORAGE_KEY = "release-checklist";

const form = document.getElementById("add-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const summary = document.getElementById("summary");
const emptyMessage = document.getElementById("empty");
const filterButtons = document.querySelectorAll("[data-filter]");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    // Storage can be blocked. The app still works for this session.
  }
}

function visibleTasks() {
  if (currentFilter === "open") return tasks.filter((task) => !task.done);
  if (currentFilter === "done") return tasks.filter((task) => task.done);
  return tasks;
}

function render() {
  list.innerHTML = "";

  visibleTasks().forEach((task) => {
    const item = document.createElement("li");
    if (task.done) item.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "task-" + task.id;
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = task.text;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", "Delete task: " + task.text);
    remove.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, label, remove);
    list.append(item);
  });

  const doneCount = tasks.filter((task) => task.done).length;
  summary.textContent = tasks.length === 0
    ? "No tasks yet"
    : doneCount + " of " + tasks.length + " tasks done";

  emptyMessage.hidden = visibleTasks().length > 0;

  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === currentFilter));
  });
}

function addTask(text) {
  tasks.push({ id: Date.now(), text: text, done: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task);
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = "";
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

render();
