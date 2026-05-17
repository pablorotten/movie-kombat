# Promo Assets

This folder contains promotional material for the Movie Kombat project.

## What’s included in git

- `linkedin-video.md` — notes and copy for the LinkedIn promo video.
- `MovieKombat v3.mp4` — final exported version of the promo video.

## What’s excluded from git

- `Media/` — raw CapCut assets, source footage, and temporary files used to build the video.

These files are excluded intentionally because they are large and only relevant to editing the promo, not to the repository source.

## Design sources

Design files and Affinity projects are kept in the `design/` folder, which is the recommended place for project-related source art.

## Why this makes sense

- Raw video assets can bloat git history and are usually not needed for source control.
- Keeping the final exported video in the repo is fine for small promo artifacts, especially when it is directly associated with the project.
- Design sources in `design/` make it easy to locate the original creative assets.

If you later want to share the raw CapCut assets, consider using a separate cloud storage link rather than adding them to the repo.