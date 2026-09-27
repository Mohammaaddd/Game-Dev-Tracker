// =========================
// DATA
// =========================

let tasks = JSON.parse(localStorage.getItem("gameTasks")) || [];

let draggedTaskId = null;

// =========================
// ELEMENTS
// =========================

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

newTaskBtn.addEventListener("click", () => {
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

  taskForm.reset();

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

  // Create task elements

  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);

    columns[task.status].appendChild(taskElement);
  });

  setupDropZones();

  updateStatistics();
}

// =========================
// CREATE TASK
// =========================

function createTaskElement(task) {
  const div = document.createElement("div");

  div.classList.add("task");

  // Make task draggable
  div.draggable = true;

  // Store task ID on the element
  div.dataset.id = task.id;

  div.innerHTML = `

        <h4>${escapeHTML(task.name)}</h4>

        <p>
            ${escapeHTML(task.description || "No description.")}
        </p>

        <span class="priority ${task.priority}">
            ${task.priority}
        </span>

    `;

  // =========================
  // DRAG START
  // =========================

  div.addEventListener("dragstart", (event) => {
    draggedTaskId = Number(event.currentTarget.dataset.id);

    event.dataTransfer.setData("text/plain", draggedTaskId);

    event.dataTransfer.effectAllowed = "move";

    div.classList.add("dragging");
  });

  // =========================
  // DRAG END
  // =========================

  div.addEventListener("dragend", () => {
    draggedTaskId = null;

    div.classList.remove("dragging");
  });

  return div;
}

// =========================
// DROP ZONES
// =========================

function setupDropZones() {
  const columns = document.querySelectorAll(".column");

  columns.forEach((column) => {
    const taskList = column.querySelector(".task-list");

    // Allow dropping
    taskList.addEventListener("dragover", (event) => {
      event.preventDefault();

      event.dataTransfer.dropEffect = "move";

      taskList.classList.add("drag-over");
    });

    // Remove visual feedback
    taskList.addEventListener("dragleave", (event) => {
      if (!taskList.contains(event.relatedTarget)) {
        taskList.classList.remove("drag-over");
      }
    });

    // Handle drop
    taskList.addEventListener("drop", (event) => {
      event.preventDefault();

      taskList.classList.remove("drag-over");

      const taskId = Number(event.dataTransfer.getData("text/plain"));

      // Find the task
      const task = tasks.find((task) => task.id === taskId);

      if (!task) {
        return;
      }

      // Get the new status
      const newStatus = taskList.parentElement.querySelector("h3").textContent;

      // Convert column name to status
      const statusMap = {
        Ideas: "ideas",

        "To Do": "todo",

        "In Progress": "inProgress",

        Done: "done",
      };

      task.status = statusMap[newStatus];

      saveTasks();

      renderTasks();
    });
  });

  const deleteArea = document.getElementById("deleteArea");

  deleteArea.addEventListener("dragover", (event) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    deleteArea.classList.add("drag-over");
  });

  deleteArea.addEventListener("dragleave", (event) => {
    if (!deleteArea.contains(event.relatedTarget)) {
      deleteArea.classList.remove("drag-over");
    }
  });

  deleteArea.addEventListener("drop", (event) => {
    event.preventDefault();

    deleteArea.classList.remove("drag-over");

    const taskId = Number(event.dataTransfer.getData("text/plain"));

    // Remove the task
    tasks = tasks.filter((task) => task.id !== taskId);

    saveTasks();

    renderTasks();
  });
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
// BASIC HTML ESCAPING
// =========================

function escapeHTML(text) {
  const element = document.createElement("div");

  element.textContent = text;

  return element.innerHTML;
}

// =========================
// INITIAL LOAD
// =========================

renderTasks();
