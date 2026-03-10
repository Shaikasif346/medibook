import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuth } from '../context/AuthContext';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

export default function VideoCall() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef();
  const localVideoRef = useRef();
  const localStreamRef = useRef();
  const peersRef = useRef({});
  const [peers, setPeers] = useState([]);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [chatOpen, setChatOpen] = useState(true);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      socketRef.current = io(SERVER_URL);
      socketRef.current.emit('join_room', { roomId, userId: user._id, name: user.name });

      socketRef.current.on('existing_users', (users) => {
        users.forEach(({ socketId, name }) => {
          const peer = new Peer({ initiator: true, trickle: false, stream });
          peer.on('signal', offer => socketRef.current.emit('offer', { offer, to: socketId }));
          peersRef.current[socketId] = { peer, name };
          setPeers(prev => [...prev, { socketId, peer, name }]);
        });
      });

      socketRef.current.on('user_joined', ({ socketId, name }) => {
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on('signal', answer => socketRef.current.emit('answer', { answer, to: socketId }));
        peersRef.current[socketId] = { peer, name };
        setPeers(prev => [...prev, { socketId, peer, name }]);
      });

      socketRef.current.on('offer', ({ offer, from }) => {
        peersRef.current[from]?.peer.signal(offer);
      });

      socketRef.current.on('answer', ({ answer, from }) => {
        peersRef.current[from]?.peer.signal(answer);
      });

      socketRef.current.on('user_left', ({ socketId, name }) => {
        peersRef.current[socketId]?.peer.destroy();
        delete peersRef.current[socketId];
        setPeers(prev => prev.filter(p => p.socketId !== socketId));
        setMessages(prev => [...prev, { system: true, text: `${name} left the call` }]);
      });

      socketRef.current.on('chat_message', (msg) => setMessages(prev => [...prev, msg]));
    };

    init().catch(() => { alert('Camera access denied'); navigate('/dashboard'); });

    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      Object.values(peersRef.current).forEach(({ peer }) => peer.destroy());
      socketRef.current?.disconnect();
    };
  }, []);

  const toggleAudio = () => {
    const on = !audioOn;
    localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = on);
    setAudioOn(on);
  };

  const toggleVideo = () => {
    const on = !videoOn;
    localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = on);
    setVideoOn(on);
  };

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    socketRef.current?.emit('chat_message', { roomId, message: msgInput, name: user.name });
    setMsgInput('');
  };

  return (
    <div className="video-page">
      <div className="video-header">
        <h3>🏥 MediBook Video Consultation • Room: {roomId}</h3>
        <span style={{color:'#94a3b8', fontSize:13}}>{peers.length + 1} participant{peers.length !== 0 ? 's' : ''}</span>
      </div>

      <div className="video-body">
        <div className="videos-grid">
          {peers.length === 0 ? (
            <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#94a3b8', gap:16}}>
              <div style={{fontSize:64}}>📹</div>
              <h3 style={{color:'#fff'}}>Waiting for the other person...</h3>
              <p>Share room code: <strong style={{color:'#0ea5e9'}}>{roomId}</strong></p>
              <video ref={localVideoRef} autoPlay muted playsInline style={{width:320, borderRadius:12, background:'#1e293b'}} />
            </div>
          ) : (
            <>
              <div className="video-tile" style={{maxWidth:300}}>
                <video ref={localVideoRef} autoPlay muted playsInline />
                <div className="tile-name">You {!audioOn && '🔇'}</div>
              </div>
              {peers.map(({ socketId, peer, name }) => (
                <PeerVideo key={socketId} peer={peer} name={name} />
              ))}
            </>
          )}
        </div>

        {chatOpen && (
          <div style={{width:260, background:'#1e293b', borderLeft:'1px solid #334155', display:'flex', flexDirection:'column'}}>
            <div style={{padding:'12px 16px', borderBottom:'1px solid #334155', color:'#fff', fontSize:14, fontWeight:600}}>💬 Chat</div>
            <div style={{flex:1, overflow:'auto', padding:12, display:'flex', flexDirection:'column', gap:8}}>
              {messages.map((m, i) => m.system ? (
                <div key={i} style={{textAlign:'center', fontSize:11, color:'#64748b'}}>{m.text}</div>
              ) : (
                <div key={i} style={{background:'#334155', borderRadius:8, padding:'8px 10px'}}>
                  <div style={{fontSize:11, color:'#0ea5e9', marginBottom:3}}>{m.name}</div>
                  <div style={{fontSize:13, color:'#e2e8f0'}}>{m.message}</div>
                </div>
              ))}
            </div>
            <div style={{padding:12, borderTop:'1px solid #334155', display:'flex', gap:8}}>
              <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendMessage()}
                placeholder="Message..." style={{flex:1, background:'#334155', border:'none', borderRadius:6, padding:'8px 10px', color:'#fff', fontSize:13, outline:'none'}} />
              <button onClick={sendMessage} style={{background:'#0ea5e9', border:'none', borderRadius:6, color:'#fff', padding:'8px 12px', cursor:'pointer'}}>➤</button>
            </div>
          </div>
        )}
      </div>

      <div className="video-controls">
        <button className={`ctrl-btn ${!audioOn?'off':''}`} onClick={toggleAudio}>{audioOn?'🎤':'🔇'}</button>
        <button className={`ctrl-btn ${!videoOn?'off':''}`} onClick={toggleVideo}>{videoOn?'📷':'🚫'}</button>
        <button className="ctrl-btn" onClick={() => setChatOpen(!chatOpen)}>💬</button>
        <button className="ctrl-btn end-call" onClick={() => navigate('/dashboard')}>📵</button>
      </div>
    </div>
  );
}

function PeerVideo({ peer, name }) {
  const ref = useRef();
  useEffect(() => {
    peer.on('stream', stream => { if (ref.current) ref.current.srcObject = stream; });
  }, [peer]);
  return (
    <div className="video-tile">
      <video ref={ref} autoPlay playsInline />
      <div className="tile-name">{name}</div>
    </div>
  );
}
