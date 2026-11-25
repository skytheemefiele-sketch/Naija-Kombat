# Naija Kombat

**Live game:** https://naija-kombat-1br3.onrender.com

A playable browser prototype: 20 Nigerian fighter concepts, canvas-based characters, basic AI, keyboard and touch controls, health, timer, best-of-three rounds, and synthesized hit sounds. Express API and Socket.IO matchmaking demo included.

Run locally with Node 18+: `npm install && npm start`, then open http://localhost:10000.

Render config: `render.yaml`; no GitHub Actions pipeline is used.

Prototype gaps: no production-ready account persistence/authentication, authoritative server-side combat, finished network multiplayer, rewards/unlocks/store, challenge URLs, finished animation/audio/art, ad integration, or full QA yet. The current combat simulation is client-side and should not be used for competitive integrity.
