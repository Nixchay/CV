# Nischaya Adhikari — Creative Studio

The complete static website is in `dist/`. The current local preview is http://127.0.0.1:8765/ .

Features include a real Three.js creative studio with scroll-driven camera movement, sculpture animation, motion artwork, and a project hotspot; a gallery of 13 existing video and interactive links; and both original CV pages with paging, enlargement, and an unchanged PDF download.

The updated design uses a full-screen studio with six camera chapters, a larger brass sculpture and orbiting rings, close-up and overhead perspectives, architectural shadows, and direct chapter controls. A second dark 3D motion study below the portfolio contains a twisting gold ribbon, orbiting forms, and a camera that changes with scrolling. Both scenes stop rendering when offscreen or the browser is hidden. Visitors can explicitly enable the tour when their device requests reduced motion; that choice is remembered locally.

Desktop and mobile layouts support keyboard use, reduced-motion preferences with an explicit “3D tour” option, and a static fallback when WebGL is unavailable.

## Run locally

Serve the website with an HTTP server. Opening the HTML directly as a local file will not load module imports or gallery data.

With Python installed, run this command inside the extracted website folder:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then open http://127.0.0.1:8765/ . In the source directory here, use `--directory dist`.

## Content

Edit project links and posters in `assets/projects.json` (`dist/assets/projects.json` in the source). Existing Google Drive permissions still control video access. The site uses actual existing thumbnails and linked media. Some videos have generic original filenames that can be replaced with supplied project titles.

## Verification

JavaScript syntax and local references passed checks. Browser inspection verified the rendered 3D scene, camera movement on scrolling, gallery filters, project dialogs, a video playing to completion, and both CV pages. The served PDF is byte-identical to the supplied original. Updated checks verified the studio camera changing from the entrance to the sculpture perspective and motion workspace, the second scene changing camera and sculpture composition with scrolling, and the expanded navigation tool accepting the motion-study section and rejecting an invalid section. Both updated 3D scenes were inspected at 390 × 844 without horizontal overflow.

## Publication

A private Site was registered and its identity retained in `.openai/hosting.json`. Publication was blocked when automatic approval review rejected the required publishing-helper input. No credentials were written to files. Reuse the registered Site for future publication; do not register a replacement.

Three.js 0.180.0, DM Sans, and Italiana are served locally. Studio geometry and materials are procedural; the generated mockup is not used as a fake 3D background.
