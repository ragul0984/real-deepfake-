import { motion } from "framer-motion";

const AuroraBackground = () => {
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
                background: "#020617", // Deep Slate / Black
            }}
        >
            {/* 1. Deep Blue Wave */}
            <motion.div
                style={{
                    position: "absolute",
                    top: "-20%",
                    left: "-10%",
                    width: "70%",
                    height: "70%",
                    background: "radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 60%)",
                    filter: "blur(80px)",
                    borderRadius: "50%",
                }}
                animate={{
                    x: [0, 50, -30, 0],
                    y: [0, 30, -20, 0],
                    scale: [1, 1.1, 0.95, 1],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* 2. Vibrant Purple Wave */}
            <motion.div
                style={{
                    position: "absolute",
                    top: "30%",
                    right: "-10%",
                    width: "60%",
                    height: "80%",
                    background: "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 60%)",
                    filter: "blur(90px)",
                    borderRadius: "50%",
                }}
                animate={{
                    x: [0, -40, 40, 0],
                    y: [0, -60, 40, 0],
                    scale: [1, 1.15, 0.9, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* 3. Cyan Accent Glow - Center/Bottom */}
            <motion.div
                style={{
                    position: "absolute",
                    bottom: "-10%",
                    left: "20%",
                    width: "50%",
                    height: "60%",
                    background: "radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)",
                    filter: "blur(100px)",
                    borderRadius: "50%",
                }}
                animate={{
                    x: [0, 60, -60, 0],
                    y: [0, -30, 30, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* 4. 3D Grid Overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    perspective: "1000px",
                    zIndex: 1,
                    overflow: "hidden",
                    pointerEvents: "none"
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        width: "200%",
                        height: "200%",
                        top: "-50%",
                        left: "-50%",
                        backgroundImage: `
                            linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                        transform: "rotateX(60deg)",
                        maskImage: "radial-gradient(ellipse at center, black 20%, transparent 80%)",
                        WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 80%)",
                        animation: "gridMove 20s linear infinite",
                    }}
                />
            </div>

            <style jsx>{`
                @keyframes gridMove {
                    0% {
                        transform: rotateX(60deg) translateY(0);
                    }
                    100% {
                        transform: rotateX(60deg) translateY(60px);
                    }
                }
            `}</style>
        </div>
    );
};

export default AuroraBackground;
