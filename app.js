/* ═══════════════════════════════════════════════════
   Food Roulette — Application Logic (Phase 1)
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── DOM References ──────────────────────────────
    const rouletteWindow = document.getElementById('roulette-window');
    const rouletteTrack  = document.getElementById('roulette-track');
    const spinBtn        = document.getElementById('spin-btn');
    const winnerCard     = document.getElementById('winner-card');
    const winnerName     = document.getElementById('winner-name');
    const winnerLocText  = document.getElementById('winner-location-text');
    const winnerTags     = document.getElementById('winner-tags');
    const resetBtn       = document.getElementById('reset-btn');

    // ── State ───────────────────────────────────────
    let restaurants = [];
    let isSpinning  = false;

    // ── Bootstrap ───────────────────────────────────
    fetchRestaurants();
    spinBtn.addEventListener('click', spin);
    resetBtn.addEventListener('click', resetSpin);

    // ── Fetch Data ──────────────────────────────────
    async function fetchRestaurants() {
        try {
            const res  = await fetch('resto.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            restaurants = await res.json();
        } catch (err) {
            console.error('Failed to load restaurant data:', err);
            rouletteTrack.innerHTML =
                '<span class="roulette__placeholder" style="color:#f87171;">⚠ Could not load restaurants.</span>';
            spinBtn.disabled = true;
        }
    }

    // ── Spin Logic ──────────────────────────────────
    function spin() {
        if (isSpinning || restaurants.length === 0) return;
        isSpinning = true;

        // Hide previous winner
        winnerCard.hidden = true;

        // UI state
        spinBtn.disabled = true;
        rouletteWindow.classList.add('roulette__window--spinning');

        // Choose the winner up-front so we can land on it
        const winnerIndex = Math.floor(Math.random() * restaurants.length);
        const winner = restaurants[winnerIndex];

        // Shuffle parameters
        const totalDuration = 2800;  // ms
        const startInterval = 60;    // ms — initial speed
        const endInterval   = 280;   // ms — slow crawl at end

        let elapsed   = 0;
        let idx       = 0;

        // Begin shuffling
        function tick() {
            // Display a restaurant name
            const r = restaurants[idx % restaurants.length];
            rouletteTrack.innerHTML =
                `<span class="roulette__name">${escapeHTML(r.name)}</span>`;
            idx++;

            // Calculate next interval (ease-out deceleration)
            const progress  = Math.min(elapsed / totalDuration, 1);
            const eased     = 1 - Math.pow(1 - progress, 3); // cubic ease-out
            const interval  = startInterval + (endInterval - startInterval) * eased;

            elapsed += interval;

            if (elapsed < totalDuration) {
                setTimeout(tick, interval);
            } else {
                // Landing: show winner name in the track
                rouletteTrack.innerHTML =
                    `<span class="roulette__name" style="animation:none; color:var(--clr-accent-2);">${escapeHTML(winner.name)}</span>`;

                // Brief pause then reveal card
                setTimeout(() => {
                    rouletteWindow.classList.remove('roulette__window--spinning');
                    renderWinner(winner);
                    spawnConfetti();
                    isSpinning = false;
                }, 400);
            }
        }

        tick();
    }

    // ── Render Winner Card ──────────────────────────
    function renderWinner(restaurant) {
        winnerName.textContent    = restaurant.name;
        winnerLocText.textContent = restaurant.location;

        // Build tag pills
        winnerTags.innerHTML = '';
        (restaurant.tags || []).forEach(tag => {
            const li = document.createElement('li');
            li.className = 'winner__tag';
            li.textContent = tag;
            winnerTags.appendChild(li);
        });

        // Reveal
        winnerCard.hidden = false;
        // Re-trigger CSS animation
        winnerCard.style.animation = 'none';
        void winnerCard.offsetHeight; // force reflow
        winnerCard.style.animation = '';
    }

    // ── Reset ───────────────────────────────────────
    function resetSpin() {
        winnerCard.hidden = true;
        spinBtn.disabled  = false;
        rouletteTrack.innerHTML =
            '<span class="roulette__placeholder">Press Spin to begin!</span>';
    }

    // ── Mini Confetti Burst ─────────────────────────
    function spawnConfetti() {
        const colors = ['#ff6b35', '#f7c948', '#ff8c42', '#e84393', '#00cec9', '#fd79a8'];
        const container = document.getElementById('roulette-section');

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

            // Random physics
            const angle    = Math.random() * Math.PI * 2;
            const distance = 60 + Math.random() * 120;
            const dx       = Math.cos(angle) * distance;
            const dy       = Math.sin(angle) * distance;
            const rotation = Math.random() * 720 - 360;
            const duration = 600 + Math.random() * 500;

            dot.animate([
                { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`, opacity: 0 }
            ], {
                duration,
                easing: 'cubic-bezier(.16,1,.3,1)',
                fill: 'forwards'
            });

            container.style.position = 'relative';
            container.appendChild(dot);

            // Cleanup
            setTimeout(() => dot.remove(), duration + 50);
        }
    }

    // ── Helpers ─────────────────────────────────────
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

})();
