# Category Page - List View Implementation

Complete UI-only implementation of toggle between Grid and List views for the Category/Genre listing page.

## ✅ Components Created

### 1. `NovelListItem` 
**Location:** `src/components/novels/novel-list-item.tsx`

Horizontal list item component with:
- **Left:** Cover image (3:4 aspect, lazy loaded)
- **Center:** Title, author, status badge, description (2 lines max)
- **Right:** Rating, stats, "Đọc tiếp" button (desktop only)
- Mobile-optimized with stacked layout
- Entire row is clickable with hover effects
- Accessible with proper focus states

### 2. `ViewToggle`
**Location:** `src/components/category/view-toggle.tsx`

Toggle buttons for switching views:
- Grid icon (⬜) and List icon (☰)
- Active state highlighting
- Tooltips: "Xem dạng lưới" / "Xem dạng danh sách"
- Keyboard accessible (Enter/Space)
- ARIA labels for screen readers
- Responsive (hides text labels on mobile)

### 3. `CategoryListSkeleton`
**Location:** `src/components/category/category-list-skeleton.tsx`

Loading skeleton for list view:
- 12 placeholder rows
- Shimmer animation
- Responsive layout matching actual content
- Desktop shows full stats, mobile shows compact version

### 4. `CategoryContent`
**Location:** `src/components/category/category-content.tsx`

Client component wrapper that:
- Manages view mode state
- Renders Grid or List based on selection
- Shows loading skeleton during initialization
- Handles smooth transitions between views
- Includes CSS animations with reduced motion support

### 5. `useViewMode` Hook
**Location:** `src/hooks/use-view-mode.ts`

Custom hook for view mode state:
- Persists to localStorage (`category_view_mode`)
- Default: **List on desktop (≥768px), Grid on mobile**
- Cross-tab sync via StorageEvent
- Returns: `{ viewMode, setViewMode, isReady }`

## 🎨 Features

### State Management
```typescript
viewMode: "grid" | "list"
```
- Default desktop: **list**
- Default mobile: **grid**
- Persisted in localStorage
- Real-time sync across tabs

### Responsive Behavior

**Desktop (≥768px):**
- Full horizontal list layout
- Stats column visible on right
- Description shown (2 lines)
- "Đọc tiếp" button visible

**Tablet (640-768px):**
- Stats stacked below content
- Slightly smaller cover
- Compact layout

**Mobile (<640px):**
- Icons + chapters/views only
- Minimal vertical space
- Touch-optimized tap targets

### Animations
```css
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```
- Smooth fade + slide transition
- Applied when switching views
- Respects `prefers-reduced-motion`

### SEO & Accessibility
- ✅ Title uses `<h3>`
- ✅ Author name is text (crawlable)
- ✅ Description is plain text
- ✅ Proper semantic HTML
- ✅ ARIA labels on toggle buttons
- ✅ Focus ring visible
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ Each item links to novel detail page

## 📂 File Changes

### New Files
```
src/
├── components/
│   ├── category/
│   │   ├── view-toggle.tsx (NEW)
│   │   ├── category-content.tsx (NEW)
│   │   └── category-list-skeleton.tsx (NEW)
│   └── novels/
│       └── novel-list-item.tsx (NEW)
├── hooks/
│   └── use-view-mode.ts (NEW)
```

### Modified Files
```
src/
├── app/
│   ├── the-loai/[slug]/page.tsx (UPDATED - imports + usage)
│   └── globals.css (UPDATED - animations)
```

## 🔧 Usage

The category page now automatically includes the toggle:

```tsx
// In /the-loai/[slug]/page.tsx
import { CategoryContent } from "@/components/category/category-content";

// Pass novels array and category name
<CategoryContent novels={novels} categoryName={genre.name_vi} />
```

The component handles:
- View mode initialization
- localStorage persistence  
- Loading states
- Grid/List rendering
- Smooth transitions

## 🎯 User Flow

1. User visits category page (e.g., `/the-loai/tien-hiep`)
2. Default view loads based on screen size:
   - Desktop: **List View** (optimized for reading)
   - Mobile: **Grid View** (space efficient)
3. User clicks toggle button to switch views
4. Content transitions smoothly with fade + slide
5. Preference saved to localStorage
6. Preference persists across:
   - Page refreshes
   - Navigation between categories
   - Browser tabs (same domain)

## 🚀 Testing

Visit any category page with dummy data:
- `/the-loai/tien-hiep` - Tiên Hiệp
- `/the-loai/huyen-huyen` - Huyền Huyễn
- `/the-loai/ngon-tinh` - Ngôn Tình
- `/the-loai/fantasy` - Fantasy

Toggle between Grid and List views to see:
- Smooth animations
- Responsive layout changes
- Persistent preference
- Loading skeleton states

## 📱 Responsive Breakpoints

```css
Mobile:    < 640px  (Grid default, compact list option)
Tablet:    640-768px (Adjusted list layout)
Desktop:   ≥ 768px  (List default, full features)
```

## ♿ Accessibility Features

- **Keyboard Navigation:** Tab through items, Enter/Space to activate
- **Screen Reader:** ARIA labels on all interactive elements
- **Focus Visible:** Clear focus ring on all focusable elements
- **Semantic HTML:** Proper heading hierarchy (H1 → H2 → H3)
- **Motion Respect:** Animations disabled when `prefers-reduced-motion` is set
- **Color Contrast:** WCAG AA compliant colors
- **Touch Targets:** Minimum 44x44px on mobile

## 🎨 Design Tokens

```css
/* View Toggle */
Active: white bg + shadow (light), gray-900 bg (dark)
Inactive: gray-600 text (light), gray-400 (dark)
Hover: gray-900 text (light), gray-100 (dark)

/* List Item */
Background: white (light), gray-900 (dark)
Border: gray-200 (light), gray-800 (dark)
Hover Border: primary/50
Shadow: lg on hover

/* Status Badges */
Completed: green-100/green-800 (light), green-900/green-400 (dark)
Ongoing: blue-100/blue-800 (light), blue-900/blue-400 (dark)
```

## 🔄 State Flow

```
1. Component Mount
   ↓
2. useViewMode Hook Init
   ↓
3. Check localStorage
   ↓
4. Apply saved preference (or default)
   ↓
5. Set isReady = true
   ↓
6. Render content (Grid or List)
   ↓
7. User clicks toggle
   ↓
8. Update state + localStorage
   ↓
9. Dispatch StorageEvent
   ↓
10. Smooth transition to new view
```

## ⚠️ Important Notes

- **UI Only:** No backend changes required
- **No API Calls:** Uses existing data
- **No Breaking Changes:** Grid view still works as before
- **Performance:** Lazy loading images in both views
- **SEO Safe:** Content is server-rendered, toggle is client-side only

## 🐛 Troubleshooting

**View preference not persisting:**
- Check localStorage is enabled
- Verify key: `category_view_mode`
- Clear browser cache

**Animations not smooth:**
- Check CSS is loaded (`globals.css`)
- Verify no conflicting transitions
- Test in different browsers

**Layout issues on mobile:**
- Verify Tailwind breakpoints
- Check responsive classes (`md:`, `lg:`)
- Test on actual devices

## 📝 Future Enhancements

Potential improvements (not implemented):
- Filter novels in list view (inline search)
- Sorting within view (drag & drop)
- Density toggle (compact/comfortable/spacious)
- Column customization for list view
- Export view preference to user profile (when auth added)

---

**Status:** ✅ Complete  
**Version:** 1.0  
**Last Updated:** December 31, 2025
