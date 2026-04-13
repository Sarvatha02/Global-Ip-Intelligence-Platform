@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  /* Premium Fade-In with slight upward motion */
  .animate-in {
    animation-duration: 700ms;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    animation-fill-mode: both;
  }

  .fade-in {
    animation-name: fadeIn;
  }

  .slide-in-from-bottom-4 {
    animation-name: slideInBottom;
  }

  /* Status Badge Pulse - for Application, Grant, Expiry alerts */
  .animate-pulse-subtle {
    animation: pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Global Node Glow Effect */
  .intelligence-node-glow {
    box-shadow: 0 0 20px -5px rgba(99, 102, 241, 0.15);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInBottom {
  from { transform: translateY(1rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulseSubtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Custom scrollbar for the Live Alerts sidebar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.3);
}