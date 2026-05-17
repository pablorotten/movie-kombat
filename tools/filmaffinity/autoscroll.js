let scrollRequestId;
window.stopScroll = false; // Interruptor

const startSmoothScroll = (speed = 1) => {
  window.stopScroll = false; // Reset al empezar
  let currentScroll = window.scrollY;
  
  const step = () => {
    if (window.stopScroll) {
      cancelAnimationFrame(scrollRequestId);
      console.log("🛑 Scroll detenido manualmente");
      return;
    }

    currentScroll += speed;
    window.scrollTo(0, currentScroll);
    
    if (currentScroll < document.documentElement.scrollHeight - window.innerHeight) {
      scrollRequestId = window.requestAnimationFrame(step);
    } else {
      console.log("✅ Fin de página");
    }
  };
  
  scrollRequestId = window.requestAnimationFrame(step);
};

// Start: startSmoothScroll(1)
// Stop: window.stopScroll = true