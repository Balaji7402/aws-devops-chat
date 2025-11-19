import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const host = window.location.hostname;
    const wsUrl = `ws://${host}:3000/ws`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (e) => {
      try { setMessages(prev => [...prev, JSON.parse(e.data)]); }
      catch { setMessages(prev => [...prev, e.data]); }
    };
    return () => ws.current && ws.current.close();
  }, []);

  const send = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ text: input, ts: Date.now() }));
      setInput("");
    }
  };

  return (
    <div style={{ padding:20, fontFamily:'Arial' }}>
      <h2>Realtime Chat</h2>
      <div style={{ border:'1px solid #ddd', height:250, padding:10, overflow:'auto' }}>
        {messages.map((m,i) => <div key={i}>{typeof m === 'object' ? JSON.stringify(m) : m}</div>)}
      </div>
      <input value={input} onChange={e=>setInput(e.target.value)} style={{width:300}} />
      <button onClick={send} style={{marginLeft:8}}>Send</button>
    </div>
  );
}
