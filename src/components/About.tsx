import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { User } from 'lucide-react';

import profileImg from './assets/gemimg.png';

const About = () => {
  const ref = useRef(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track scroll progress for smooth fade in
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"]
  });

  // Fade in background as section enters viewport
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  const mathSymbols = [
    { symbol: 'π', x: '10%', y: '20%', delay: 0, size: 'text-4xl md:text-6xl' },
    { symbol: 'θ', x: '85%', y: '15%', delay: 0.5, size: 'text-3xl md:text-5xl' },
    { symbol: '∑', x: '15%', y: '70%', delay: 1, size: 'text-5xl md:text-7xl' },
    { symbol: '∂', x: '90%', y: '90%', delay: 1.5, size: 'text-3xl md:text-5xl' },
    { symbol: '∫ x dx', x: '10%', y: '90%', delay: 2, size: 'text-5xl md:text-7xl' },
    { symbol: 'eⁱπ+1=0', x: '75%', y: '40%', delay: 2.5, size: 'text-2xl md:text-4xl' },
    { symbol: '∞', x: '49%', y: '08%', delay: 3, size: 'text-3xl md:text-5xl' },

    {
      symbol: (
        <div className="text-center leading-tight">
          ψ(x) =
          <span className="inline-flex flex-col items-center justify-center mx-1 text-base align-middle">
            <span className="border-b border-current px-1 text-2xl md:text-4xl">d</span>
            <span className="text-2xl md:text-4xl">dx</span>
          </span>
          ln(Γ(x))
        </div>
      ),
      x: '45%',
      y: '90%',
      delay: 1.8,
      size: 'text-3xl md:text-5xl',
    },

    {
      symbol: (
        <div className="text-center leading-tight">
          p(x) ∝ x⁽ᵅ⁻¹⁾ e⁽⁻ˣ/ᵝ⁾
          <div className="flex flex-col items-center justify-center text-xs mt-[-0.3rem]">
            <span className="border-b border-current w-10 text-base flex items-center justify-center"></span>
            <span className="text-lg">Γ(ᵅ)</span>
          </div>
        </div>
      ),
      x: '83%',
      y: '55%',
      delay: 3.2,
      size: 'text-xl md:text-3xl',
    },

  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden min-h-screen flex items-center">
      {/* Cosmic Background with Scroll Fade */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10"
        style={{ opacity: backgroundOpacity }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-transparent via-primary/5 to-background opacity-50"
        style={{ opacity: backgroundOpacity }}
      />

      {/* Floating Math Symbols with Scroll Fade */}
      {mathSymbols.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute ${item.size} font-bold text-accent/30 pointer-events-none select-none math-symbol`}
          style={{
            left: item.x,
            top: item.y,
            textShadow: '0 0 20px hsl(var(--accent)), 0 0 40px hsl(var(--accent) / 0.5)',
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            opacity: backgroundOpacity,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? {
            scale: [0.8, 1, 0.8],
            rotateZ: [0, 10, 0],
          } : {}}
          transition={{
            duration: 6,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.symbol}
        </motion.div>
      ))}

      {/* Main Content */}
      <div ref={ref} className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">About Me</span>
          <h2 className="text-4xl md:text-5xl font-bold font-display mt-2 mb-4">
            Where Code Meets <span className="text-gradient">Mathematics</span>
          </h2>
        </motion.div>

        {/* Portrait and Bio Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-primary/30 to-purple-500/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500" />

              {/* Image Container */}
              <motion.div
                className="relative glass-card rounded-2xl overflow-hidden border-2 border-accent/20 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20"
                whileHover={{ scale: 1.02, rotateZ: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full flex items-center justify-center object-center overflow-hidden rounded-2xl">
                  {/* <User className="absolute w-10 h-10 text-accent/40" strokeWidth={3} /> */}

                  <img
                    src={profileImg}
                    alt="Yeamin HS"
                    className="w-full h-full object-contain object-center rounded-2xl"
                  />
                </div>
              </motion.div>


              {/* Floating Math Symbol on Portrait */}
              <motion.div
                className="absolute -top-6 -right-6 text-6xl text-accent opacity-40"
                animate={{
                  y: [0, -20, 0],
                  rotateZ: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  textShadow: '0 0 30px hsl(var(--accent))',
                }}
              >
                λ
              </motion.div>
            </div>
          </motion.div>

          {/* Bio Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <motion.h3
              className="text-3xl font-bold font-display"
              whileHover={{ scale: 1.02 }}
            >
              Yeamin Hossain Shihab
            </motion.h3>

            <motion.div
              className="glass-card p-6 rounded-xl space-y-4"
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px hsl(var(--accent) / 0.3)' }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-muted-foreground leading-relaxed">
                I'm a developer who sees the world through the lens of algorithms and equations.
                My passion lies at the intersection of <span className="text-accent font-semibold">software engineering</span> and{' '}
                <span className="text-primary font-semibold">mathematical elegance</span>.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                From building intelligent systems powered by machine learning to crafting beautiful
                user interfaces, I believe every great solution begins with understanding the underlying
                mathematics. Whether it's optimizing algorithms or designing neural networks,
                I approach problems with both creative intuition and analytical rigor.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                When I'm not coding, you'll find me exploring mathematical proofs,
                experimenting with AI models, or pondering the beauty of{' '}
                <span className="text-accent">e<sup>iπ</sup> + 1 = 0</span>.
              </p>
            </motion.div>

            {/* Skills Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="glass-card p-4 rounded-lg text-center"
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px hsl(var(--primary) / 0.3)' }}
              >
                <div className="text-3xl font-bold text-gradient">AI/ML</div>
                <div className="text-sm text-muted-foreground mt-1">Deep Learning Expert</div>
              </motion.div>

              <motion.div
                className="glass-card p-4 rounded-lg text-center"
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px hsl(var(--accent) / 0.3)' }}
              >
                <div className="text-3xl font-bold text-gradient">Full-Stack</div>
                <div className="text-sm text-muted-foreground mt-1">Modern Web Dev</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .math-symbol {
          font-family: 'Times New Roman', serif;
          transition: transform 0.3s ease-out;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle at 50% 50%, var(--tw-gradient-stops));
        }
      `}</style>
    </section>
  );
};

export default About;
