'use strict';

// DOM elements
const messageArea = document.querySelector('#messageArea');
const notification = document.querySelector('#count-print');
const notificationCountHideBtn = document.querySelector('#notification-count-hide');
const muteBtn = document.querySelector('#mute-btn');
const unmuteBtn = document.querySelector('#unmute-btn');
const mute1MinuteBtn = document.querySelector('#mute-for-1-minute');
const mute1HourBtn = document.querySelector('#mute-for-1-hour');
const mute6HourBtn = document.querySelector('#mute-for-6-hour');
const muteUntilBtn = document.querySelector('#mute-for-until');
const noNotification = document.querySelector('#noNotification');
const clearNotificationBtn = document.querySelector('#clear-notification-btn');

// WebSocket client
let stompClient = null;
const username = 'admin4';
let notificationCount = 0;
let isMute = false;

// Connect to WebSocket server
function connect() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnected, onError);
}

// Callback on successful connection
function onConnected() {
    stompClient.subscribe('/topic/public', onMessageReceived);
    stompClient.send("/app/chat.addUser", {}, JSON.stringify({ sender: username, type: 'JOIN' }));
}

// Callback on connection error
function onError(error) {
    console.error('Could not connect to WebSocket server. Please refresh the page to try again!', error);
}

// Handle received messages
function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    if (message.receiver === 'admin4' && message.type === 'CHAT') {
        const messageElement = createMessageElement(message.sender, message.content);
        messageArea.insertBefore(messageElement, messageArea.firstChild);
        messageArea.scrollTop = messageArea.scrollHeight;
        if (!isMute) playNotificationSound();
        notificationCount++;
        updateNotificationCount();
    }
}

// Create a new message element
function createMessageElement(sender, content) {
    const messageElement = document.createElement('li');
    messageElement.classList.add('chat-message');
    const usernameElement = document.createElement('span');
    usernameElement.textContent = sender;
    const textElement = document.createElement('p');
    textElement.textContent = content;
    messageElement.appendChild(usernameElement);
    messageElement.appendChild(textElement);
    return messageElement;
}

// Update notification count display
function updateNotificationCount() {
    if (notificationCount > 0) {
        notification.textContent = notificationCount;
        noNotification.style.display = 'none';
        console.log("Checking none");
    } else {
        notification.textContent = '';
//        noNotification.style.display = 'block';
    }
}

// Play notification sound
function playNotificationSound() {
    const audio = new Audio('/audio/sound.mp3');
    audio.play();
}

// Mute notification sound
function muteNotifications() {
    isMute = true;
    muteBtn.disabled = true;
    unmuteBtn.disabled = false;
}

// Unmute notification sound
function unmuteNotifications() {
    isMute = false;
    muteBtn.disabled = false;
    unmuteBtn.disabled = true;
}

// Mute notifications for a specified duration
function muteForDuration(duration) {
    isMute = true;
    muteBtn.disabled = true; // Ensure muteBtn is disabled immediately
    unmuteBtn.disabled = false; // Ensure unmuteBtn is enabled immediately
    setTimeout(() => {
        isMute = false;
        muteBtn.disabled = false;
        unmuteBtn.disabled = true;
    }, duration);
}

// Clear all notifications
function clearNotifications() {
    event.preventDefault();
    event.stopPropagation();
    const messageElements = messageArea.querySelectorAll('li.chat-message');
    messageElements.forEach(element => element.remove());
    notificationCount = 0;
    updateNotificationCount();
    noNotification.style.display = 'block';
}

// Event listeners
notificationCountHideBtn.addEventListener('click', () => {
    notificationCount = 0;
    updateNotificationCount();
});

muteBtn.addEventListener('click', muteNotifications);
unmuteBtn.addEventListener('click', unmuteNotifications);
mute1MinuteBtn.addEventListener('click', () => muteForDuration(60000));
mute1HourBtn.addEventListener('click', () => muteForDuration(3600000));
mute6HourBtn.addEventListener('click', () => muteForDuration(21600000));
muteUntilBtn.addEventListener('click', muteNotifications);
clearNotificationBtn.addEventListener('click', clearNotifications);

// Establish WebSocket connection on page load
connect();
