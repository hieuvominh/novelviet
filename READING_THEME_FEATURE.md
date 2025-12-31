# Reading Background Color Feature

## Overview

The reading background color feature allows readers to customize the background and text colors of the chapter reading area for improved reading comfort.

## Features Implemented

✅ **4 Predefined Themes:**
- **Light (Sáng)** - White background with dark gray text
- **Sepia (Vàng cổ điển)** - Warm beige background with brown text
- **Dark (Tối)** - Dark slate background with light gray text
- **Night (Đêm)** - Pure black background with light blue-gray text

✅ **UI Components:**
- Palette icon button in the chapter reader header
- Dropdown panel with color swatches
- Visual active state indicator
- Smooth color transitions (300ms)

✅ **Persistence:**
- Saves selected theme to localStorage
- Restores on page reload
- No flash on initial load

✅ **Responsive:**
- Touch-friendly on mobile
- Works in fullscreen mode
- Click-outside to close
- ESC key support

✅ **Accessibility:**
- ARIA labels for screen readers
- Keyboard navigable
- Clear visual feedback for active theme

## File Structure

```
src/
├── hooks/
│   └── use-reading-theme.ts          # Theme state management hook
├── components/
│   └── chapters/
│       ├── reading-theme-selector.tsx # Theme picker UI
│       ├── chapter-reader-ui.tsx      # Updated with theme integration
│       └── chapter-header.tsx         # Updated to inherit theme colors
└── app/
    └── globals.css                    # Added primary color
```

## How to Use

1. **Navigate to any chapter page**
   - Example: `/truyen/dau-pha-thuong-khung/chuong-1`

2. **Click the palette icon** in the header (next to fullscreen button)

3. **Select a theme** from the dropdown:
   - Click any color swatch
   - The reading area updates immediately

4. **Your choice is saved** automatically

## Technical Details

### Hook: `useReadingTheme`

```typescript
const { currentTheme, themeConfig, setTheme, allThemes } = useReadingTheme();

// themeConfig contains:
// - background: CSS color value
// - text: CSS color value
// - name: Display name
// - displayColor: Swatch color
```

### Theme Configuration

Located in `use-reading-theme.ts`:

```typescript
export const READING_THEMES: Record<ReadingTheme, ThemeConfig> = {
  light: {
    background: "#ffffff",
    text: "#1f2937",
    // ...
  },
  // ... other themes
};
```

### Styling Approach

- Inline styles for background and text color (dynamic)
- Tailwind classes for layout and transitions
- `transition-colors duration-300` for smooth changes
- Rounded corners and padding for visual comfort

## Integration Points

### In ChapterReaderUI:

```tsx
import { useReadingTheme } from "@/hooks/use-reading-theme";
import { ReadingThemeSelector } from "./reading-theme-selector";

// Inside component:
const { themeConfig } = useReadingTheme();

// Applied to reading content:
<div
  id="reading-content"
  style={{ 
    backgroundColor: themeConfig.background,
    color: themeConfig.text,
  }}
>
```

### In Header:

```tsx
<ReadingThemeSelector />
```

## localStorage Keys

- **Key:** `reader-theme`
- **Value:** `"light" | "sepia" | "dark" | "night"`

## Browser Compatibility

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers
- Uses standard localStorage API

## Design Patterns

1. **Lazy State Initialization**
   - Reads localStorage synchronously during useState init
   - Prevents flash of default theme

2. **Click-Outside Detection**
   - Uses ref and mousedown event listener
   - Cleans up on unmount

3. **Escape Key Handling**
   - Global keydown listener when panel is open
   - Closes dropdown on ESC

4. **Color Inheritance**
   - Chapter header inherits text color from theme
   - Uses opacity for muted text

## Future Enhancements

- [ ] Custom color picker
- [ ] More preset themes
- [ ] Font family selection
- [ ] Export/import theme settings
- [ ] Sync across devices (requires backend)

## Notes

- This is a **UI-only** feature (no API calls)
- Theme applies **only to reading content area**
- Global site theme (dark/light mode) remains independent
- Works seamlessly with existing features:
  - Font size controls
  - Fullscreen mode
  - Chapter navigation

## Testing

To test all themes:

1. Go to any chapter page
2. Open theme selector
3. Click each theme option
4. Verify smooth color transition
5. Refresh page
6. Verify theme persists
7. Test in fullscreen mode
8. Test on mobile

## Performance

- No re-renders on scroll
- localStorage read happens once on mount
- Theme changes are instant (inline styles)
- Minimal bundle size impact (~3KB)
