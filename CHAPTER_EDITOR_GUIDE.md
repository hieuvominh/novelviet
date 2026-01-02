# Chapter Editor Guide

## Overview

The Chapter Editor provides a split-view plain text editor with live preview for creating and editing novel chapters.

## Content Format

### Plain Text Only
- **No Markdown**: Content is stored as plain text
- **Paragraphs**: Separated by blank lines (double newline `\n\n`)
- **Line Breaks**: Single newlines are preserved
- **No HTML**: No HTML tags or markdown syntax

### Example
```
This is the first paragraph.

This is the second paragraph.
It has a line break here.
And continues on this line.

This is the third paragraph.
```

## Features

### ✅ Split-View Layout
- **Left Panel**: Plain text editor with form fields
- **Right Panel**: Live preview (toggleable)
- Toggle preview on/off with button in header

### ✅ Form Fields
- **Chapter Title**: Text input for chapter name
- **Chapter Number**: Auto-assigned, read-only
- **Word Count**: Auto-calculated from content
- **Character Count**: Total characters (excluding whitespace)
- **Reading Time**: Estimated time at 250 words/min
- **Status**: Visual indicator (Published/Draft)
- **Content**: Full plain text editor

### ✅ Editor Features
- **Plain Text**: No markdown or HTML
- **Monospace Font**: Easy to read while editing
- **Line Height 1.7**: Comfortable spacing
- **Soft Wrap**: Lines wrap at editor width
- **Live Preview**: Updates as you type
- **Scroll Sync**: Preview follows editor scroll (basic)

### ✅ Statistics
- **Word Count**: Real-time word count
- **Character Count**: Characters excluding whitespace
- **Reading Time**: Estimated minutes to read (250 words/min)

### ✅ UX Features
- **Loading Skeleton**: While fetching chapter data
- **Unsaved Changes Warning**: Prevents accidental data loss
- **Sticky Header**: Actions always visible
- **Error Handling**: Displays save errors

## Actions

### Save Draft
- Saves current changes without publishing
- Disabled when no changes
- Updates word count
- Button: "Save Draft"

### Publish
- Saves and publishes chapter
- Sets `is_published = true`
- Sets `published_at` timestamp
- Button: "Publish" (green)

### Unpublish
- Saves and unpublishes chapter
- Sets `is_published = false`
- Button: "Unpublish" (yellow)

### Back to Novel
- Returns to chapter list
- Warns if unsaved changes

## Usage

### Navigate to Editor
1. From chapters list: Click chapter row
2. Or: Click "Edit" button in Actions column
3. Route: `/admin/chapters/[id]`

### Edit Chapter
1. Modify title or content
2. See live preview on right
3. Word count updates automatically
4. Unsaved indicator appears in header

### Save Changes
1. Click "Save Draft" to save without publishing
2. Or click "Publish" to save and publish
3. Wait for save to complete
4. Unsaved indicator disappears

### Plain Text Formatting

**Paragraphs**: Separate with blank lines
```
First paragraph here.

Second paragraph here.
```

**Line Breaks**: Single newline preserved
```
First line
Second line (line break preserved)
Third line
```

**No Special Syntax**: Just write plain text
- No bold/italic markers
- No headings syntax
- No blockquotes
- Just natural text

## Preview Rendering

The preview converts plain text to HTML:
1. **Double newlines** (`\n\n`) create new paragraphs
2. **Single newlines** (`\n`) create line breaks within paragraphs
3. Text is displayed with readable typography
4. Similar to the public reading view

## Keyboard Shortcuts

- `Ctrl+S` / `Cmd+S`: _(Future)_ Quick save
- `Tab`: Insert tab in textarea
- Standard text editing shortcuts work

## Technical Details

### Data Flow
1. Fetch chapter from Supabase on mount
2. Load form state from chapter data
3. Track changes with useEffect
4. Save updates to Supabase on action
5. Update local state after save

### Scroll Sync
- Basic implementation
- Editor scroll triggers preview scroll
- Percentage-based sync
- Works best with similar content heights

### Word Count
- Splits content by whitespace
- Filters empty strings
- Real-time calculation
- Displayed in header and form

### Character Count
- Counts all characters
- Excludes whitespace (spaces, tabs, newlines)
- Useful for length requirements

### Reading Time
- Based on average reading speed (250 words/minute)
- Rounded up to nearest minute
- Helps gauge chapter length

## Limitations

### ❌ Not Supported
- Markdown syntax (headings, bold, italic, etc.)
- HTML tags
- Rich text formatting
- Image embedding
- Links
- Lists
- Code blocks
- Blockquotes

### ❌ Not Implemented
- Auto-save (must click save)
- Undo/redo beyond browser default
- Version history
- Custom keyboard shortcuts
- Spell check (use browser's built-in)
- Find/replace

### 🚧 Future Enhancements
- Auto-save every 30 seconds
- Keyboard shortcuts (Ctrl+S)
- Full-screen editor mode
- Better scroll sync
- Chapter templates
- Find and replace
- Character name reference
- Timeline/plot notes

## Troubleshooting

### Preview not updating
**Issue**: Preview doesn't reflect changes

**Fix**: Check console for errors. Preview should update automatically on typing.

### Paragraph spacing looks wrong
**Issue**: Paragraphs not separating properly

**Fix**: Ensure you have a blank line (double newline) between paragraphs:
```
Paragraph 1.

Paragraph 2.
```

Not:
```
Paragraph 1.
Paragraph 2.
```

### Scroll sync not working
**Issue**: Preview doesn't follow editor scroll

**Fix**: This is basic sync - works best when both panels have similar heights. Toggle preview off/on to reset.

### Unsaved changes warning persists
**Issue**: Warning shows after saving

**Fix**: Refresh page. State should sync after successful save.

### Can't save chapter
**Issue**: Save button disabled or errors

**Fix**: 
- Check network connection
- Verify authentication (re-login if needed)
- Check browser console for errors
- Ensure chapter ID is valid

## Example Chapter

```
Chương 1: Khởi Đầu

Mặt trời dần nhô lên trên đường chân trời, ánh sáng ban mai rọi xuống thung lũng xa xa.

Nhân vật chính đứng ở mép vực, nhìn ra con đường phía trước với đôi mắt đầy quyết tâm.

"Hành trình vạn dặm bắt đầu từ một bước chân." Lời cổ ngữ vang lên trong tâm trí.

Và rồi cuộc phiêu lưu bắt đầu...
```

**Renders as:**

---

Chương 1: Khởi Đầu

Mặt trời dần nhô lên trên đường chân trời, ánh sáng ban mai rọi xuống thung lũng xa xa.

Nhân vật chính đứng ở mép vực, nhìn ra con đường phía trước với đôi mắt đầy quyết tâm.

"Hành trình vạn dặm bắt đầu từ một bước chân." Lời cổ ngữ vang lên trong tâm trí.

Và rồi cuộc phiêu lưu bắt đầu...

---

---

**Route**: `/admin/chapters/[id]`  
**Component**: `app/admin/chapters/[id]/page.tsx`  
**Format**: Plain text only (no markdown)  
**Preview**: Auto-converts `\n\n` → paragraphs, `\n` → line breaks
