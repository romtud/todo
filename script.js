// Detta är js uppdaterad javascriptkod


const STORAGE_KEY = "taskflow.todos";

const state = {
  todos: loadTodos(),
  filter: "all",
};

/* --------------------------------
   DOM
-------------------------------- */

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const taskCounter = document.querySelector("#task-counter");
const clearCompletedButton = document.querySelector("#clear-completed");

const filterButtons = document.querySelectorAll(".filter-button");

/* --------------------------------
   STORAGE
-------------------------------- */

function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const todos = JSON.parse(stored);

    if (!Array.isArray(todos)) {
      return [];
    }

    return todos;
  } catch (error) {
    console.error("Kunde inte läsa uppgifter:", error);

    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
}

/* --------------------------------
   ID
-------------------------------- */

function createId() {
  return crypto.randomUUID();
}

/* --------------------------------
   ADD TODO
-------------------------------- */

function addTodo(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    return;
  }

  const todo = {
    id: createId(),
    text: cleanText,
    completed: false,
    createdAt: Date.now(),
  };

  state.todos.unshift(todo);

  saveTodos();
  render();

  input.value = "";
  input.focus();
}

/* --------------------------------
   TOGGLE TODO
-------------------------------- */

function toggleTodo(id) {
  state.todos = state.todos.map((todo) => {
    if (todo.id !== id) {
      return todo;
    }

    return {
      ...todo,
      completed: !todo.completed,
    };
  });

  saveTodos();
  render();
}

/* --------------------------------
   DELETE TODO
-------------------------------- */

function deleteTodo(id) {
  state.todos = state.todos.filter((todo) => todo.id !== id);

  saveTodos();
  render();
}

/* --------------------------------
   CLEAR COMPLETED
-------------------------------- */

function clearCompleted() {
  state.todos = state.todos.filter((todo) => !todo.completed);

  saveTodos();
  render();
}

/* --------------------------------
   FILTER
-------------------------------- */

function getFilteredTodos() {
  switch (state.filter) {
    case "active":
      return state.todos.filter((todo) => !todo.completed);

    case "completed":
      return state.todos.filter((todo) => todo.completed);

    default:
      return state.todos;
  }
}

/* --------------------------------
   CREATE TODO ELEMENT
-------------------------------- */

function createTodoElement(todo) {
  const li = document.createElement("li");

  li.className = "todo-item";

  if (todo.completed) {
    li.classList.add("completed");
  }

  li.dataset.id = todo.id;

  /*
   * Checkbox
   */

  const checkButton = document.createElement("button");

  checkButton.type = "button";
  checkButton.className = "check-button";

  checkButton.setAttribute(
    "aria-label",
    todo.completed
      ? `Markera "${todo.text}" som aktiv`
      : `Markera "${todo.text}" som klar`,
  );

  checkButton.setAttribute("aria-pressed", String(todo.completed));

  const checkIcon = document.createElement("span");

  checkIcon.className = "check-icon";
  checkIcon.textContent = "✓";

  checkButton.appendChild(checkIcon);

  /*
   * Text
   */

  const text = document.createElement("span");

  text.className = "todo-text";

  /*
   * textContent används istället för innerHTML.
   * Det gör att användarens input inte kan
   * injicera HTML/JavaScript i sidan.
   */
  text.textContent = todo.text;

  /*
   * Delete
   */

  const deleteButton = document.createElement("button");

  deleteButton.type = "button";
  deleteButton.className = "delete-button";

  deleteButton.setAttribute("aria-label", `Ta bort "${todo.text}"`);

  deleteButton.textContent = "×";

  /*
   * Events
   */

  checkButton.addEventListener("click", () => toggleTodo(todo.id));

  deleteButton.addEventListener("click", () => deleteTodo(todo.id));

  /*
   * Build element
   */

  li.append(checkButton, text, deleteButton);

  return li;
}

/* --------------------------------
   RENDER
-------------------------------- */

function render() {
  const filteredTodos = getFilteredTodos();

  /*
   * Clear list
   */

  todoList.replaceChildren();

  /*
   * Add items
   */

  filteredTodos.forEach((todo) => {
    const element = createTodoElement(todo);

    todoList.appendChild(element);
  });

  /*
   * Empty state
   */

  emptyState.hidden = filteredTodos.length !== 0;

  /*
   * Counter
   */

  const activeCount = state.todos.filter((todo) => !todo.completed).length;

  taskCounter.textContent = `${activeCount} ${
    activeCount === 1 ? "aktiv" : "aktiva"
  }`;

  /*
   * Filter buttons
   */

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === state.filter;

    button.classList.toggle("active", isActive);

    button.setAttribute("aria-pressed", String(isActive));
  });

  /*
   * Clear completed button
   */

  const completedCount = state.todos.filter((todo) => todo.completed).length;

  clearCompletedButton.disabled = completedCount === 0;

  clearCompletedButton.style.opacity = completedCount === 0 ? "0.4" : "1";

  clearCompletedButton.style.cursor =
    completedCount === 0 ? "default" : "pointer";
}

/* --------------------------------
   FORM EVENT
-------------------------------- */

form.addEventListener("submit", (event) => {
  event.preventDefault();

  addTodo(input.value);
});

/* --------------------------------
   FILTER EVENTS
-------------------------------- */

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;

    render();
  });
});

/* --------------------------------
   CLEAR COMPLETED EVENT
-------------------------------- */

clearCompletedButton.addEventListener("click", clearCompleted);

/* --------------------------------
   INITIAL RENDER
-------------------------------- */

render();
