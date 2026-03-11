/* ═══════════════════════════════════════════════════
   Food Roulette — Application Logic (Phase 2)
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── DOM References ──────────────────────────────
    // Tabs
    const tabRoulette    = document.getElementById('tab-roulette');
    const tabManager     = document.getElementById('tab-manager');
    const viewRoulette   = document.getElementById('view-roulette');
    const viewManager    = document.getElementById('view-manager');

    // Roulette
    const rouletteWindow = document.getElementById('roulette-window');
    const rouletteTrack  = document.getElementById('roulette-track');
    const spinBtn        = document.getElementById('spin-btn');
    const winnerCard     = document.getElementById('winner-card');
    const winnerName     = document.getElementById('winner-name');
    const winnerLocText  = document.getElementById('winner-location-text');
    const winnerTags     = document.getElementById('winner-tags');
    const resetBtn       = document.getElementById('reset-btn');

    // Manager
    const searchInput    = document.getElementById('search-input');
    const addBtn         = document.getElementById('add-btn');
    const restoList      = document.getElementById('resto-list');
    const emptyState     = document.getElementById('empty-state');

    // Modal (Add/Edit)
    const modalOverlay   = document.getElementById('modal-overlay');
    const modalTitle     = document.getElementById('modal-title');
    const modalClose     = document.getElementById('modal-close');
    const modalCancel    = document.getElementById('modal-cancel');
    const restoForm      = document.getElementById('resto-form');
    const formId         = document.getElementById('form-id');
    const formName       = document.getElementById('form-name');
    const formLocation   = document.getElementById('form-location');
    
    // Tags Input
    const tagField       = document.getElementById('tag-field');
    const tagPills       = document.getElementById('tag-pills');
    let currentTags      = [];

    // Star Rating
    const starContainer  = document.getElementById('star-rating');
    const stars          = Array.from(starContainer.querySelectorAll('.star-rating__star'));
    let currentRating    = 0;

    // Confirm Dialog
    const confirmOverlay = document.getElementById('confirm-overlay');
    const confirmCancel  = document.getElementById('confirm-cancel');
    const confirmDelete  = document.getElementById('confirm-delete');
    let itemToDeleteId   = null;

    // ── State ───────────────────────────────────────
    let restaurants = [];
    let isSpinning  = false;
    const STORAGE_KEY = 'food_roulette_restos';

    // ── Bootstrap ───────────────────────────────────
    initApp();

    async function initApp() {
        // Tab Listeners
        tabRoulette.addEventListener('click', () => switchTab('roulette'));
        tabManager.addEventListener('click', () => switchTab('manager'));

        // Roulette Listeners
        spinBtn.addEventListener('click', spin);
        resetBtn.addEventListener('click', resetSpin);

        // Manager Listeners
        searchInput.addEventListener('input', () => renderManagerList(searchInput.value));
        addBtn.addEventListener('click', openAddModal);
        
        // Modal Listeners
        modalClose.addEventListener('click', closeModal);
        modalCancel.addEventListener('click', closeModal);
        restoForm.addEventListener('submit', handleFormSubmit);
        
        // Tag Listeners
        tagField.addEventListener('keydown', handleTagInput);
        tagPills.addEventListener('click', handleTagRemove);
        // Prevent form submission on enter in tag field
        tagField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') e.preventDefault();
        });

        // Rating Listeners
        stars.forEach(star => {
            star.addEventListener('click', (e) => setRating(parseInt(e.target.dataset.value, 10)));
        });

        // Confirm Dialog Listeners
        confirmCancel.addEventListener('click', closeConfirm);
        confirmDelete.addEventListener('click', handleDeleteConfirm);

        // Load Data
        await loadRestaurants();
    }

    // ── Tab Navigation ──────────────────────────────
    function switchTab(view) {
        if (view === 'roulette') {
            tabRoulette.classList.add('tabs__btn--active');
            tabManager.classList.remove('tabs__btn--active');
            viewRoulette.classList.add('view--active');
            viewManager.classList.remove('view--active');
            resetSpin(); // reset roulette state when switching
        } else {
            tabManager.classList.add('tabs__btn--active');
            tabRoulette.classList.remove('tabs__btn--active');
            viewManager.classList.add('view--active');
            viewRoulette.classList.remove('view--active');
            renderManagerList(searchInput.value);
        }
    }

    // ── Data Management ──────────────────────────────
    async function loadRestaurants() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                restaurants = JSON.parse(stored);
                // Check if empty, fallback to fetch if so, or just use what we have
                if (restaurants && restaurants.length > 0) {
                    updateRouletteState();
                    renderManagerList();
                    return;
                }
            } catch (err) {
                console.error("Failed to parse local storage", err);
            }
        }
        
        // Fallback to fetch
        try {
            const res  = await fetch('resto.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            // Assign UUIDs if missing
            restaurants = data.map(r => ({ ...r, id: r.id || generateId() }));
            saveToLocalStorage();
        } catch (err) {
            console.error('Failed to load restaurant data:', err);
            restaurants = [];
        }
        updateRouletteState();
        renderManagerList();
    }

    function saveToLocalStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
        updateRouletteState();
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    function updateRouletteState() {
        if (restaurants.length === 0) {
            spinBtn.disabled = true;
            rouletteTrack.innerHTML = '<span class="roulette__placeholder" style="color:#f87171;">List is empty. Add a restaurant!</span>';
        } else {
            spinBtn.disabled = false;
            rouletteTrack.innerHTML = '<span class="roulette__placeholder">Press Spin to begin!</span>';
        }
    }

    // ── Manager View ────────────────────────────────
    function renderManagerList(searchTerm = '') {
        restoList.innerHTML = '';
        
        const filterText = searchTerm.toLowerCase().trim();
        const filtered = restaurants.filter(r => {
            if (!filterText) return true;
            return r.name.toLowerCase().includes(filterText) ||
                   r.location.toLowerCase().includes(filterText) ||
                   (r.tags && r.tags.some(t => t.toLowerCase().includes(filterText)));
        });

        if (filtered.length === 0) {
            restoList.hidden = true;
            emptyState.hidden = false;
        } else {
            restoList.hidden = false;
            emptyState.hidden = true;

            filtered.forEach(resto => {
                const card = document.createElement('div');
                card.className = 'resto-card';
                card.innerHTML = `
                    <div class="resto-card__header">
                        <div class="resto-card__info">
                            <h3 class="resto-card__name">${escapeHTML(resto.name)}</h3>
                            <p class="resto-card__location">
                                <span class="resto-card__location-icon" aria-hidden="true">📍</span> ${escapeHTML(resto.location)}
                            </p>
                        </div>
                        <div class="resto-card__actions">
                            <button class="resto-card__btn resto-card__btn--edit" aria-label="Edit" data-id="${resto.id}">✏️</button>
                            <button class="resto-card__btn resto-card__btn--delete" aria-label="Delete" data-id="${resto.id}">🗑️</button>
                        </div>
                    </div>
                    <ul class="resto-card__tags">
                        ${(resto.tags || []).map(t => `<li class="resto-card__tag">${escapeHTML(t)}</li>`).join('')}
                    </ul>
                    <div class="resto-card__rating">
                        ${renderStarsHTML(resto.rating || 0)}
                    </div>
                `;
                
                // Attach event listeners for edit and delete
                const editBtn = card.querySelector('.resto-card__btn--edit');
                const deleteBtn = card.querySelector('.resto-card__btn--delete');
                
                editBtn.addEventListener('click', () => openEditModal(resto));
                deleteBtn.addEventListener('click', () => openConfirmDelete(resto.id));

                restoList.appendChild(card);
            });
        }
    }

    function renderStarsHTML(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            const filledStr = i <= rating ? ' resto-card__star--filled' : '';
            html += `<span class="resto-card__star${filledStr}">★</span>`;
        }
        return html;
    }

    // ── Forms / Modal ───────────────────────────────
    function openAddModal() {
        modalTitle.textContent = 'Add Restaurant';
        restoForm.reset();
        formId.value = '';
        currentTags = [];
        renderTags();
        setRating(0);
        modalOverlay.hidden = false;
        formName.focus();
    }

    function openEditModal(resto) {
        modalTitle.textContent = 'Edit Restaurant';
        formId.value = resto.id;
        formName.value = resto.name;
        formLocation.value = resto.location;
        currentTags = [...(resto.tags || [])];
        renderTags();
        setRating(resto.rating || 0);
        modalOverlay.hidden = false;
        formName.focus();
    }

    function closeModal() {
        modalOverlay.hidden = true;
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const newResto = {
            id: formId.value || generateId(),
            name: formName.value.trim(),
            location: formLocation.value.trim(),
            tags: [...currentTags],
            rating: currentRating
        };

        if (formId.value) {
            // Update
            const idx = restaurants.findIndex(r => r.id === formId.value);
            if (idx !== -1) {
                restaurants[idx] = newResto;
            }
        } else {
            // Create
            restaurants.push(newResto);
        }

        saveToLocalStorage();
        renderManagerList(searchInput.value);
        closeModal();
    }

    // ── Tags Logic ──────────────────────────────────
    function handleTagInput(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = tagField.value.trim();
            if (val && !currentTags.includes(val)) {
                currentTags.push(val);
                renderTags();
                tagField.value = '';
            }
        }
    }

    function handleTagRemove(e) {
        if (e.target.classList.contains('tag-pill__remove')) {
            const idx = parseInt(e.target.dataset.index, 10);
            currentTags.splice(idx, 1);
            renderTags();
        }
    }

    function renderTags() {
        tagPills.innerHTML = currentTags.map((tag, idx) => `
            <div class="tag-pill">
                ${escapeHTML(tag)}
                <button type="button" class="tag-pill__remove" data-index="${idx}" aria-label="Remove tag">&times;</button>
            </div>
        `).join('');
    }

    // ── Rating Logic ────────────────────────────────
    function setRating(val) {
        currentRating = val;
        stars.forEach(star => {
            const starVal = parseInt(star.dataset.value, 10);
            if (starVal <= val) {
                star.classList.add('star-rating__star--active');
            } else {
                star.classList.remove('star-rating__star--active');
            }
        });
    }

    // ── Delete Dialog Logic ─────────────────────────
    function openConfirmDelete(id) {
        itemToDeleteId = id;
        confirmOverlay.hidden = false;
    }

    function closeConfirm() {
        confirmOverlay.hidden = true;
        itemToDeleteId = null;
    }

    function handleDeleteConfirm() {
        if (itemToDeleteId) {
            restaurants = restaurants.filter(r => r.id !== itemToDeleteId);
            saveToLocalStorage();
            renderManagerList(searchInput.value);
            closeConfirm();
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
        updateRouletteState(); // update disabled state if empty
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
