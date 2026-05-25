const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory database
let users = [
  { id: '1', email: 'admin@projecthub.com', password: 'Admin@123', name: 'Admin User', role: 'admin' },
  { id: '2', email: 'user@projecthub.com', password: 'User@123', name: 'Regular User', role: 'user' }
];

let projects = [
  { id: '1', name: 'E-Commerce Platform', status: 'active', priority: 'high', owner: 'Admin User', createdAt: '2024-01-15', description: 'Build modern e-commerce solution' },
  { id: '2', name: 'Mobile App Redesign', status: 'planning', priority: 'medium', owner: 'Regular User', createdAt: '2024-02-01', description: 'Redesign mobile application UI/UX' }
];

let tasks = [
  { id: '1', projectId: '1', title: 'Setup CI/CD Pipeline', status: 'completed', assignee: 'Admin User', priority: 'high', dueDate: '2024-03-01' },
  { id: '2', projectId: '1', title: 'Implement Payment Gateway', status: 'in-progress', assignee: 'Regular User', priority: 'high', dueDate: '2024-03-15' },
  { id: '3', projectId: '2', title: 'Create Wireframes', status: 'todo', assignee: 'Admin User', priority: 'medium', dueDate: '2024-03-20' }
];

let sessions = {};

// Authentication API
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = uuidv4();
    sessions[token] = { userId: user.id, email: user.email, role: user.role };
    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role } 
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) delete sessions[token];
  res.json({ success: true });
});

// Middleware to verify token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && sessions[token]) {
    req.user = sessions[token];
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// Projects API
app.get('/api/projects', authenticate, (req, res) => {
  const { status, priority, search } = req.query;
  let filtered = [...projects];
  
  if (status) filtered = filtered.filter(p => p.status === status);
  if (priority) filtered = filtered.filter(p => p.priority === priority);
  if (search) filtered = filtered.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );
  
  res.json({ success: true, data: filtered, total: filtered.length });
});

app.get('/api/projects/:id', authenticate, (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (project) {
    res.json({ success: true, data: project });
  } else {
    res.status(404).json({ success: false, message: 'Project not found' });
  }
});

app.post('/api/projects', authenticate, (req, res) => {
  const { name, status, priority, description } = req.body;
  
  if (!name || !status || !priority) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const newProject = {
    id: uuidv4(),
    name,
    status,
    priority,
    description: description || '',
    owner: req.user.email,
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  projects.push(newProject);
  res.status(201).json({ success: true, data: newProject });
});

app.put('/api/projects/:id', authenticate, (req, res) => {
  const index = projects.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  
  projects[index] = { ...projects[index], ...req.body };
  res.json({ success: true, data: projects[index] });
});

app.delete('/api/projects/:id', authenticate, (req, res) => {
  const index = projects.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  
  projects.splice(index, 1);
  tasks = tasks.filter(t => t.projectId !== req.params.id);
  res.json({ success: true, message: 'Project deleted' });
});

// Tasks API
app.get('/api/tasks', authenticate, (req, res) => {
  const { projectId, status } = req.query;
  let filtered = [...tasks];
  
  if (projectId) filtered = filtered.filter(t => t.projectId === projectId);
  if (status) filtered = filtered.filter(t => t.status === status);
  
  res.json({ success: true, data: filtered, total: filtered.length });
});

app.post('/api/tasks', authenticate, (req, res) => {
  const { projectId, title, status, assignee, priority, dueDate } = req.body;
  
  if (!projectId || !title || !status) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const newTask = {
    id: uuidv4(),
    projectId,
    title,
    status,
    assignee: assignee || '',
    priority: priority || 'medium',
    dueDate: dueDate || ''
  };
  
  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

app.put('/api/tasks/:id', authenticate, (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  
  tasks[index] = { ...tasks[index], ...req.body };
  res.json({ success: true, data: tasks[index] });
});

app.delete('/api/tasks/:id', authenticate, (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  
  tasks.splice(index, 1);
  res.json({ success: true, message: 'Task deleted' });
});

// Dashboard API
app.get('/api/dashboard/stats', authenticate, (req, res) => {
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    todoTasks: tasks.filter(t => t.status === 'todo').length
  };
  
  res.json({ success: true, data: stats });
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'projects.html'));
});

app.listen(PORT, () => {
  console.log(`ProjectHub Demo App running on http://localhost:${PORT}`);
});
