
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDateInput");
const priorityInput = document.getElementById("priorityInput");
const categoryInput = document.getElementById("categoryInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const sortOption = document.getElementById("sortOption");
const deleteCompletedBtn = document.getElementById("deleteCompletedBtn");
const alertBox = document.getElementById("alertBox");
const progressBar = document.getElementById("progressBar");



const toggleThemeBtn = document.getElementById("toggleTheme");
const themeIcon = document.getElementById("themeIcon");
const body = document.body;

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

window.onload = () => {
  const theme = localStorage.getItem("theme") || "light";
  setTheme(theme);
  renderTasks();
};

// Theme Toggle
toggleThemeBtn.addEventListener("click", () => {
  const newTheme = body.classList.contains("dark-mode") ? "light" : "dark";
  setTheme(newTheme);
});
function setTheme(theme) {
  if (theme === "dark") {
    body.classList.add("dark-mode");
    body.classList.remove("light-mode");
    themeIcon.classList.replace("fa-moon", "fa-sun");
  } else {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
    themeIcon.classList.replace("fa-sun", "fa-moon");
  }
  localStorage.setItem("theme", theme);
}

// Add Task
addTaskBtn.addEventListener("click", () => {
  const name = taskInput.value.trim();
  if (!name) return showAlert("Please enter a task name.", "warning");

  const task = {
    id: Date.now(),
    name,
    dueDate: dueDateInput.value || null,
    priority: priorityInput.value,
    category: categoryInput.value,
    completed: false,
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  showAlert("Task added successfully!", "success");

  taskInput.value = "";
  dueDateInput.value = "";
});

// Delete Completed Tasks
deleteCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
  showAlert("Completed tasks deleted.", "info");
});

// Live Events
searchInput.addEventListener("input", renderTasks);
filterCategory.addEventListener("change", renderTasks);
sortOption.addEventListener("change", renderTasks);

// Save to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
  taskList.innerHTML = "";

  // Search filter
  let filtered = tasks.filter(task =>
    task.name.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  // Category filter
  if (filterCategory.value !== "All") {
    filtered = filtered.filter(task => task.category === filterCategory.value);
  }

  // Sort
  if (sortOption.value === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption.value === "date") {
    filtered.sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
  } else if (sortOption.value === "priority") {
    const order = { High: 1, Medium: 2, Low: 3 };
    filtered.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  // Display each task
  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-start";

    const left = document.createElement("div");
    left.className = "flex-grow-1";

    const span = document.createElement("span");
    span.textContent = task.name;
    if (task.completed) span.classList.add("completed");
    span.style.cursor = "pointer";
    span.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    const badgeGroup = `
      <div>
        ${task.dueDate ? `<span class="badge bg-secondary me-1"><i class="fa fa-calendar-alt"></i> ${task.dueDate}</span>` : ""}
        <span class="badge bg-${priorityColor(task.priority)} me-1">${task.priority}</span>
        <span class="badge bg-info">${task.category}</span>
      </div>
    `;

    left.innerHTML = `<strong>${task.name}</strong>${badgeGroup}`;
    left.prepend(span);

    const right = document.createElement("div");

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-outline-secondary me-2";
    editBtn.innerHTML = `<i class="fas fa-pen"></i>`;
    editBtn.onclick = () => editTask(task);

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-sm btn-outline-danger";
    delBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
    delBtn.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
      showAlert("Task deleted.", "danger");
    };

    right.appendChild(editBtn);
    right.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(right);
    taskList.appendChild(li);
  });

  updateProgress();
}

// Edit Task
function editTask(task) {
  const newName = prompt("Edit task name:", task.name);
  if (newName) {
    task.name = newName;
    saveTasks();
    renderTasks();
    showAlert("Task updated.", "info");
  }
}

// Show Alert
function showAlert(msg, type = "info") {
  alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

// Update Progress Bar
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressBar.style.width = percent + "%";
  progressBar.textContent = percent + "%";
}

// Utility: Color by Priority
function priorityColor(level) {
  return level === "High" ? "danger" : level === "Medium" ? "warning" : "success";
}
