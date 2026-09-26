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

## Next Steps
- Commit, push, open PR
