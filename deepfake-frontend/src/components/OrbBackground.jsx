import { motion } from "framer-motion";

const OrbBackground = () => {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
                overflow: "hidden",
                background: "#0f172a", // Dark blue base
            }}
        >
            {/* Orb 1: Purple */}
            <motion.div
                style={{
                    position: "absolute",
                    top: "20%",
                    left: "20%",
                    width: "300px",
                    height: "300px",
                    background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(40px)",
                }}
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -50, 100, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Orb 2: Blue */}
            <motion.div
                style={{
                    position: "absolute",
                    bottom: "10%",
                    right: "10%",
                    width: "400px",
                    height: "400px",
                    background: "radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(60px)",
                }}
                animate={{
                    x: [0, -100, 50, 0],
                    y: [0, 50, -100, 0],
                    scale: [1, 0.8, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Orb 3: Pink */}
            <motion.div
                style={{
                    position: "absolute",
                    top: "60%",
                    left: "50%",
                    width: "250px",
                    height: "250px",
                    background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(50px)",
                }}
                animate={{
                    x: [0, 70, -70, 0],
                    y: [0, -70, 70, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Floating Stars */}
            {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: "absolute",
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${Math.random() * 3 + 1}px`, // 1px to 4px
                        height: `${Math.random() * 3 + 1}px`,
                        background: "white",
                        borderRadius: "50%",
                        filter: "blur(1px)",
                        opacity: 0.6,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 0.8, 0.2],
                    }}
                    transition={{
                        duration: Math.random() * 5 + 3, // 3s to 8s
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 5,
                    }}
                />
            ))}
        </div>
    );
};

export default OrbBackground;
