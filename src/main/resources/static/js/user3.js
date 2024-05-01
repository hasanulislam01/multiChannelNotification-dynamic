'use strict';

// DOM elements
const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const messageArea = document.querySelector('#messageArea');
const adminSelection = document.querySelector('#adminSelect');

// WebSocket client
let stompClient = null;
const username = 'user3';

// Connect to WebSocket server
function connect() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnected, onError);
}

// Callback on successful connection
function onConnected() {
    // Send username to the server
    stompClient.send("/app/chat.addUser", {}, JSON.stringify({ sender: username, type: 'JOIN' }));
}

// Callback on connection error
function onError(error) {
    console.error('Could not connect to WebSocket server. Please refresh the page to try again!', error);
}

// Send a chat message
function sendMessage(event) {
    const messageContent = messageInput.value.trim();
    const receiver = adminSelection.value;
    if (messageContent && stompClient) {
        const chatMessage = {
            sender: username,
            receiver: receiver,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
        alert("Notification send Successfully!");
    }
    event.preventDefault();
}

// Establish WebSocket connection
connect();

// Event listener for sending messages
messageForm.addEventListener('submit', sendMessage, true);

