/*
 * File Name: SophisticatedCode.js
 *
 * Description: This code demonstrates a sophisticated implementation of a web-based task management application.
 *              It includes user authentication, task creation, task assignment, task completion, and task listing.
 *              The code is written in JavaScript using Node.js and Express.js framework for the backend, and HTML,
 *              CSS, and JavaScript for the frontend.
 */

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Initialize the Express app
const app = express();

// Configure Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'sophisticatedSecretKey', // Secret key for session encryption
  resave: false,
  saveUninitialized: true
}));

// Create a User model
class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }
}

// User Database
let users = [];

// Create routes for user authentication
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    res.status(400).json({ message: 'Username already exists' });
  } else {
    // Encrypt the password
    bcrypt.genSalt(10, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;
        // Create and save the user
        const newUser = new User(username, hash);
        users.push(newUser);
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user with the provided username
  const user = users.find(user => user.username === username);
  if (user) {
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) throw err;
      // Check if the password matches
      if (result) {
        // Set the user session
        req.session.user = user.username;
        res.status(200).json({ message: 'User logged in successfully' });
      } else {
        res.status(401).json({ message: 'Invalid username or password' });
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

app.post('/logout', (req, res) => {
  // Destroy the user session
  req.session.destroy();
  res.status(200).json({ message: 'User logged out successfully' });
});

// Create a Task model
class Task {
  constructor(title, assignedUser = null) {
    this.title = title;
    this.completed = false;
    this.assignedUser = assignedUser;
  }
}

// Tasks Array
let tasks = [];

// Create routes for task management
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  const assignedUser = req.session.user || null;

  // Create and save the task
  const newTask = new Task(title, assignedUser);
  tasks.push(newTask);
  res.status(201).json({ message: 'Task created successfully', task: newTask });
});

app.put('/tasks/:id/complete', (req, res) => {
  const taskId = parseInt(req.params.id);

  // Find and update the task completion status
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex >= 0) {
    tasks[taskIndex].completed = true;
    res.status(200).json({ message: 'Task completed successfully', task: tasks[taskIndex] });
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

app.get('/tasks', (req, res) => {
  const assignedUser = req.session.user;

  // Get tasks filtered by assigned user
  const filteredTasks = tasks.filter(task => task.assignedUser === assignedUser);
  
  res.status(200).json({ tasks: filteredTasks });
});

// Start the server
const port = 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));