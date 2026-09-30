const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const prioritySelect = document.getElementById("priority-select");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const todayDate = document.getElementById("today-date");
const totalCount = document.getElementById("total-count");
const doneCount = document.getElementById("done-count");
const leftCount = document.getElementById("left-count");

const STORAGE_KEY = "office-todos";
const PRIORITY_LABELS = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

function formatDate() {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function normalizePriority(value) {
  return PRIORITY_LABELS[value] ? value : "medium";
}

function loadTodos() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const items = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.items)
        ? parsed.items
        : [];
    return items.map((todo) => ({
      id: todo.id,
      text: todo.text,
      done: Boolean(todo.done),
      priority: normalizePriority(todo.priority),
    }));
  } catch {
    return [];
  }
}

function saveTodos(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let todos = loadTodos();

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function render() {
  list.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item${todo.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.setAttribute("aria-label", "완료 체크");
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const badge = document.createElement("span");
    badge.className = `priority-badge ${todo.priority}`;
    badge.textContent = PRIORITY_LABELS[todo.priority];

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.type = "button";
    del.textContent = "삭제";
    del.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, badge, text, del);
    list.appendChild(li);
  });

  const done = todos.filter((t) => t.done).length;
  totalCount.textContent = String(todos.length);
  doneCount.textContent = String(done);
  leftCount.textContent = String(todos.length - done);
  emptyState.classList.toggle("hidden", todos.length > 0);
}

function addTodo(text, priority) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos = [
    {
      id: uid(),
      text: trimmed,
      done: false,
      priority: normalizePriority(priority),
    },
    ...todos,
  ];
  saveTodos(todos);
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  );
  saveTodos(todos);
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos(todos);
  render();
}

function submitTodo() {
  addTodo(input.value, prioritySelect.value);
  input.value = "";
  input.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitTodo();
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitTodo();
  }
});

todayDate.textContent = formatDate();
render();
