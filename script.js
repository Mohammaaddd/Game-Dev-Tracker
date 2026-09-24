// =========================
// DATA
// =========================

let tasks = JSON.parse(localStorage.getItem("gameTasks")) || [];

// =========================
// ELEMENTS
// =========================

const topBar = document.querySelector(".topbar");

const modal = document.getElementById("modal");

const newTaskBtn = document.getElementById("newTaskBtn");

const closeModal = document.getElementById("closeModal");

const taskForm = document.getElementById("taskForm");

const taskName = document.getElementById("taskName");

const taskDescription = document.getElementById("taskDescription");

const taskStatus = document.getElementById("taskStatus");

const taskPriority = document.getElementById("taskPriority");

// =========================
// OPEN MODAL
// =========================

newTaskBtn.addEventListener("click", (e) => {
  modal.classList.remove("hidden");
  taskName.focus();
});

// =========================
// CLOSE MODAL
// =========================

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});

// =========================
// ADD TASK
// =========================

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const newTask = {
    id: Date.now(),

    name: taskName.value,

    description: taskDescription.value,

    status: taskStatus.value,

    priority: taskPriority.value,
  };

  tasks.push(newTask);

  saveTasks();

  renderTasks();

  modal.classList.add("hidden");
});

// =========================
// SAVE
// =========================

function saveTasks() {
  localStorage.setItem("gameTasks", JSON.stringify(tasks));
}

// =========================
// RENDER TASKS
// =========================

function renderTasks() {
  const columns = {
    ideas: document.getElementById("ideas"),
    todo: document.getElementById("todo"),
    inProgress: document.getElementById("inProgress"),
    done: document.getElementById("done"),
  };

  // Clear columns

  Object.values(columns).forEach((column) => {
    column.innerHTML = "";
  });

  //add tasks

  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);

    columns[task.status].appendChild(taskElement);
  });

  updateStatistics();
}

// =========================
// CREATE TASK ELEMENT
// =========================

function createTaskElement(task) {
  const div = document.createElement("div");

  div.classList.add("task");

  div.innerHTML = `

        <h4>${task.name}</h4>

        <p>${task.description || "No description."}</p>

        <span class="priority ${task.priority}">
            ${task.priority}
        </span>

    `;

  return div;
}

// =========================
// STATISTICS
// =========================

function updateStatistics() {
  const total = tasks.length;

  const completed = tasks.filter((task) => task.status === "done").length;

  let percentage = 0;

  if (total > 0) {
    percentage = Math.round((completed / total) * 100);
  }

  document.getElementById("progress").textContent = `${percentage}%`;

  document.getElementById("progressText").textContent = `${percentage}%`;

  document.getElementById("progressFill").style.width = `${percentage}%`;

  document.getElementById("taskCount").textContent = `${completed} / ${total}`;

  updateColumnCount("ideas", "ideasCount");

  updateColumnCount("todo", "todoCount");

  updateColumnCount("inProgress", "progressCount");

  updateColumnCount("done", "doneCount");
}

// =========================
// COLUMN COUNTS
// =========================

function updateColumnCount(status, elementId) {
  const count = tasks.filter((task) => task.status === status).length;

  document.getElementById(elementId).textContent = count;
}

// =========================
// INITIAL LOAD
// =========================

renderTasks();
