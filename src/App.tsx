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

import React, { useEffect, useState } from "react";

const socket = new WebSocket("ws://localhost:8000/ws");

const COLORS: Record<string, string> = {
  "01": "bg-pink-400",
  "02": "bg-white",
  "03": "bg-sky-400",
};

function App() {
    const [squares, setSquares] = useState<string[]>(Array(20).fill("02"));
    const [selectedColor, setSelectedColor] = useState<string>("01");
    const [userId] = useState(() => `user_${Math.random().toString(36).substring(2, 9)}`);

    useEffect(() => {
        const interval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ action: "get_colors", payload: {} }));
            }
        }, 1000);

        socket.onopen = () => {
            console.log("WebSocket connected.");
            socket.send(JSON.stringify({ action: "get_colors", payload: {} }));
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

        // const interval = setInterval(() => {
        //     socket.send(JSON.stringify({ action: "get_colors", payload: {} }));
        // }, 1000);

        // return () => clearInterval(interval);
        
        
        return () => {
            clearInterval(interval);
            // socket.close();
        };
    }, []);

    const handleSquareClick = (index: number) => {
        socket.send(
            JSON.stringify({
                action: "update_color",
                payload: { id: index + 1, color: selectedColor },
            })
        );
        socket.send(
            JSON.stringify({
                action: "broadcast",
                payload: `${userId} updated square ${index + 1}`,
            })
        );
    };

    const handleColorSelect = (color: string) => {
        console.log("change color");
        setSelectedColor(color);
        socket.send(
            JSON.stringify({
                action: "user_color",
                payload: { user_id: userId, color },
            })
        );
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