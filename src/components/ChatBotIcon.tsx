import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatBotIcon = () => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
      className="fixed bottom-8 right-8 z-50"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative group"
        aria-label="Chat with me"
      >
        <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-glow-pulse" />
        <div className="relative w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-2xl">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.button>
    </motion.div>
  );
};

export default ChatBotIcon;
// Attach a tooltip to the existing chat button (by aria-label). Runs on module load.
(function attachChatTooltip() {
  if (typeof document === "undefined") return;

  function createTooltip() {
    const el = document.createElement("div");
    el.textContent = "let's chat with virtual me! 😉";
    Object.assign(el.style, {
      position: "absolute",
      padding: "6px 10px",
      background: "rgba(17,24,39,0.95)", // dark bg
      color: "white",
      borderRadius: "8px",
      fontSize: "12px",
      pointerEvents: "none",
      transform: "translateY(-8px)",
      transition: "opacity 160ms ease, transform 160ms ease",
      opacity: "0",
      whiteSpace: "nowrap",
      zIndex: "9999",
      boxShadow: "0 6px 18px rgba(2,6,23,0.6)",
    });
    return el;
  }

  function positionTooltip(el: HTMLElement, rect: DOMRect) {
    const margin = 8;
    const top = window.scrollY + rect.top - el.offsetHeight - margin;
    let left = window.scrollX + rect.left + rect.width / 2 - el.offsetWidth / 2;
    // keep inside viewport horizontally
    left = Math.max(8 + window.scrollX, Math.min(left, window.scrollX + document.documentElement.clientWidth - el.offsetWidth - 8));
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
  }

  function initOnce() {
    const btn = document.querySelector<HTMLButtonElement>('button[aria-label="Chat with me"]');
    if (!btn) return;

    const tooltip = createTooltip();
    document.body.appendChild(tooltip);

    let visible = false;

    function show() {
      if (!visible) {
        positionTooltip(tooltip, btn.getBoundingClientRect());
        tooltip.style.opacity = "1";
        tooltip.style.transform = "translateY(-12px)";
        visible = true;
      }
    }
    function hide() {
      tooltip.style.opacity = "0";
      tooltip.style.transform = "translateY(-8px)";
      visible = false;
    }
    function onMouseMove() {
      if (visible) positionTooltip(tooltip, btn.getBoundingClientRect());
    }

    btn.addEventListener("mouseenter", show);
    btn.addEventListener("focus", show);
    btn.addEventListener("mouseleave", hide);
    btn.addEventListener("blur", hide);
    window.addEventListener("scroll", onMouseMove, { passive: true });
    window.addEventListener("resize", onMouseMove);

    // If the button is added later to the DOM, attempt re-init a few times.
    // Clean up isn't strictly necessary for app lifetime, but remove listeners if page unloads.
    window.addEventListener("beforeunload", () => {
      try {
        btn.removeEventListener("mouseenter", show);
        btn.removeEventListener("focus", show);
        btn.removeEventListener("mouseleave", hide);
        btn.removeEventListener("blur", hide);
        window.removeEventListener("scroll", onMouseMove);
        window.removeEventListener("resize", onMouseMove);
        tooltip.remove();
      } catch {}
    });
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    // small delay to ensure React mounted the button
    setTimeout(initOnce, 50);
  } else {
    window.addEventListener("DOMContentLoaded", () => setTimeout(initOnce, 50));
  }
})();