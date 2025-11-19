import { useEffect, useRef, useState } from "react";
import { motion, PanInfo, useMotionValue } from "framer-motion";
import { MoveHorizontal, ExternalLink, Github } from "lucide-react";
import { Button } from "./ui/button";

// ✅ Import your thumbnails
import medihelpthumb from "./assets/medihelpthumb.png";
import ocabracu from "./assets/ocabracu.png";
import desmosgraphthumb from "./assets/desmos-graph.png";

interface Project {
  id: number;
  title: string;
  thumbnail: string;
  description: string;
  tags: string[];
  demoLink: string;
  githubLink: string;
}

const Projects = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const dragX = useMotionValue(0);

  
  const projects: Project[] = [
    {
      id: 1,
      title: "AI-Powered Medicine Help Platform",
      thumbnail: medihelpthumb,
      description:
        "• Integrated Gemini 1.5 and a custom NLP model to create an AI chatbot that predicts diseases based on user symptoms, offering intelligent, real-time health insights. • Users can locate nearby 24/7 pharmacies, check medicine availability, and receive emergency support with GPSbased search and area-wise filtering. • Designed a full-stack system with RBAC for Admins, Pharmacists, Doctors, and Users—featuring online prescriptions, health history tracking, medicine requests, and follow-up reminders.Enabled home delivery with payment, real-time order tracking, feedback/rating features, and a personalized dashboard experience across all roles",
      tags: ["Node.js", "TensorFlow.js", "React", "Express.js"],
      demoLink: "https://medi-help-react.vercel.app/",
      githubLink: "#",
    },
    {
      id: 2,
      title: "Club Management & Recruitment System",
      thumbnail: ocabracu,
      description:
        "Custom authentication with multi-role access (Admin, Club, OCA), ensuring precise control over functionalities and data visibility. • Real-time room availability, conflict-free scheduling, and dynamic booking management — optimized for campus clubs and events. • Unified platform to manage event creation, scheduling, and digital notice circulation — reducing overhead and boosting engagement. • Built a personalized dashboard which is clean, user-focused and providing instant access to bookings, events, and actionable updates for every user role.",
      tags: ["desmos"],
      demoLink: "#",
      githubLink: "#",
    },
    {
      id: 3,
      title: "DESMOS Graphing Designing",
      thumbnail: desmosgraphthumb,
      description:
        "A little approcah to draw my club icon with several mathmatical functions using DESMOS graphing calculator. • Used functions like parabolas, circles, ellipses, and lines to create the shapes and curves needed for the design.",
      tags: ["Node.js", "Express.js", "Tailwind", "React"],
      demoLink: "#",
      githubLink: "#",
    },
  ];

  // navigation
  const handleNext = () =>
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);

    const threshold = 100;
    if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      if (info.offset.x > threshold) handlePrev();
      else if (info.offset.x < -threshold) handleNext();
    }

    dragX.set(0);
  };

  // TOUCH
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.targetTouches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    touchEnd.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t = e.targetTouches[0];
    touchEnd.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const dx = touchStart.current.x - touchEnd.current.x;
    const dy = touchStart.current.y - touchEnd.current.y;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 75) {
      dx > 0 ? handleNext() : handlePrev();
    }

    touchStart.current = null;
    touchEnd.current = null;
  };

  // POINTER
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const pointerActive = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerActive.current = true;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = () => {};

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerActive.current || !pointerStart.current) return;

    const dx = pointerStart.current.x - e.clientX;
    const dy = pointerStart.current.y - e.clientY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      dx > 0 ? handleNext() : handlePrev();
    }

    pointerActive.current = false;
    pointerStart.current = null;

    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  // WHEEL
  const wheelAccum = useRef(0);
  const wheelTimer = useRef<number | null>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;

    wheelAccum.current += e.deltaX;
    const trigger = 150;

    if (Math.abs(wheelAccum.current) > trigger) {
      wheelAccum.current > 0 ? handleNext() : handlePrev();
      wheelAccum.current = 0;
      if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
    } else {
      if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
      wheelTimer.current = window.setTimeout(() => {
        wheelAccum.current = 0;
      }, 120);
    }
  };

  useEffect(() => {
    return () => {
      if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
    };
  }, []);

  // KEYBOARD NAV
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // flip
  const toggleFlip = (id: number) => {
    if (isDragging) return;
    setFlippedCards((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // card style
  const getCardStyle = (index: number) => {
    const diffRaw = index - currentIndex;
    let diff = diffRaw;
    const half = Math.floor(projects.length / 2);

    if (diffRaw > half) diff = diffRaw - projects.length;
    if (diffRaw < -half) diff = diffRaw + projects.length;

    const absDiff = Math.abs(diff);
    const isCenter = diff === 0;

    const angle = diff * 25;
    const translateX = diff * 280;
    const translateZ = isCenter ? 100 : -100 - absDiff * 50;
    const scale = isCenter ? 1 : Math.max(0.6, 1 - absDiff * 0.18);
    const opacity = absDiff > 2 ? 0 : Math.max(0.25, 1 - absDiff * 0.28);

    return {
      transform: `rotateY(${angle}deg) translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale})`,
      opacity,
      zIndex: isCenter ? 20 : 10 - absDiff,
      filter: isCenter ? "blur(0px)" : `blur(${absDiff * 2}px)`,
    } as React.CSSProperties;
  };

  return (
    <section id="projects" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="mx-auto px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">
            Portfolio
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-display mt-2">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
            Explore my work in AI/ML and software engineering
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-3 mb-8 text-muted-foreground"
        >
          <MoveHorizontal className="w-5 h-5 animate-pulse" />
          <span className="text-sm font-medium">
            Drag / swipe horizontally or use ← → keys to navigate
          </span>
          <MoveHorizontal className="w-5 h-5 animate-pulse" />
        </motion.div>

        <div className="relative">
          <motion.div
            style={{
              x: dragX,
              touchAction: "pan-x",
              userSelect: "none",
            }}
            className="relative h-[600px] flex items-center justify-center select-none"
            drag="x"
            dragDirectionLock
            dragMomentum={false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              {projects.map((project, index) => {
                const isFlipped = flippedCards.has(project.id);
                return (
                  <motion.div
                    key={project.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{
                      ...getCardStyle(index),
                      transformStyle: "preserve-3d",
                      transition:
                        "all 0.48s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                    onClick={() => toggleFlip(project.id)}
                  >
                    <div
                      className="relative w-[400px] h-[500px]"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: isFlipped
                          ? "rotateY(180deg)"
                          : "rotateY(0deg)",
                        transition:
                          "transform 0.72s cubic-bezier(0.22,1,0.36,1)",
                      }}
                    >
                      {/* FRONT */}
                      <div
                        className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden glass-card border-2 border-primary/20"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                      >
                        <div
                          className="w-full h-2/3 relative"
                          style={{
                            backgroundImage: `url(${project.thumbnail})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-2xl font-bold font-display text-white drop-shadow-lg">
                              {project.title}
                            </h3>
                          </div>
                        </div>

                        <div className="p-6 h-1/3 flex flex-col justify-center">
                          <p className="text-center text-muted-foreground">
                            Click to see details
                          </p>
                          <div className="flex flex-wrap gap-2 mt-4 justify-center">
                            {project.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* BACK */}
                      <div
                        className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden glass-card border-2 border-accent/20 p-8"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <div className="h-full flex flex-col">
                          <h3 className="text-2xl font-bold font-display mb-4 text-gradient">
                            {project.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-6 flex-1 overflow-auto">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {project.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 text-xs rounded-full bg-accent/10 text-accent border border-accent/20"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-3">
                            <Button
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(project.demoLink, "_blank");
                              }}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Demo
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(project.githubLink, "_blank");
                              }}
                            >
                              <Github className="w-4 h-4 mr-2" />
                              Code
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
