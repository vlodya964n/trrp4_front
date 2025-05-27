// import React from 'react';
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React, { useEffect, useRef, useState } from "react";

const socket = new WebSocket("ws://localhost:8000/ws");

const COLORS: Record<string, string> = {
  "01": "pink",
  "02": "white",
  "03": "skyblue",
};

function App() {
    const [squares, setSquares] = useState<string[]>(Array(20).fill("02"));
    const [selectedColor, setSelectedColor] = useState<string>("01");
    const [userId] = useState(() => `user_${Math.random().toString(36).substring(2, 9)}`);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

    const setupSocket = () => {
        const socket = new WebSocket("ws://localhost:8000/ws");
        socketRef.current = socket;

        socket.onopen = () => {
        console.log("[WS] Connected");
        socket.send(JSON.stringify({ command: "register", payload: {} }));
        if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = null;
        }
        };

        socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (Array.isArray(data)) {
            setSquares(data.map((item: any) => item[1]));
            }
        } catch (err) {
            console.warn("Invalid JSON:", event.data);
        }
        };

        socket.onerror = () => {
        console.error("[WS] Error");
        socket.close();
        };

        socket.onclose = () => {
        console.warn("[WS] Disconnected. Reconnecting in 3s...");
        reconnectTimer.current = setTimeout(() => {
            setupSocket();
        }, 3000);
        };
    };

    useEffect(() => {
        setupSocket();

        return () => {
        if (socketRef.current) socketRef.current.close();
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        };
    }, []);

    const sendMessage = (data: object) => {
        const socket = socketRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
        } else {
        console.warn("[WS] Not connected, message not sent:", data);
        }
    };

    const handleSquareClick = (index: number) => {
        sendMessage({
        command: "set_value",
        payload: { id: index + 1 },
        });
    };

    const handleColorSelect = (color: string) => {
        console.log("change color");
        setSelectedColor(color);
        sendMessage({
        command: "set_color",
        payload: { color_id: color },
        });
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: 24 }}>Цветные квадраты</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 64px)", gap: 8, marginBottom: 24 }}>
            {squares.map((color, idx) => (

            <div
                key={idx}

                style={{ width: 64, height: 64, border: "1px solid #000", borderRadius: 4, backgroundColor: COLORS[color], cursor: "pointer" }}
                onClick={() => handleSquareClick(idx)}
            />
            ))}
        </div>
        <div style={{ display: "flex", gap: 16 }}>
            <button
            style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "pink", border: "2px solid black", cursor: "pointer" }}
            onClick={() => handleColorSelect("01")}
            />
            <button
            style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "white", border: "2px solid black", cursor: "pointer" }}
            onClick={() => handleColorSelect("02")}
            />
            <button
            style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "skyblue", border: "2px solid black", cursor: "pointer" }}
            onClick={() => handleColorSelect("03")}
            />
        </div>
        </div>
    );
};

// const root = createRoot(document.getElementById("root")!);
// root.render(<App />);

export default App;
