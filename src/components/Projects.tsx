import { useEffect, useRef, useState } from "react";
import { motion, PanInfo, useMotionValue } from "framer-motion";
import { MoveHorizontal, ExternalLink, Github } from "lucide-react";
import { Button } from "./ui/button";

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
      title: "AI-Powered Analytics Platform",
      thumbnail: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      description:
        "A full-stack analytics platform leveraging machine learning for real-time predictive insights. Features include data visualization, automated reporting, and custom ML model training with TensorFlow.",
      tags: ["Python", "TensorFlow", "React", "FastAPI"],
      demoLink: "#",
      githubLink: "#",
    },
    {
      id: 2,
      title: "Neural Network Visualizer",
      thumbnail: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      description:
        "An interactive educational tool for building, training, and visualizing neural networks in real-time. Includes layer-by-layer inspection, performance metrics, and 3D architecture visualization.",
      tags: ["PyTorch", "Three.js", "WebGL", "TypeScript"],
      demoLink: "#",
      githubLink: "#",
    },
    {
      id: 3,
      title: "Smart Automation System",
      thumbnail: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      description:
        "Cloud-native automation platform using NLP to understand and execute complex workflows. Supports multi-step processes and integrations with 50+ popular services.",
      tags: ["NLP", "Python", "Docker", "Kubernetes"],
      demoLink: "#",
      githubLink: "#",
    },
    {
      id: 4,
      title: "Real-time Sentiment Analyzer",
      thumbnail: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      description:
        "Real-time sentiment analysis engine processing thousands of social media posts per second. Uses state-of-the-art transformer models (BERT) for accurate emotion detection.",
      tags: ["BERT", "React", "Node.js", "MongoDB"],
      demoLink: "#",
      githubLink: "#",
    },
    {
      id: 5,
      title: "Predictive Maintenance AI",
      thumbnail: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      description:
        "Industrial IoT solution that predicts equipment failures before they happen. Reduces downtime by 60% through proactive maintenance scheduling and anomaly detection.",
      tags: ["Scikit-learn", "PostgreSQL", "Flask", "AWS"],
      demoLink: "#",
      githubLink: "#",
    },
    {
      id: 6,
      title: "Computer Vision Mobile App",
      thumbnail: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      description:
        "Cross-platform mobile app for real-time object detection and classification. Optimized for on-device inference with 30+ FPS performance using TensorFlow Lite.",
      tags: ["OpenCV", "TensorFlow Lite", "React Native", "Flutter"],
      demoLink: "#",
      githubLink: "#",
    },
  ];

  // navigation
  const handleNext = () =>
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);

  // Framer drag end (mouse/touch drag)
  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);

    const threshold = 100; // px
    // Only react to horizontal offset (ignore vertical)
    if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      if (info.offset.x > threshold) {
        handlePrev();
      } else if (info.offset.x < -threshold) {
        handleNext();
      }
    }
    // reset motion value to avoid stray translations
    dragX.set(0);
  };

  // -------------------
  // TOUCH HANDLERS (mobile) - horizontal only
  // -------------------
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
    if (!touchStart.current || !touchEnd.current) {
      touchStart.current = null;
      touchEnd.current = null;
      return;
    }

    const dx = touchStart.current.x - touchEnd.current.x;
    const dy = touchStart.current.y - touchEnd.current.y;

    // require horizontal dominant and minimum distance
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 75) {
      if (dx > 0) handleNext();
      else handlePrev();
    }

    touchStart.current = null;
    touchEnd.current = null;
  };

  // -------------------
  // POINTER HANDLERS (mouse/pen) - horizontal only
  // -------------------
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const pointerActive = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    // only primary button or touch/pen
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerActive.current = true;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (_e: React.PointerEvent) => {
    // we do not act continuously here; use up to decide
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerActive.current || !pointerStart.current) {
      pointerActive.current = false;
      pointerStart.current = null;
      return;
    }

    const dx = pointerStart.current.x - e.clientX;
    const dy = pointerStart.current.y - e.clientY;

    // horizontal dominant & threshold
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) handleNext();
      else handlePrev();
    }

    pointerActive.current = false;
    pointerStart.current = null;
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  // -------------------
  // WHEEL HANDLER (touchpad two-finger) - horizontal only
  // -------------------
  const wheelAccum = useRef(0);
  const wheelTimer = useRef<number | null>(null);

  const handleWheel = (e: React.WheelEvent) => {
    // If vertical dominates, ignore entirely (so page scroll works)
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;

    // accumulate horizontal deltas (some devices emit small deltas)
    wheelAccum.current += e.deltaX;

    const trigger = 150; // tune: bigger -> less sensitive
    if (Math.abs(wheelAccum.current) > trigger) {
      if (wheelAccum.current > 0) {
        // positive deltaX -> user scrolled rightwards -> show next (content moves left)
        handleNext();
      } else {
        handlePrev();
      }
      wheelAccum.current = 0;
      if (wheelTimer.current) {
        window.clearTimeout(wheelTimer.current);
        wheelTimer.current = null;
      }
    } else {
      // reset accumulator after short idle so small accidental scrolls don't accumulate forever
      if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
      // @ts-ignore window.setTimeout returns number in browser
      wheelTimer.current = window.setTimeout(() => {
        wheelAccum.current = 0;
        wheelTimer.current = null;
      }, 120);
    }
  };

  useEffect(() => {
    return () => {
      if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
    };
  }, []);

  // -------------------
  // KEYBOARD NAV
  // -------------------
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // -------------------
  // Flip card
  // -------------------
  const toggleFlip = (id: number) => {
    if (isDragging) return;
    setFlippedCards((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  // -------------------
  // Card positioning
  // -------------------
  const getCardStyle = (index: number) => {
    // we want circular indexing so carousel loops naturally
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
      zIndex: isCenter ? 20 : Math.max(0, 10 - absDiff),
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

        {/* WRAPPER: capture wheel on wrapper if you want (we already listen on inner container) */}
        <div
          ref={containerRef}
          // make container focusable for accessibility if needed
          tabIndex={-1}
          className="relative"
        >
          {/* 3D Carousel Container */}
          <motion.div
            // important styles: touchAction pan-x ensures vertical touches don't trigger horizontal gestures here
            style={{
              x: dragX,
              touchAction: "pan-x", // allow horizontal touch gestures only for this element
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
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
            // pointer handlers to complement drag (and to ensure horizontal-only detection)
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            // touch handlers
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            // wheel for touchpad horizontal swipes
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
                      transition: "all 0.48s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                    onClick={() => toggleFlip(project.id)}
                  >
                    {/* Flip Card Container */}
                    <div
                      className="relative w-[400px] h-[500px]"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        transition: "transform 0.72s cubic-bezier(0.22,1,0.36,1)",
                      }}
                    >
                      {/* Front */}
                      <div
                        className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden glass-card border-2 border-primary/20"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                      >
                        <div
                          className="w-full h-2/3 relative"
                          style={{ background: project.thumbnail }}
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

                      {/* Back */}
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
