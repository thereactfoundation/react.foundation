# design/foundation-system-compliance

Audit against `docs/foundation/design-principles.md`, public surfaces only.

## Completed
- [x] Footer redesign + tokens (b15fe3c), e2e locator scoping (4d1a757)
- [x] Radius: raw `rounded-*` → `field`/`card`/`panel`/`control` (mobile menu, RFC popover, sort dropdown, add-community form, communities skeleton, Summit)
- [x] RFDS semantic components: button → `control`, card/alert → `card`, input → `field`, elevated card → `shadow-card`
- [x] Elevation: `shadow-lg`/`shadow-md` → `shadow-card`/`shadow-soft`
- [x] Color: privacy/terms `text-foreground/70|80` → `text-muted-foreground`; Summit `bg-muted/35` → `bg-surface-subtle`; mobile admin link `text-purple-300` → tokens; GitHub sign-in hex → ink tokens
- [x] Gradients: mobile avatar fallback gradient → `bg-primary`
- [x] Labels: hand-rolled teal/mono labels → `<Eyebrow>` / `.foundation-eyebrow`
- [x] Intro ratio unified to `0.8fr / 1.2fr`
- [x] Heading weight ≤ 600 (privacy, terms, add-community)
- [x] `globals.test.ts` updated to current radius scale

## Kept on purpose
- Glass overlays with `backdrop-blur` (header, Summit sticky nav + hero chips, map legend, mobile scrim)
- Inverted CTA band `text-background/70` (home-sections)
- Status tints `bg-success/10`, `bg-destructive/10`
- Action links (“View profile →”) stay `text-sm font-semibold text-primary`
- Button hover opacity (`hover:bg-primary/88`) — system button pattern
- `store/opengraph-image.tsx` hex — OG image renderer has no CSS tokens

## Removed
- [x] 12 unused `src/components/home/` components + `communities/VerificationBadge.tsx` (only RFDS re-exports, never rendered); hidden pages kept

## Pre-existing failures (not from this branch's edits)
- Storybook: Layouts Header, Header And Footer, RFDS All Components — no `ThemeProvider` decorator in `.storybook/preview.ts`
- `npm run lint`: 62 errors in untouched files (scripts/, stories/, src/*)

## Designer feedback pass (Nico, 2026-09-28)
- [x] Hero glow is full-bleed (was clipped to the content box on wide screens)
- [x] Two widths only: `standard` spine + `narrow` prose cap inside it; removed `wide`/`reading` and ad-hoc `max-w-*` containers
- [x] One rhythm: `Section spacing` = intro · section · attached; removed page-level padding from ~50 sections; shell owns the gap before the footer
- [x] Three section compositions (`SectionHeader` + `FeatureGrid` / cards / narrow prose) + `SummaryPanel` + `CtaBand`; retired the sidebar-heading + ruled-list layout
- [x] Removed decorative rules/bands between sections and inside lists
- [x] Page intros left-aligned on the spine (Home hero is the only centered moment)
- [x] Summit rebuilt on the shared primitives (dropped orbital graphic, gray bands, max-w-7xl frame, bespoke cards, summit.module.css)
- [x] Docs updated: design-principles.md (#5, #9, checklist), public-website-design-system.md (composition)

## Next Steps
- Ask Nico to review the preview
