const express = require('express');
const { resolve } = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3010;

// Create SQLite database connection
const db = new sqlite3.Database('./data.db', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
});

// Middleware for parsing JSON request body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static('static'));

// UI
app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/about.html'));
});

app.get('/add_employee', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/add_employee.html'));
});

app.get('/list_employee', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/list_employee.html'));
});


// API
app.get('/initializedb', (req, res) => {
  // employees
  var sql = `CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER,
                position TEXT
            );`;
  db.run(sql, [], function(err) {
    if (err) {
      console.error('Error creating employee table:', err.message);
      res.status(500).json({ error: 'Error creating employee' });
      return;
    }
  });

  // attendance
  sql = `CREATE TABLE IF NOT EXISTS attendance (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              employee_id TEXT NOT NULL,
              recdate DATE NOT NULL,
              rectime TEXT NOT NULL,
              recstatus TEXT NOT NULL
          );`;
  db.run(sql, [], function(err) {
    if (err) {
      console.error('Error creating attendance table:', err.message);
      res.status(500).json({ error: 'Error creating attendance' });
      return;
    }
  });
});

app.get('/testdb', (res, req) => {
  const sql1 = 'SELECT * FROM employees';
  db.all(sql1, [], (err, rows) => {
    if (err) {
      console.error('Error fetching employees:', err.message);
      res.status(500).json({ error: 'Error fetching employees' });
      return;
    }
    //res.json(rows);
    if (rows.length > 0) {
      res.json({ "message": "employee table exists" })
    }
  });

  const sql2 = 'SELECT * FROM attendance';
  db.all(sql2, [], (err, rows) => {
    if (err) {
      console.error('Error fetching employees:', err.message);
      res.status(500).json({ error: 'Error fetching employees' });
      return;
    }
    //res.json(rows);
    if (rows.length > 0) {
      res.json({ "message": "attendance table exists" })
    }
  });
});

// Create employee
app.post('/employees', (req, res) => {
  const { name, age, position } = req.body;
  console.log(req.body);
  const sql = 'INSERT INTO employees (name, age, position) VALUES (?, ?, ?)';
  db.run(sql, [name, age, position], function(err) {
    if (err) {
      console.error('Error creating employee:', err.message);
      res.status(500).json({ error: 'Error creating employee' });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// Read all employees
app.get('/employees', (req, res) => {
  const sql = 'SELECT * FROM employees';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching employees:', err.message);
      res.status(500).json({ error: 'Error fetching employees' });
      return;
    }
    res.json(rows);
  });
});

// Update employee
app.put('/employees/:id', (req, res) => {
  const { name, age, position } = req.body;
  const id = req.params.id;
  const sql = 'UPDATE employees SET name = ?, age = ?, position = ? WHERE id = ?';
  db.run(sql, [name, age, position, id], function(err) {
    if (err) {
      console.error('Error updating employee:', err.message);
      res.status(500).json({ error: 'Error updating employee' });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    res.json({ message: 'Employee updated successfully' });
  });
});

// Delete employee
app.delete('/employees/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM employees WHERE id = ?';
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Error deleting employee:', err.message);
      res.status(500).json({ error: 'Error deleting employee' });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    res.json({ message: 'Employee deleted successfully' });
  });
});

// Close the database connection when the app exits
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Closed the SQLite database connection');
    process.exit(0);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});