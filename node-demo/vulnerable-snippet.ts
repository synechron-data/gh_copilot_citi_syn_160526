// vulnerable-snippet.ts
//
// USE FOR DEMO ONLY — Module 4.4 Custom Slash Command (/review-security).
//
// This file contains deliberate security vulnerabilities. It is the input
// against which the trainer demos the custom /review-security slash command.
//
// Do NOT use this code anywhere outside the training session.

import express, { type Request, type Response } from 'express';
import { exec } from 'node:child_process';
import { readFile } from 'node:fs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql';

const app = express();
app.use(express.json());

// 🔴 Hardcoded secret (Sensitive Data Exposure / Security Misconfiguration)
const JWT_SECRET = 'super_secret_dev_key_123';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'app',
});

// 🔴 SQL Injection — string concatenation into query
app.get('/users/search', (req: Request, res: Response) => {
  const name = req.query.name as string;
  const query = `SELECT * FROM users WHERE name = '${name}'`;
  db.query(query, (err, results) => {
    if (err) {
      // 🔴 Sensitive Data Exposure — full error including stack returned to client
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// 🔴 Command Injection — user input passed directly into shell
app.get('/ping', (req: Request, res: Response) => {
  const host = req.query.host as string;
  exec(`ping -c 1 ${host}`, (err, stdout) => {
    if (err) return res.status(500).send(err.message);
    res.send(stdout);
  });
});

// 🔴 Path Traversal — no validation of user-supplied path
app.get('/files', (req: Request, res: Response) => {
  const filename = req.query.name as string;
  readFile(`/var/data/${filename}`, 'utf8', (err, contents) => {
    if (err) return res.status(404).send('Not found');
    res.send(contents);
  });
});

// 🔴 Broken Authentication — JWT verification disabled, secret logged
app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // 🔴 Logs the password in plaintext (Sensitive Data Exposure)
  console.log(`Login attempt: user=${username}, password=${password}`);

  // 🔴 No actual password check
  if (username) {
    // 🔴 None algorithm permitted in production
    const token = jwt.sign({ user: username }, JWT_SECRET, {
      algorithm: 'none',
    });
    return res.json({ token });
  }
  res.status(401).send('Unauthorized');
});

// 🔴 Broken Access Control — any authenticated user can delete any other user
app.delete('/users/:id', (req: Request, res: Response) => {
  const auth = req.headers.authorization?.split(' ')[1];
  // 🔴 Verifies but doesn't check ownership or admin role
  try {
    jwt.verify(auth ?? '', JWT_SECRET);
    db.query(`DELETE FROM users WHERE id = ${req.params.id}`, () => {
      res.status(204).end();
    });
  } catch {
    res.status(401).send('Unauthorized');
  }
});

// 🔴 Reflected XSS — user input echoed unescaped in HTML response
app.get('/greet', (req: Request, res: Response) => {
  const name = req.query.name;
  res.send(`<h1>Hello, ${name}!</h1>`);
});

// 🔴 Insecure Deserialization — eval on user input
app.post('/eval', (req: Request, res: Response) => {
  const result = eval(req.body.expression);
  res.json({ result });
});

app.listen(3000);
