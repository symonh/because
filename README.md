# ArgumentBase

A standalone argument-map editor. It reads and writes the MindMup `.mup` format
natively and renders argument maps in the argument-visualization style used in
critical-thinking teaching: a claim at the top, supporting (green) and opposing
(red) reason groups joined by brackets, co-premises sharing a bracket, implicit
premises drawn with a dotted blue border, and numbered badges.

It exists so that the teaching community that built courses on MindMup's
argument-visualization mode — after free access to it ended in 2026 — has a free,
education-first tool that opens their existing `.mup` files and keeps working.

## Status

Early. This is a working editor for viewing and editing argument maps. See
`STATUS.md` for what works, what is partial, and what is not done yet.

## Design goals

- **Opens existing work.** Your `.mup` files are ordinary JSON in your own
  storage; this app loads them directly, with no account and no server.
- **No build, no dependencies, no network.** The whole app is `index.html` +
  `app.js`. Open the file and it runs.
- **Free and education-first.** Non-commercial; it does not use the MindMup name
  or brand, and builds only on the MIT-licensed argument-mapping engine lineage.

## Run it

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
# then visit http://localhost:8000/
```

Open a `.mup` file with **Open**, or drag one onto the window. Press **New** to
start from a blank claim.

## Keyboard

- **Enter** — add a supporting reason to the selected box
- **Tab** — add a co-premise beside the selected premise
- **F2 / double-click** — edit text
- **Delete** — remove the selected box
- **Cmd/Ctrl-Z** — undo (Shift to redo)

## License

MIT (see `LICENSE`). The rendering engine derives from the MIT-licensed
`mindmup/mapjs` argument-mapping lineage.
