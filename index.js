const express = require('express');
const users = require('./mock-data.json')
const fs = require('fs');
const PORT = 8000;

const app = express();

// Middleware - Plugin
app.use(express.urlencoded({ extended: false }))

app.get('/users', (req, res) => {
  const html = `
  <ul>
    ${users.map((user) => `<li> ${user.first_name} </li>`).join("")}
  </ul>
  `
  res.send(html);
})

app.get("/api/users", (req, res) => {
  return res.json(users);
})

app.get('/api/user/:id', (req, res) => {
  const id = Number(req.params.id);

  const user = users.find((user) => user.id === id);

  return res.json(user);
})

app.post('/api/user', (req, res) => {
  const body = req.body;
  // console.log(body); // it will give undefined without using middleware
  users.push({ ...body, id: users.length+1 });
  fs.writeFile('./mock-data.json', JSON.stringify(users), (err, data) => {
    return res.json({ status: 'success', id: users.length });
  })
})

app.patch('/api/user/:id', (req, res) => {
  const id = Number(req.params.id);
  const newData = req.body;
  
  fs.readFile('mock-data.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    let users = JSON.parse(data); // Parse the JSON data read from the file into an array of user objects

    // Find the index of the user in the array whose ID matches the requested ID
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }

    // Update user data with the new data received from the request body
    users[userIndex] = { ...users[userIndex], ...newData };

    // The null, 2 parameters are for pretty-printing the JSON with indentation of 2 spaces.
    fs.writeFile('mock-data.json', JSON.stringify(users, null, 2), 'utf8', err => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
      res.send('User updated successfully');
    });
  });
})

app.delete('/api/user/:id', (req, res) => {
  const id = Number(req.params.id);
  const newData = req.body;
  
  fs.readFile('mock-data.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    let users = JSON.parse(data);

    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }

    // Remove the user from the array
    users.splice(userIndex, 1);

    fs.writeFile('mock-data.json', JSON.stringify(users, null, 2), 'utf8', err => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
      res.send('User deleted successfully');
    });
  });
})

app.listen(PORT, () => console.log(`Server started at ${PORT}`));
