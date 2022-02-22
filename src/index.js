const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const req = require('express/lib/request');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({error: "User not exists!"})
  } 

  request.user = user;

  return next()
}

function checksExistsTodoById(request, response, next) {
  const user = request.user;
  const queryId = request.query;

  const todoPut = user.todos.find((todo) => {
    if (todo.id === queryId.id) {
      request.todo = todo
    } 
  })

  console.log(todoPut)
  
  if (!request.todo) {
    return response.status(404).json({ error: "To Do not found!"})
  }
  

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const userAlreadyExists = users.find((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({error: "User already exists!"})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }
  
  users.push(user);

  return response.status(201).json({users});
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const user = request.user;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    createdAt: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodoById, (request, response) => {
  const { title, deadline } = request.body;
  const todo = request.todo;

  todo.title = title;
  todo.deadline = deadline;

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodoById, (request, response) => {
  const todo = request.todo;

  todo.done = true;

  return response.status(201).json(todo);
}); 

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodoById, (request, response) => {
  const todo = request.todo;
  const user = request.user;

  const todoIndex = user.todos.indexOf(todo)
  user.todos.splice(todoIndex, 1)

  return response.status(204).json(user.todos)
});

module.exports = app;