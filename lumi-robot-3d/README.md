# LUMI AI — 3D Robot

The interactive 3D robot from the "OUR ORIGIN" section of the LUMI AI site
(`OriginSplineCard` in `src/components/sections/Timeline.tsx`). The robot turns
its head and body to follow your mouse.

```
lumi-robot-3d/
├── robot.html                         ← standalone version: double-click to open
└── nextjs/                            ← React / Next.js version (drop into a project)
    └── src/
        ├── components/
        │   ├── RobotCard.tsx          ← the robot card
        │   └── ui/
        │       ├── splite.tsx         ← lazy Spline loader (SplineScene)
        │       ├── spotlight.tsx      ← light sweep behind the text
        │       └── card.tsx           ← Card wrapper
        ├── lib/utils.ts               ← cn() helper
        └── app/robot.css              ← spotlight animation keyframes
```

## About the 3D model

The robot model itself isn't stored in this folder, or in the original project.
It's a Spline scene hosted by Spline and loaded at runtime from:

```
https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode
```

Both versions need an internet connection to show the robot.

## Option 1: standalone HTML

Open `robot.html` in any modern browser. There's nothing to install; the Spline
runtime loads from a CDN.

## Option 2: use it in a Next.js / React project

Requires Tailwind CSS v4 and the `@/*` path alias (`"@/*": ["./src/*"]` in `tsconfig.json`).

1. Install the dependencies:

   ```bash
   npm install @splinetool/react-spline@^4.1.0 @splinetool/runtime@^1.12.95 clsx tailwind-merge
   ```

2. Copy `nextjs/src/*` into your project's `src/` folder.

3. Add the spotlight animation to your global CSS, after `@import "tailwindcss";`:

   ```css
   @import "./robot.css";
   ```

4. Render it on a dark background:

   ```tsx
   import RobotCard from "@/components/RobotCard";

   export default function Page() {
     return (
       <main className="min-h-screen bg-black p-8">
         <RobotCard />
       </main>
     );
   }
   ```

`SplineScene` only loads the robot when it scrolls near the viewport. It skips
loading entirely (and shows a glowing orb instead) for users with reduced motion
on, data saver on, or fewer than 4 CPU cores.
