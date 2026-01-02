# Admin CMS Feature Status

Date: 2026-01-01

This document summarizes implemented features in the Admin CMS and items still pending.

## Implemented Features

- Soft-delete (admin & publish protections)
  - Implemented soft-delete semantics using `deleted_at TIMESTAMP NULL`.
  - Admin list queries for novels and chapters now explicitly filter `deleted_at IS NULL` to hide deleted records by default.
  - Publish toggle actions now reject attempts to publish/unpublish deleted novels or chapters.
  - Creating chapters for a deleted novel is prevented.
  - Files changed:
    - `src/app/admin/novels/page.tsx` (filter novels by `deleted_at IS NULL`)
    - `src/app/admin/novels/[id]/chapters/page.tsx` (filter chapters by `deleted_at IS NULL`)
    - `src/app/admin/novels/actions.ts` (reject publish changes for deleted novels)
    - `src/app/admin/novels/[id]/chapters/actions.ts` (reject publish changes for deleted chapters / prevent creating chapters for deleted novels)


- Chapter editor (plain text)
  - Editor uses Arial font for proper Vietnamese rendering and line-height tuned for readability.
  - File: `src/app/admin/chapters/[id]/page.tsx`

- Novel creation
  - Server Action: `createNovel` with duplicate detection.
  - Admin page with original UI and slug field (auto-generate option).
  - Files: `src/app/admin/novels/new/page.tsx`, server action in `src/app/admin/novels/actions.ts`

- Novel form (create/edit)
  - Fetches real authors/genres from Supabase, supports edit mode.
  - File: `src/components/admin/novel-form.tsx`

- Chapter creation
  - Server Action: `createChapter` with auto-increment chapter_number, duplicate content detection, triggers integration.
  - Admin pages for chapter creation: `src/app/admin/novels/[id]/chapters/create/page.tsx` and `.../new/page.tsx` (routes present).
  - Server action: `src/app/admin/novels/[id]/chapters/actions.ts`

- Novel publish toggle (Admin Novels list)
  - Server Action: `toggleNovelPublish` (sets `published_at` / clears it) and revalidates paths.
  - Admin UI: toggle switch in `src/app/admin/novels/page.tsx` with optimistic update and disabled state while updating.
  - Toast state helper implemented (needs UI rendering in some places).

- Chapter publish toggle (Admin Chapter list)
  - Server Action: `togglePublishChapter` implemented in `src/app/admin/novels/[id]/chapters/actions.ts` (sets `published_at = NOW()` when publishing, `NULL` when unpublishing). Revalidates `/truyen/[novel-slug]` and `/truyen/[novel-slug]/chuong-[chapterNumber]` and admin listing.
  - Admin UI: per-row publish toggle added to `src/app/admin/novels/[id]/chapters/page.tsx` with optimistic update and disabled state while pending, and published date tooltip on hover.

## Partially Implemented / Enhancements

- Toast notifications for chapter publish actions
  - Toast state exists in some pages, but consistent toast UI for chapter publish success/error is not yet rendered.
  - File placeholders: toast logic present in `src/app/admin/novels/page.tsx` and can be reused.

- Confirmation before unpublish (novel/chapter)
  - Novel list unpublish confirmation implemented for novels; chapter unpublish confirmation not yet added.

## Pending Features / Not Implemented

- Update chapter server action
  - Interfaces for update exist in `src/app/admin/novels/[id]/chapters/actions.ts` but full update flow (and tests) need finalization.

- Delete novel / delete chapter actions
  - Delete actions and corresponding UI (with confirmation and cascade handling) are not yet implemented.

- Batch operations
  - Bulk publish/unpublish, batch deletes, and mass edits are not implemented.

- Tests
  - Unit/integration tests for server actions (`createNovel`, `createChapter`, `togglePublishChapter`, `toggleNovelPublish`) and client optimistic UI flows are not present.

- Accessibility polish
  - ARIA labels and keyboard interactions for toggle switches should be reviewed and improved.

## Key Files (summary)

- Server actions
  - `src/app/admin/novels/actions.ts` (createNovel, toggleNovelPublish)
  - `src/app/admin/novels/[id]/chapters/actions.ts` (createChapter, togglePublishChapter)

- Admin pages
  - `src/app/admin/novels/page.tsx` (novels list with publish toggle)
  - `src/app/admin/novels/new/page.tsx` (create novel)
  - `src/app/admin/novels/[id]/page.tsx` (edit novel)
  - `src/app/admin/novels/[id]/chapters/page.tsx` (chapters list with publish toggles)
  - `src/app/admin/novels/[id]/chapters/new/page.tsx` (chapter create form)
  - `src/app/admin/novels/[id]/chapters/create/page.tsx` (alternate create route)

- Components
  - `src/components/admin/novel-form.tsx` (novel create/edit form)
  - `src/components/chapters/chapter-list.tsx` (public chapter list component)

## Recommended Next Steps

1. Add a unified toast UI component and wire it in the chapters list and novels list to show publish success/errors.
2. Add confirmation dialog before unpublishing a chapter (mirror novel unpublish flow).
3. Implement updateChapter server action and corresponding edit UI if missing.
4. Add tests for server actions and optimistic UI flows.
5. Review accessibility for toggles (ARIA attributes, keyboard support).


If you'd like, I can (pick one):
- implement the toast UI now, or
- add confirmation before unpublish for chapters now, or
- scaffold tests for the toggle actions.


---
Generated automatically on 2026-01-01 by the assistant.
