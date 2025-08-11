# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static web application that displays an interactive SVG collage. The project creates a dynamic experience where SVG layers become interactive on hover/focus with smooth animations and visual effects.

## Architecture

The application consists of:

- **index.html** - Entry point that loads fonts and the main app
- **script.js** - Main application logic that:
  - Fetches and inlines SVG from `assets/collage.svg`  
  - Identifies hoverable layers using heuristics (images, groups with data attributes, elements with bitmap fills)
  - Adds interactive behavior and accessibility attributes
  - Injects CSS animations directly into the SVG
- **styles.css** - Global styles and CSS custom properties for animations
- **assets/collage.svg** - Figma-exported SVG with multiple layered bitmap patterns

## Key Technical Details

### SVG Layer Detection
The app automatically identifies interactive layers by looking for:
- `<image>` elements
- `<g>` elements with `data-name` or `id` attributes
- Elements with bitmap pattern fills (`fill^="url("`)
- Excludes background/frame/canvas elements by name

### Animation System
Uses CSS custom properties for consistent hover effects:
- `--hover-scale: 1.06` - Scale factor on hover
- `--hover-translate: 2px` - Translation distance
- `--duration: 160ms` - Animation duration
- `--easing: cubic-bezier(0.2, 0.8, 0.2, 1)` - Easing function

### Figma Export Process
To update the collage:
1. Select the collage frame in Figma
2. Export as SVG with "include id attribute" enabled
3. Save as `assets/collage.svg`

## Development

This is a vanilla JavaScript project with no build step. Files can be served directly from any static web server.

For local development, serve the files with:
```bash
python -m http.server 8000
# or
npx serve .
```

The application loads the SVG via `<object>` element to preserve pattern definitions and cross-references while maintaining DOM access for interactivity.