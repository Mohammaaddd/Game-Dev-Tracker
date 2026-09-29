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

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newTask = {
    name: taskName.value,
    description: taskDescription.value,
    status: taskStatus.value,
    priority: taskPriority.value,
  };

  try {
    const response = await fetch("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });

    if (!response.ok) {
      throw new Error("Failed to create task");
    }

    const createdTask = await response.json();

    tasks.push(createdTask);

    renderTasks();

    taskForm.reset();

    modal.classList.add("hidden");
  } catch (error) {
    console.error("Error creating task:", error);
  }
});

// =========================
// SAVE
// =========================

// function saveTasks() {
//   localStorage.setItem("gameTasks", JSON.stringify(tasks));
// }

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

async function setupDropZones() {
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
    taskList.addEventListener("drop", async (event) => {
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

      const updatedStatus = statusMap[newStatus];

      try {
        const response = await fetch(
          `http://localhost:3000/api/tasks/${taskId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: updatedStatus,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update task");
        }

        const updatedTask = await response.json();

        // Replace the old task with the updated task
        const index = tasks.findIndex((task) => task.id === taskId);

        tasks[index] = updatedTask;

        renderTasks();
      } catch (error) {
        console.error("Error updating task:", error);
      }
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

  deleteArea.addEventListener("drop", async (event) => {
    event.preventDefault();

    //remove the visual drag over effect
    deleteArea.classList.remove("drag-over");

    //get the id of the task being dragged
    const taskId = Number(event.dataTransfer.getData("text/plain"));

    try {
      const response = await fetch(
        `http://localhost:3000/api/tasks/${taskId}`,
        {
          method: "DELETE",
        },
      );

      //check if the response is ok
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      //remove the task from the frontend array
      tasks = tasks.filter((task) => task.id !== taskId);

      //update the board
      renderTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
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

async function loadTasks() {
  try {
    const response = await fetch("http://localhost:3000/api/tasks");

    if (!response.ok) {
      throw new Error("failed to load tasks");
    }

    tasks = await response.json();

    renderTasks();
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

loadTasks();
