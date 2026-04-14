# Coding Standards: Great Escape

## General Principles
- **Clarity over Conciseness**: Write code that is easy to read and maintain.
- **Strict Typing**: Leverage TypeScript to the fullest. Avoid `any`. Use interfaces/types for all data models, especially PocketBase records.
- **Consistency**: Follow existing patterns in the codebase.

## React & Next.js
- **Components**: Use functional components with arrow functions.
- **Hooks**: Use standard hooks (`useState`, `useEffect`, `useMemo`). Keep component logic lean; move complex logic to utility functions or custom hooks.
- **Server Components**: Prefer Server Components for data fetching where possible. Use Client Components (`"use client"`) only when interactivity or browser APIs are required.
- **File Naming**: 
  - Components: `PascalCase.tsx`
  - Pages/Layouts: `page.tsx`, `layout.tsx`
  - Library/Utils: `kebab-case.ts`

## PocketBase Integration
- **Client**: Always use the initialized client from `src/lib/pb.ts`.
- **Error Handling**: Use `try/catch` blocks for all database operations. Provide meaningful error messages or fallbacks.
- **Models**: Map PocketBase collections to TypeScript types.

## Styling (Tailwind CSS 4)
- **Modern Syntax**: Use Tailwind 4 features (e.g., `@tailwindcss/postcss`).
- **Design Tokens**: Use the theme tokens defined in `globals.css`.
- **Animations**: Prefer Tailwind's utility-based animations or custom CSS transitions over heavy library-based animations for simple UI states.
- **Responsive Design**: Mobile-first approach is mandatory.

## Code Quality
- **ESLint**: Ensure all changes pass the current ESLint configuration (`npm run lint`).
- **Comments**: Comment complex logic, but aim for self-documenting code.
