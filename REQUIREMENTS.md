# Product Requirements Document: Food Roulette & Restaurant Manager

## 1. Overview
A web application designed to eliminate decision fatigue by randomly selecting a lunch spot from a curated list of nearby restaurants. The app also includes a comprehensive Restaurant Management system (CRUD) to maintain and update the list of options.

## 2. Core Objectives
- Provide a fun, fast, and interactive way to choose a lunch destination. 
- Allow users to easily manage (Add, Edit, Delete) the list of available restaurants.
- Serve as a single source of truth for group lunch options.

## 3. Data Model
Based on the existing `resto.json`, the restaurant data structure will require the following fields:
- `id` (String/UUID) - Unique identifier for internal logic (will be auto-generated).
- `name` (String) - The name of the restaurant (e.g., "Ayam Bakar & Goreng Si Bungsu").
- `location` (String) - The address or specific area (e.g., "Jl. Gelap Nyawang").
- `tags` (Array of Strings) - Categories such as cuisine, vibe, or price range (e.g., "Indonesian", "Budget-friendly").
- `rating` (Number, Optional) - A score (e.g., 1-5 or 1-10) given by team members to influence the randomizer's weighted choice.

## 4. Features & User Flows

### A. The Food Roulette (Randomizer)
- **"Spin the Wheel" Action:** A highly visible primary CTA button to randomly select a restaurant.
- **Suspense Animation:** Visual feedback (a spinning wheel, rapid text shuffling, or flipping cards) before the result is revealed.
- **Result Display:** An emphasized UI card displaying the winner's Name, Location, and Tags.
- **Weighted Random Mode (Optional Toggle):** An advanced mode that alters the randomizer's algorithm. Instead of a uniform 1/N chance, restaurants with higher `rating` scores have a proportionally higher chance of being selected.
- **Tag Filtering (Stretch Target):** Allow users to select specific tags (e.g., "Indonesian") so the roulette only randomly picks from restaurants matching those tags.

### B. Restaurant Management (CRUD)
- **List View (Read):** A searchable and filterable list/table of all restaurants currently in the system, displaying their current ratings.
- **Add/Edit Restaurant (Create/Update):** Forms with inputs for Name, Location, dynamic tags, and an optional 1-5 star `rating` input.
- **Delete Restaurant (Delete):** A button to remove a restaurant from the pool, equipped with an "Are you sure?" confirmation dialog.

## 5. UI / UX Guidelines
- **Responsive Design:** Must be fully usable on mobile devices, as users will likely use it on the go.
- **Aesthetic:** Modern, premium, and appetizing. Use playful micro-animations and smooth transitions between states (Roulette vs. Management view).
- **Navigation:** A simple tab or sidebar system to switch between "Play Roulette" and "Manage Restaurants".

## 6. Implementation Phases

To ensure a smooth rollout of the Food Roulette application, the development will be split into four distinct phases.

### Phase 1: MVP & Core Randomizer (The "Quick Win")
**Goal:** Get the core roulette feature working with static data to immediately solve the lunch indecision problem.
- Setup project foundation (HTML/CSS/JS or frontend framework).
- Implement the "Spin the Wheel" UI and animation.
- Load the existing `resto.json` as static data.
- Display the winning restaurant with its name, location, and tags.
- **Deliverable:** A functional randomizer that users can view and spin.

### Phase 2: Local CRUD Operations (The "Manager")
**Goal:** Allow users to manage the list of restaurants locally within their browser.
- Implement the "Manage Restaurants" view (List/Table).
- Create the Add, Edit, and Delete forms and modals.
- Introduce `localStorage` to save user changes so they persist across page refreshes.
- Ensure the Roulette reads from the updated `localStorage` data rather than just the static JSON.
- **Deliverable:** A fully functional app where users can manage their own local list of restaurants.

### Phase 3: Shared State & Collaboration (The "Team Tool")
**Goal:** Enable officemates to share the exact same list of restaurants and roulette results, hosted on Netlify Free Tier.
- Migrate the project to a framework suitable for Netlify deployment (e.g., Vite/React for an SPA, or Next.js for SSR/Static).
- Since Netlify's free tier is primarily for static sites and serverless functions, we will implement state sharing via one of the following:
  - **Option A:** Netlify Serverless Functions connecting to a free database (like MongoDB Atlas Free Tier, Supabase, or Firebase).
  - **Option B (Simpler):** Use a third-party Backend-as-a-Service (like Firebase or Supabase) directly from the front-end to bypass custom server logic entirely.
- (Optional) Add real-time updates so when one person adds a restaurant, everyone sees it immediately.
- **Deliverable:** A collaborative team tool deployed live on a Netlify URL where everyone spins from the synchronized restaurant pool.

### Phase 4: Premium UI/UX Polish (The "Wow Factor")
**Goal:** Elevate the entire application from functional to stunning, delivering a premium, modern experience.
- Refine the color palette with curated, harmonious tones (dark mode support, vibrant gradients).
- Integrate premium typography (e.g., Google Fonts like Inter or Outfit).
- Add micro-animations and transitions: smooth page switches, hover effects on cards, animated tag pills, and a celebratory confetti/particle effect on the roulette winner reveal.
- Polish responsive layouts for mobile, tablet, and desktop breakpoints.
- Implement loading skeletons, empty states, and error states for a complete, professional feel.
- Conduct a full UI/UX audit: spacing, alignment, contrast ratios (accessibility), and interaction feedback.
- **Deliverable:** A polished, production-grade application that feels premium and delightful to use.
