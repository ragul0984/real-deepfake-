import { useEffect, useRef } from "react";

const MatrixBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const columns = Math.floor(width / 20);
        const drops = Array(columns).fill(1);

        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = "#0f0"; // Green text
            ctx.font = "15px monospace";

            for (let i = 0; i < drops.length; i++) {
                const text = String.fromCharCode(Math.random() * 128);
                const x = i * 20;
                const y = drops[i] * 20;

                ctx.fillText(text, x, y);

                if (y > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 0,
                width: "100%",
                height: "100%",
                opacity: 0.2, // Subtle background
            }}
        />
    );
};

export default MatrixBackground;
