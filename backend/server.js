const express = require("express");
const cors = require("cors");

const db = require("./database");

const app = express();

const PORT = process.env.PORT || 3000;

//allow express to read json
app.use(express.json());
app.use(cors());

//test route
app.get("/", (req, res) => {
  res.json({ message: "Game Dev Tracker API is running!" });
});

//create new task
app.post("/api/tasks", (req, res) => {
  const { name, description, status, priority } = req.body;

  if (!name || !status || !priority) {
    return res.status(400).json({
      error: "Name, status and priority are required.",
    });
  }

  const statement = db.prepare(`
        INSERT INTO tasks
        (name, description, status, priority)
        VALUES (?, ?, ?, ?)
    `);

  const result = statement.run(name, description || "", status, priority);

  const task = db
    .prepare(
      `
        SELECT *
        FROM tasks
        WHERE id = ?
    `,
    )
    .get(result.lastInsertRowid);

  res.status(201).json(task);
});

//get all tasks
app.get("/api/tasks", (req, res) => {
  const tasks = db.prepare(`SELECT * FROM tasks`).all();

  res.json(tasks);
});

//update task
app.patch("/api/tasks/:id", (req, res) => {
  const { id } = req.params;

  const { name, description, status, priority } = req.body;

  const existingTask = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(id);

  if (!existingTask) {
    return res.status(404).json({ error: "Task not found." });
  }

  const updatedName = name ?? existingTask.name;
  const updatedDescription = description ?? existingTask.description;
  const updatedStatus = status ?? existingTask.status;
  const updatedPriority = priority ?? existingTask.priority;

  db.prepare(
    `
        UPDATE tasks SET name = ?, description = ?, status = ?, priority = ?
        WHERE id = ?
`,
  ).run(updatedName, updatedDescription, updatedStatus, updatedPriority, id);

  const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

  res.json(updatedTask);
});

//delete task
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;

  const existingTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);

  if (!existingTask) {
    return res.status(404).json({
      error: "Task not found.",
    });
  }

  db.prepare(
    `
        DELETE FROM tasks
        WHERE id = ?
    `,
  ).run(id);

  res.json({
    message: "Task deleted successfully.",
  });
});

//start server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
