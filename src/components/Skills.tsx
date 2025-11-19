import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import GitHubCalendar from "react-github-calendar";

// React Icons
import {
  SiPython,
  SiJavascript,
  SiC,
  SiDart,
  SiTailwindcss,
  SiR,
  SiReact,
  SiNodedotjs,
  SiFlutter,
  SiDjango,
  SiFastapi,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
} from "react-icons/si";

// Animation variants for staggered entry
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.05, type: "spring", stiffness: 120 },
  }),
};

interface Skill {
  name: string;
  level: number;
  Icon: React.ElementType;
  category: string;
}

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("All");

  const allSkills: Skill[] = [
    { name: "Python", level: 95, Icon: SiPython, category: "Languages" },
    { name: "JavaScript", level: 90, Icon: SiJavascript, category: "Languages" },
    { name: "C", level: 80, Icon: SiC, category: "Languages" },
    { name: "Dart", level: 75, Icon: SiDart, category: "Languages" },
    { name: "R", level: 70, Icon: SiR, category: "Languages" },
    { name: "React", level: 92, Icon: SiReact, category: "Frontend" },
    { name: "Tailwind CSS", level: 89, Icon: SiTailwindcss, category: "Frontend" },
    { name: "Node.js", level: 88, Icon: SiNodedotjs, category: "Backend" },
    { name: "Flutter", level: 82, Icon: SiFlutter, category: "Frontend" },
    { name: "Django", level: 85, Icon: SiDjango, category: "Backend" },
    { name: "FastAPI", level: 88, Icon: SiFastapi, category: "Backend" },
    { name: "TensorFlow", level: 90, Icon: SiTensorflow, category: "ML/AI" },
    { name: "PyTorch", level: 87, Icon: SiPytorch, category: "ML/AI" },
    { name: "Scikit-learn", level: 85, Icon: SiScikitlearn, category: "ML/AI" },
  ];

  const categories = ["All", "Languages", "Frontend", "Backend", "ML/AI", "Tools"];

  const filteredSkills =
    activeCategory === "All"
      ? allSkills
      : allSkills.filter((skill) => skill.category === activeCategory);

  // Base electric style
  const baseElectricStyle: React.CSSProperties = {
    borderRadius: "1rem",
    border: "2px solid rgba(0,200,255,0.3)",
    boxShadow: "0 0 24px rgba(0,200,255,0.3), 0 0 30px rgba(0,200,255,0.1) inset",
    backgroundClip: "padding-box",
    animation: "electric-move 2s infinite linear",
  };

  // Inline keyframes for electric animation
  const keyframes = `
    @keyframes electric-move {
      0% { box-shadow: 0 0 4px rgba(0,200,255,0.3), 0 0 8px rgba(0,200,255,0.1) inset; }
      25% { box-shadow: 0 0 8px rgba(0,200,255,0.4), 0 0 12px rgba(0,200,255,0.2) inset; }
      50% { box-shadow: 0 0 6px rgba(0,200,255,0.35), 0 0 10px rgba(0,200,255,0.15) inset; }
      75% { box-shadow: 0 0 9px rgba(0,200,255,0.45), 0 0 14px rgba(0,200,255,0.25) inset; }
      100% { box-shadow: 0 0 4px rgba(0,200,255,0.3), 0 0 8px rgba(0,200,255,0.1) inset; }
    }
  `;

  return (
    <section id="skills" ref={ref} className="py-32 relative overflow-hidden">
      <style>{keyframes}</style>
      <div className="absolute top-40 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">Expertise</span>
          <h2 className="text-4xl md:text-5xl font-bold font-display mt-2">
            Skills & <span className="text-gradient">Technologies</span>
          </h2>
        </motion.div>

        {/* Category filter pills */}
        <div className="flex justify-center flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full border ${
                activeCategory === cat
                  ? "bg-accent text-white border-accent"
                  : "bg-transparent text-muted-foreground border-muted-foreground hover:bg-accent/20"
              } transition-colors duration-300`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skill Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 max-w-6xl mx-auto">
          <AnimatePresence>
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="p-6 rounded-2xl flex flex-col items-center cursor-pointer"
                style={baseElectricStyle}
                whileHover={{
                  y: -10,
                   border: "2px solid rgba(0,200,255,1)", 
                  boxShadow: "0 0 50px rgba(0,200,255,0.7), 0 0 50px rgba(0,200,255,0.3) inset",
                  scale: 1.05,
                }}
                transition={{ type: "spring", stiffness: 150 }}
              >
                <skill.Icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-sm font-semibold text-center">{skill.name}</h3>

                {/* Horizontal skill bar */}
                <div className="w-full mt-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: index * 0.05 }}
                      className="h-full bg-gradient-primary relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </motion.div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">{skill.level}%</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
  {/* Vertical spacer of 2cm */}
  <div aria-hidden style={{ height: "2cm", width: "100%" }} />
        {/* GitHub Calendar Section */}
       <motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  whileHover={{ scale: 1.02 }}
  className="max-w-5xl mx-auto glass-card p-6 rounded-2xl shadow-lg overflow-auto"
>
  <h3 className="text-2xl font-bold mb-6 text-gradient text-center">
    GitHub Contribution Calendar
  </h3>

  <div className="relative">
    <GitHubCalendar
      username="Yeamin-HS"
      blockSize={16}
      blockMargin={4}
      fontSize={12}
      theme={{
        light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
        dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
      }}
      showWeekdayLabels
    />

    {/* Optional subtle overlay glow */}
    <motion.div
      className="absolute inset-0 pointer-events-none rounded-xl"
      initial={{ opacity: 0.2 }}
      animate={{ opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{
        boxShadow: "0 0 30px rgba(0,200,255,0.2) inset",
      }}
    />
  </div>
</motion.div>


      </div>
    </section>
  );
};

export default Skills;
