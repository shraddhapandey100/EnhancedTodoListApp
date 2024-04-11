import { v4 as uuidV4 } from "uuid"

type Task = {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: Date
}

const list = document.querySelector<HTMLUListElement>("#list")
const form = document.getElementById("new-task-form") as HTMLFormElement | null
const inputTitle = document.querySelector<HTMLInputElement>("#new-task-title")
const inputDescription = document.querySelector<HTMLInputElement>("#new-task-description")
const filterSelect = document.querySelector<HTMLSelectElement>("#filter-select")
let tasks: Task[] = loadTasks()
// Display tasks in ascending order based on creation time
tasks.sort((a, b) => {
  const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
  const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
  return dateA.getTime() - dateB.getTime();
});

tasks.forEach(addListItem)

// Event listeners
form?.addEventListener("submit", e => {
  e.preventDefault()

  const title = inputTitle?.value.trim()
  const description = inputDescription?.value.trim()

  if (!title) return

  const newTask: Task = {
    id: uuidV4(),
    title,
    description,
    completed: false,
    createdAt: new Date(),
  }
  tasks.push(newTask)
  saveTasks()

  addListItem(newTask)
  if (inputTitle?.value == "" || inputTitle?.value == null) return
  if (inputDescription?.value == "" || inputDescription?.value == null) return
  inputTitle.value = ""
  inputDescription.value = ""
})

// Function to add list item
function addListItem(task: Task) {
  const item = document.createElement("li");
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  const titleInput = document.createElement("input");
  const descriptionInput = document.createElement("textarea");
  const editButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  let isEditing = false;

  // Setup title input
  titleInput.type = "text";
  titleInput.value = task.title;
  titleInput.readOnly = true;

  // Setup description input
  descriptionInput.value = task.description || "";
  descriptionInput.readOnly = true;
  descriptionInput.rows = 1.5; // Adjust based on your preference

  // Checkbox for task completion
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    saveTasks();
  });

  // Edit button setup
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    isEditing = !isEditing;
    titleInput.readOnly = !isEditing;
    descriptionInput.readOnly = !isEditing;
    editButton.textContent = isEditing ? "Save" : "Edit";
    if (!isEditing) {
      // Update task on save
      task.title = titleInput.value;
      task.description = descriptionInput.value;
      saveTasks();
    }
  });

  // Delete button setup
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    tasks = tasks.filter(t => t.id !== task.id);
    saveTasks();
    item.remove();
  });

  // Append elements
  label.appendChild(checkbox);
  item.appendChild(label);
  item.appendChild(titleInput);
  item.appendChild(descriptionInput);
  item.appendChild(editButton);
  item.appendChild(deleteButton);
  list?.appendChild(item);
}
// Function to save tasks to localStorage
function saveTasks() {
  localStorage.setItem("TASKS", JSON.stringify(tasks))
}

// Function to load tasks from localStorage
function loadTasks(): Task[] {
  const taskJSON = localStorage.getItem("TASKS")
  if (taskJSON == null) return []
  return JSON.parse(taskJSON)
}

// Filter tasks based on completion status
filterSelect?.addEventListener("change", () => {
  const filterValue = filterSelect.value
  let filteredTasks: Task[];

  if (filterValue === "all") {
    filteredTasks = tasks;
  } else if (filterValue === "active") {
    filteredTasks = tasks.filter(task => !task.completed);
  } else if (filterValue === "completed") {
    filteredTasks = tasks.filter(task => task.completed);
  } else {
    return; // If filterValue is not recognized, do nothing
  }

  // Display tasks in ascending order based on creation time
  filteredTasks.sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
    return dateA.getTime() - dateB.getTime();
  });

  // Clear existing list before adding filtered tasks
  filteredTasks.forEach(addListItem);
});
