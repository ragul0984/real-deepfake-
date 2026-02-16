import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const ParticlesBackground = () => {
    // Generate random particle positions
    const particleCount = 20;
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 20 + 10,
        }));
        setParticles(newParticles);
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
                background: "radial-gradient(ellipse at bottom, #0f172a, #020617)",
            }}
        >
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    style={{
                        position: "absolute",
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                        background: "rgba(167, 139, 250, 0.5)",
                        borderRadius: "50%",
                        boxShadow: "0 0 15px rgba(167, 139, 250, 0.8)",
                    }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, Math.random() * 50 - 25, 0],
                        opacity: [0.2, 0.8, 0.2],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

export default ParticlesBackground;
