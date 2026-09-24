// =========================
// DATA
// =========================

let tasks = JSON.parse(localStorage.getItem("gameTasks")) || [];

// =========================
// ELEMENTS
// =========================

const modal = document.getElementById("modal");

const newTaskBtn = document.getElementById("newTaskBtn");

const closeModal = document.getElementById("closeModal");

const taskForm = document.getElementById("taskForm");

const taskName = document.getElementById("taskName");
