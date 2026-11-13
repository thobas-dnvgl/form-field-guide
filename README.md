# Form control fieldguide

A designer-facing, interactive first draft of a form-control taxonomy. Built with
React, Tailwind CSS, Headless UI, dnd-kit, and Mermaid. All dependencies are installed
locally; the running page does not depend on third-party CDNs.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4317. For the production bundle, run `npm run build`, then
`npm run preview`. Run model tests with `npm test`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds, and
publishes `dist` to GitHub Pages. Vite uses a relative `base` so the bundle works
under the repository subpath.

## Included

- Eight interactive value-control examples, with committed object values, plus a
  contrasting File action menu (Save, Print, Options, Exit). Its actions only
  update demo feedback; they do not hold a form value or perform real commands.
- Common use cases on every explorer card, also included in pattern search.
  These distinguish predefined choices, free-form entries, and explicit creation.
  They are illustrative; domain-specific behavior such as email validation is
  not implemented by the label-based demos.
- A Mermaid decision tree fitted by default, with zoom controls, downloadable
  `.mmd` source, and a screen-reader text outline.
- A comparative taxonomy of eight families/compositions and design modifiers.
- Select and multi-select can optionally filter options in a separate popover
  search field, disabled by default; comboboxes search in the value field.
- The guide distinguishes value controls from action menus and treats a popover
  as a container; “dropdown” alone does not describe the interaction.
- The decision tree distinguishes editable text with optional autocomplete
  completions from selecting or explicitly creating an option.
- Custom entry validation and drag-and-drop
  reordering for mouse and touch. Tags can also be reordered with the keyboard:
  focus the tag, press Space or Enter, use the arrow keys, then press Space or
  Enter to drop. Escape cancels. Removal remains a separate button.
- Concise React examples and implementation references.

Headless UI supplies accessible menu, listbox, and combobox primitives.
Radio and checkbox groups use native inputs. The local pills/token input is
an illustrative composition, not a production-ready library component.

All examples use local fixtures. Filtering preserves values; reloading or switching
guide sections resets examples. New labels create
form-local objects; they do not persist a shared entity. Remote fetching,
hierarchical selection, and full production-level accessibility auditing are
outside this first iteration. Loading, error, empty, and mobile behavior remain
required design considerations, described in the taxonomy.

`src/model.js` contains the taxonomy, data fixtures, Mermaid source, and helpers.
`src/main.jsx` contains the interactive React examples and page composition.
`src/styles.css` contains Tailwind and the visual theme.

## Visual theme

The guide uses its own blue/navy/cyan theme inspired by the VUI Next design
language, with square surfaces and controls (radios remain circular). Shared
tokens in `src/styles.css` also style the Mermaid diagram and interaction states.
It does not import VUI components or branding.

Gantari Variable is self-hosted through `@fontsource-variable/gantari`, sourced
from Google Fonts and licensed under the SIL Open Font License 1.1. The copyright
notice and license in `public/gantari-OFL.txt` accompany the built font assets.
Font assets are bundled locally; no external font request is needed.
