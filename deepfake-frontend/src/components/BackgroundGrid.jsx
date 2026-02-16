import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const BackgroundGrid = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1,
                overflow: "hidden",
                background: "radial-gradient(circle at top, #0f172a, #020617)",
            }}
        >
            {/* Moving Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 0.4,
                    backgroundPosition: ["0px 0px", "0px 60px"],
                }}
                transition={{
                    opacity: { duration: 2 },
                    backgroundPosition: {
                        repeat: Infinity,
                        duration: 3,
                        ease: "linear",
                    },
                }}
                style={{
                    position: "absolute",
                    inset: -100,
                    backgroundImage:
                        "linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                    transform: "perspective(500px) rotateX(60deg)",
                }}
            />

            {/* Interactive Glow */}
            <motion.div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(56, 189, 248, 0.1), transparent 40%)`,
                }}
            />
        </div>
    );
};

export default BackgroundGrid;
