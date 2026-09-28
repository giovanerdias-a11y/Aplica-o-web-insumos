---
name: Nexora Enterprise Operations
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#454652'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#757684'
  outline-variant: '#c5c5d4'
  surface-tint: '#4356b7'
  primary: '#001464'
  on-primary: '#ffffff'
  primary-container: '#10288c'
  on-primary-container: '#8496fc'
  inverse-primary: '#bac3ff'
  secondary: '#7740bc'
  on-secondary: '#ffffff'
  secondary-container: '#b780ff'
  on-secondary-container: '#49008c'
  tertiary: '#47001c'
  on-tertiary: '#ffffff'
  tertiary-container: '#6e002f'
  on-tertiary-container: '#ff6b95'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee0ff'
  primary-fixed-dim: '#bac3ff'
  on-primary-fixed: '#00115a'
  on-primary-fixed-variant: '#283d9e'
  secondary-fixed: '#eedcff'
  secondary-fixed-dim: '#d8b9ff'
  on-secondary-fixed: '#290054'
  on-secondary-fixed-variant: '#5e23a3'
  tertiary-fixed: '#ffd9df'
  tertiary-fixed-dim: '#ffb1c2'
  on-tertiary-fixed: '#3f0018'
  on-tertiary-fixed-variant: '#8f003f'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system serves Nexora Tecnologia e Soluções as an internal enterprise requisition, asset tracking, and IT inventory management platform. It balances high-velocity corporate utility with a distinct, tech-forward character inspired by Nexora's geometric identity.

The visual style blends **Corporate Modernism** with **Precision Data Design**:
- Crisp structured interfaces engineered to handle complex data density (tables, inventory metrics, status lifecycles).
- High visual ergonomics avoiding operator fatigue during long operational shifts.
- Distinct color accents (Navy, Deep Violet, and Vivid Pink) applied purposefully to guide attention, signal urgency, and delineate critical actions without visual clutter.

## Colors

The palette is derived directly from corporate brand specifications and tailored for enterprise data contrast:

- **Primary (`#10288C`)**: Deep Navy anchors top navigation, primary action buttons, focused headers, and authoritative interactive states.
- **Secondary (`#4B0090`)**: Rich Deep Purple provides distinct hierarchy for secondary key flows, active requisition workflows, and high-level inventory categorization.
- **Tertiary / Accent (`#FF4885`)**: Vivid Pink functions as a high-impact indicator for critical action triggers, live notifications, and key interactive highlights.
- **Supporting Tints**:
  - `Soft Blue Tint` (`#CBE2FE`): Selected row backgrounds, info chips, calm interactive hover fills.
  - `Delicate Pink Tint` (`#FFE8F0`): Subtle container fills for critical badges, urgent requisition alerts, and tertiary interactive hover surfaces.
- **Surfaces & Neutrals**:
  - App Canvas: `#F8FAFC`
  - Card/Modal Surface: `#FFFFFF`
  - Subdued Borders: `#E2E8F0`
  - Secondary Text / Meta: `#64748B`
  - High-Contrast Body Text: `#0F172A`
- **Functional Semantics**:
  - Success (Fulfilled / In Stock): `#10B981` on `#ECFDF5`
  - Warning (Low Stock / Under Review): `#F59E0B` on `#FFFBEB`
  - Danger (Out of Stock / Critical SLA): `#EF4444` on `#FEF2F2`

## Typography

The type system pairs **Plus Jakarta Sans** for structural headers and numerical KPI callouts with **Inter** for data tables, form controls, and functional UI metadata.

- Plus Jakarta Sans introduces geometric authority and modern tech optimism to operational dashboards.
- Inter ensures maximum tabular legibility, vertical rhythm, and clarity across dense technical listings (SKUs, serials, IP addresses, dates).
- Monospaced digits (`font-feature-settings: 'tnum' 1`) must be enforced for stock counts, budget values, and tracking codes.

## Layout & Spacing

A 12-column fluid grid system governs wide-screen desktop dashboards, shifting to a 4-column single-stack layout on mobile terminals.

- **Breakpoints**: Mobile (`< 768px`), Tablet (`768px - 1024px`), Desktop (`> 1024px`).
- **Sidebar & Top Bar**: A fixed 260px desktop collapsible left-nav with a sticky 64px operational top bar.
- **Rhythm**: Internal spacing adheres strictly to an 8pt base grid (`0.5rem`, `1rem`, `1.5rem`). Compact spacing is favored in inventory tables (`0.5rem` vertical cell padding) to maintain information density without sacrificing touch and click target standards (minimum 40px interactive target area).

## Elevation & Depth

Visual hierarchy uses crisp **Low-Contrast Outlines** combined with **Subtle Tonal Layers** and targeted, cool-tinted ambient shadows:

- **Flat/Ground Layer**: Background canvas sits at `#F8FAFC`.
- **Raised Layer (Cards, Table Containers)**: Solid `#FFFFFF` enclosed by a 1px border in `#E2E8F0` with a subtle diffused shadow: `0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.02)`.
- **Floating Layer (Dropdowns, Popovers, Flyout Drawers)**: `#FFFFFF` surface with border `#E2E8F0` and elevated shadow: `0 10px 15px -3px rgba(16, 40, 140, 0.06), 0 4px 6px -4px rgba(16, 40, 140, 0.04)`.
- **Active / Dragging State**: Outlined with `2px solid #10288C` and illuminated with a subtle navy halo blur (`box-shadow: 0 0 0 4px rgba(16, 40, 140, 0.12)`).

## Shapes

The interface embraces a disciplined **Soft (`0.25rem` / `4px`)** curvature for core UI elements to project an engineered, reliable enterprise posture.

- Standard buttons, form inputs, table containers, and card wrappers utilize `4px` (`rounded-sm`).
- High-level metric panels, contextual modals, and slide-in drawers use `8px` (`rounded-lg`).
- Status tags, inventory pills, and alert badges use full pill roundedness (`9999px`) to create clear differentiation between data labels and actionable rectangular buttons.

## Components

### Buttons
- **Primary**: Solid Navy (`#10288C`), text `#FFFFFF`. Hover: `#0C1E68`. Active focus ring: `3px solid #CBE2FE`.
- **Secondary**: Solid Deep Purple (`#4B0090`), text `#FFFFFF`. Hover: `#3A0070`.
- **Accent (Urgent Requisition / Dispatch)**: Solid Magenta (`#FF4885`), text `#FFFFFF`. Hover: `#E03670`.
- **Outline / Ghost**: 1px border `#E2E8F0`, background transparent, text `#0F172A`. Hover: background `#F8FAFC`.

### Form Inputs & Selects
- 1px border `#CBD5E1`, background `#FFFFFF`, text `#0F172A`, placeholder `#94A3B8`.
- Height: 40px with `space-sm` (`0.5rem`) horizontal padding.
- **Focus State**: Border `#10288C`, outline `3px solid #CBE2FE`, zero border jump.
- **Error State**: Border `#EF4444`, outline `3px solid #FEF2F2`.

### Status Badges & Chips
- **Low Stock Warning**: `#B45309` text on `#FFFBEB` background with `#FDE68A` border.
- **In Stock / Approved**: `#047857` text on `#ECFDF5` background with `#A7F3D0` border.
- **Out of Stock / Critical**: `#B91C1C` text on `#FEF2F2` background with `#FECACA` border.
- **Category / Department**: `#10288C` text on `#CBE2FE` background with `#93C5FD` border.

### Inventory Tables
- Header: `#F8FAFC` background, uppercase `label-xs` typography, `#64748B` color, bottom border `1px solid #E2E8F0`.
- Rows: Alternating hover state with `#F8FAFC`, active selection state with `#EFF6FF` and left indicator bar `3px solid #10288C`.
- Cells: Dense padding (`10px 16px`), vertical alignment centered.

### Cards & KPI Tiles
- White canvas (`#FFFFFF`), `1px solid #E2E8F0`, `space-lg` padding.
- Header incorporates numerical tracking typography paired with category badge and micro-sparkline or inventory trend indicator.