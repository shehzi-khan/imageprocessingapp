import openSocket from 'socket.io-client';
const socket = openSocket('http://223.195.37.85:5055');

function subscribeToTimer(cb) {
    socket.on('timer', data => cb(null, data));
    socket.emit('subscribeToTimer', 1);

}
export { subscribeToTimer }