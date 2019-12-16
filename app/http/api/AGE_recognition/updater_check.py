from flask_socketio import SocketIO
from flask import Flask
from flask_cors import CORS
import time
from app.ip_server.service import Service as DataServer
app = Flask( __name__ )
socketio = SocketIO(app,cors_allowed_origins="*")
from datetime import datetime

@socketio.on('subscribeToTimer')                          # Decorator to catch an event called "my event":
def test_message(message):                        # test_message() is the event callback function.
    global total_data
    # now = datetime.now()
    # current_time = now.strftime("%H:%M:%S")
    # socketio.emit('timer', {'timestamp': current_time})

    # while True:
    if len(DataServer().find_all_data()) != total_data:
        total_data=len(DataServer().find_all_data())
        now = datetime.now()
        current_time = now.strftime("%H:%M:%S")
        socketio.emit('timer', {'timestamp': current_time})
        total_data=len(DataServer().find_all_data())
    #     time.sleep(1000)

if __name__ == '__main__':
    total_data = len(DataServer().find_all_data())
    socketio.run(app=app,host='0.0.0.0', port=5055)