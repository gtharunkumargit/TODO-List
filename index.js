// API Base URL
const apiUrl = "http://localhost:3000";

// Helper function to update task counts
const updateTaskCounts = (tasks) => {
    const completedCount = tasks.filter(task => task.complete).length;
    const totalCount = tasks.length;

    document.getElementById('c-count').textContent = completedCount;
    document.getElementById('r-count').textContent = totalCount;
};

// Render tasks in the UI
const renderTasks = (tasks) => {
    const todoList = document.getElementById('all-todos');
    todoList.innerHTML = ''; // Clear existing tasks

    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.id = task.id;
        taskItem.classList.add('todo-item');
        taskItem.innerHTML = `
            <span id="task" class="${task.complete ? 'line' : ''}">${task.task}</span>
            <div class="actions">
                <button onclick="completeTodo(event)" class="btn btn-complete">
                    <i class="bx bx-check"></i>
                </button>
                <button onclick="deleteTodo(event)" class="btn btn-delete">
                    <i class="bx bx-trash"></i>
                </button>
            </div>
        `;
        todoList.appendChild(taskItem);
    });

    updateTaskCounts(tasks);
};

// Fetch tasks from the backend (MySQL)
const fetchTasks = async () => {
    try {
        const response = await fetch(`${apiUrl}/tasks`);
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
};

// Add a new task
const addTask = async () => {
    const todoInput = document.getElementById('todo-input');
    const value = todoInput.value.trim();
    if (value === '') {
        alert("Task cannot be empty");
        return;
    }

    try {
        await fetch(`${apiUrl}/add-task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task: value }),
        });

        fetchTasks(); // Refresh tasks after adding
    } catch (error) {
        console.error('Error adding task:', error);
    }

    todoInput.value = ''; // Clear input field
};

// Delete task by ID
const deleteTodo = async (e) => {
    const id = e.target.closest('.todo-item').id;

    try {
        const response = await fetch(`${apiUrl}/tasks/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchTasks(); // Refresh tasks after deletion
        } else {
            console.error('Error deleting task');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
};

// Mark task as complete/incomplete
const completeTodo = async (e) => {
    const id = e.target.closest('.todo-item').id;
    const complete = e.target.closest('.todo-item').querySelector('#task').classList.contains('line');

    try {
        const response = await fetch(`${apiUrl}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ complete: !complete }),
        });

        if (response.ok) {
            fetchTasks(); // Refresh tasks after updating
        } else {
            console.error('Error updating task');
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
};

// Delete all tasks
const deleteAllTasks = async () => {
    try {
        await fetch(`${apiUrl}/delete-all`, {
            method: 'DELETE',
        });

        fetchTasks(); // Refresh tasks
    } catch (error) {
        console.error('Error deleting all tasks:', error);
    }
};

// Delete selected tasks
const deleteSelectedTasks = async () => {
    const selectedTasks = Array.from(document.querySelectorAll('.todo-item .selected')).map(
        item => item.closest('.todo-item').id
    );

    try {
        await Promise.all(
            selectedTasks.map(id =>
                fetch(`${apiUrl}/tasks/${id}`, { method: 'DELETE' })
            )
        );

        fetchTasks(); // Refresh tasks
    } catch (error) {
        console.error('Error deleting selected tasks:', error);
    }
};

// Event listeners for buttons
document.getElementById('add-button').addEventListener('click', addTask);
document.getElementById('delete-all').addEventListener('click', deleteAllTasks);
document.getElementById('delete-selected').addEventListener('click', deleteSelectedTasks);

// Initial task fetch
fetchTasks();
