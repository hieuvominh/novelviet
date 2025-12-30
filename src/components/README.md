# Component Guidelines

## Directory Structure
- `ui/` - Reusable UI components (buttons, inputs, cards, etc.)
- `providers/` - Context providers (theme, auth, etc.)
- `layouts/` - Layout components (header, footer, sidebar)
- `features/` - Feature-specific components

## Naming Conventions
- Use PascalCase for component files: `Button.tsx`
- Use kebab-case for directories: `user-profile/`
- Export components as named exports when possible

## Best Practices
- Keep components small and focused
- Use TypeScript for all components
- Document props with JSDoc comments
- Prefer composition over configuration
