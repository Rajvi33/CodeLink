// DOM elements
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const leaveBtn = document.getElementById('leave-btn');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Connect to server
const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users info from server
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Listen for messages from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Auto-scroll to the latest message
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message form submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let msg = e.target.elements.msg.value.trim();
  if (!msg) return false;

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear and focus input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Format time in user's local timezone
function formatLocalTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');

  const header = document.createElement('div');
  header.classList.add('message-header');

  const username = document.createElement('p');
  username.classList.add('meta');
  username.textContent = message.username;

  const time = document.createElement('span');
  time.classList.add('message-time');
  time.textContent = formatLocalTime(message.time);

  header.appendChild(username);
  header.appendChild(time);

  const para = document.createElement('p');
  para.classList.add('text');
  para.textContent = message.text;

  div.appendChild(header);
  div.appendChild(para);
  chatMessages.appendChild(div);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

// Handle Leave Room button safely
if (leaveBtn) {
  leaveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) window.location = 'index.html';
  });
}