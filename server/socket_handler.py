rooms = {}

def register_socket_events(socketio):

    @socketio.on('join_room')
    def on_join(data):
        from flask_socketio import join_room, emit
        room_id = data.get('roomId')
        user_id = data.get('userId')
        name = data.get('name')

        join_room(room_id)
        if room_id not in rooms:
            rooms[room_id] = []

        existing = [u for u in rooms[room_id] if u['socketId'] != data.get('socketId')]
        emit('existing_users', existing)

        rooms[room_id].append({'socketId': data.get('sid', ''), 'userId': user_id, 'name': name})
        emit('user_joined', {'socketId': data.get('sid', ''), 'name': name}, room=room_id, include_self=False)

    @socketio.on('offer')
    def on_offer(data):
        from flask_socketio import emit
        emit('offer', {'offer': data.get('offer'), 'from': data.get('from'), 'name': data.get('name')}, room=data.get('to'))

    @socketio.on('answer')
    def on_answer(data):
        from flask_socketio import emit
        emit('answer', {'answer': data.get('answer'), 'from': data.get('from')}, room=data.get('to'))

    @socketio.on('ice_candidate')
    def on_ice(data):
        from flask_socketio import emit
        emit('ice_candidate', {'candidate': data.get('candidate'), 'from': data.get('from')}, room=data.get('to'))

    @socketio.on('chat_message')
    def on_chat(data):
        from flask_socketio import emit
        from datetime import datetime
        emit('chat_message', {
            'message': data.get('message'),
            'name': data.get('name'),
            'time': datetime.now().strftime('%I:%M %p')
        }, room=data.get('roomId'))

    @socketio.on('disconnect')
    def on_disconnect():
        for room_id in list(rooms.keys()):
            rooms[room_id] = [u for u in rooms[room_id] if True]
