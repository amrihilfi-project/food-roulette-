import { useState, useRef } from 'react';

export default function Roulette({ restaurants }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [currentName, setCurrentName] = useState('Press Spin to begin!');
  const [showWinner, setShowWinner] = useState(false);

  const containerRef = useRef(null);

  const spin = () => {
    if (isSpinning || !restaurants || restaurants.length === 0) return;
    setIsSpinning(true);
    setShowWinner(false);

    const winnerIndex = Math.floor(Math.random() * restaurants.length);
    const selectedWinner = restaurants[winnerIndex];

    const totalDuration = 2800; // ms
    const startInterval = 60; // ms
    const endInterval = 280; // ms

    let elapsed = 0;
    let idx = 0;

    const tick = () => {
      const r = restaurants[idx % restaurants.length];
      setCurrentName(r.name);
      idx++;

      const progress = Math.min(elapsed / totalDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const interval = startInterval + (endInterval - startInterval) * eased;

      elapsed += interval;

      if (elapsed < totalDuration) {
        setTimeout(tick, interval);
      } else {
        setCurrentName(selectedWinner.name);
        setTimeout(() => {
          setIsSpinning(false);
          setWinner(selectedWinner);
          setShowWinner(true);
          spawnConfetti();
        }, 400);
      }
    };

    tick();
  };

  const spawnConfetti = () => {
    const colors = ['#ff6b35', '#f7c948', '#ff8c42', '#e84393', '#00cec9', '#fd79a8'];
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const dot = document.createElement('span');
      dot.style.cssText = `
        position: absolute;
        width: ${4 + Math.random() * 6}px;
        height: ${4 + Math.random() * 6}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${40 + Math.random() * 20}%;
        top: 50%;
        pointer-events: none;
        z-index: 10;
        opacity: 0;
      `;

      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 120;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const rotation = Math.random() * 720 - 360;
      const duration = 600 + Math.random() * 500;

      dot.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`, opacity: 0 },
        ],
        { duration, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }
      );

      container.appendChild(dot);
      setTimeout(() => dot.remove(), duration + 50);
    }
  };

  const resetSpin = () => {
    setShowWinner(false);
    setWinner(null);
    setCurrentName(restaurants?.length > 0 ? 'Press Spin to begin!' : 'List is empty. Add a restaurant!');
  };

  return (
    <>
      <section className="roulette" id="roulette-section" aria-label="Restaurant randomizer" ref={containerRef} style={{ position: 'relative' }}>
        <div className={`roulette__window ${isSpinning ? 'roulette__window--spinning' : ''}`} id="roulette-window">
          <div className="roulette__track" id="roulette-track">
            {isSpinning || showWinner ? (
              <span className="roulette__name" style={showWinner ? { animation: 'none', color: 'var(--clr-accent-2)' } : {}}>
                {currentName}
              </span>
            ) : (
              <span className="roulette__placeholder" style={(!restaurants || restaurants.length === 0) ? { color: '#f87171' } : {}}>
                {currentName}
              </span>
            )}
          </div>
        </div>

        <button
          className="spin-btn"
          id="spin-btn"
          type="button"
          onClick={spin}
          disabled={isSpinning || !restaurants || restaurants.length === 0}
        >
          <span className="spin-btn__label">🎰 Spin!</span>
        </button>
      </section>

      {showWinner && winner && (
        <section className="winner" id="winner-card" aria-live="polite">
          <div className="winner__badge">🏆 Today's Pick</div>
          <h2 className="winner__name" id="winner-name">{winner.name}</h2>
          <p className="winner__location" id="winner-location">
            <span className="winner__location-icon" aria-hidden="true">📍</span>
            <span id="winner-location-text">{winner.location}</span>
          </p>
          <ul className="winner__tags" id="winner-tags">
            {(winner.tags || []).map((tag, idx) => (
              <li key={idx} className="winner__tag">{tag}</li>
            ))}
          </ul>
          <button className="reset-btn" id="reset-btn" type="button" onClick={resetSpin}>
            🔄 Spin Again
          </button>
        </section>
      )}
    </>
  );
}
