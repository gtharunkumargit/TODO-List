const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // For parsing application/json

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Change to your MySQL username
    password: '123456', // Change to your MySQL password
    database: 'todoApp'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Routes for CRUD operations

// Get all tasks
app.get('/tasks', (req, res) => {
    db.query('SELECT * FROM tasks', (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).send('Error fetching tasks');
        }
        res.json(results); // Return tasks as JSON
    });
});

// Add a new task
app.post('/add-task', (req, res) => {
    const { task } = req.body;

    if (!task) {
        return res.status(400).send('Task is required');
    }

    const query = 'INSERT INTO tasks (task, complete) VALUES (?, ?)';
    db.query(query, [task, false], (err, result) => {
        if (err) {
            console.error('Error adding task:', err);
            return res.status(500).send('Error adding task');
        }
        res.status(201).json({
            id: result.insertId,
            task: task,
            complete: false
        });
    });
});

// Delete a task by ID
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM tasks WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting task:', err);
            return res.status(500).send('Error deleting task');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Task not found');
        }
        res.status(200).send({ message: 'Task deleted successfully' });
    });
});

// Update a task completion status
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { complete } = req.body;

    const query = 'UPDATE tasks SET complete = ? WHERE id = ?';
    db.query(query, [complete, id], (err, result) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).send('Error updating task');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Task not found');
        }
        res.status(200).send({ message: 'Task updated successfully' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
