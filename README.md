# 3D Zombie Shooter

A first-person shooter game where you defend against waves of zombies. This version uses built-in Three.js geometries and Web Audio API for sound effects, requiring no external assets.

## Features

- First-person shooter mechanics
- Zombie AI that follows and attacks the player
- Synthesized sound effects using Web Audio API
- Health and ammo system
- Score tracking
- Game over screen with restart option
- Animated zombie arms
- Weapon recoil effect

## Controls

- WASD: Move
- Mouse: Look around
- Left Click: Shoot
- R: Reload
- Click game window to start and lock mouse cursor

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open http://localhost:5173 in your browser

## Game Mechanics

- Each zombie takes 3 shots to kill
- Zombies spawn randomly around the player
- Maximum of 20 zombies at once
- Each zombie kill awards 100 points
- Reload takes 2 seconds
- Magazine capacity: 30 rounds
- Player health: 100
- Zombie damage: 10 per hit

## Technical Details

- Uses Three.js for 3D graphics
- Web Audio API for synthesized sound effects
- No external assets required
- Fully client-side game
- Responsive design that adapts to window size
