# Bitig Usage Guide

Bitig has grown into a large toolbox — 45+ commands across 6 subsystems (compiling, diagnostics, AI context packaging, story bible, quality review, publishing). That's a lot to land on at once. This guide is **task-oriented**: find the scenario closest to yours below and follow the steps. It complements, rather than replaces, the exhaustive flag-by-flag [Command Reference](README.md#command-reference) and [book.json reference](README.md#book-configuration-reference-bookjson) in the README.

---

## 0. The Mental Model (read this first)

Five ideas explain almost everything else in this tool:

1. **Coordinates.** Every chapter lives at `assets/section-<N>/<N>.<M>.md` and is addressed everywhere as `N.M` (e.g. `1.3`). Section `998` is the epilogue, `999` is the bibliography — reserved, always sorted last.
2. **One config file.** `book.json` controls both structure (title, sections, citations) and style (theme, custom CSS, publishing profile). Nearly every command reads it.
3. **`dist/` is disposable.** `bitig build` regenerates `book.md`, `book.html`, `book.pdf`/`book.epub`, and `book-metadata.json` from your `assets/` source. Never hand-edit `dist/`.
4. **The Facilitator Pattern.** Bitig **never calls an LLM itself**. Every "AI" command follows the same shape: a `*:context` command packages material into a prompt → _you or an external agent_ do the thinking → a `*:report` command (or a direct file edit) records the verdict. This repeats across four subsystems: quality scoring (`analyze:*`), editorial review (`review:*`), and — indirectly — the context pack itself (`context` + `learn`).
5. **Everything past `init`/`build` is optional, layered tooling.** A project with nothing but markdown files under `assets/` compiles fine. Story bible, memory, diagnostics, review, and pipeline are all opt-in — add them when you feel the pain they solve.

---

## 1. Quick Start

```bash
bitig init      # scaffolds book.json + assets/ with a sample section and chapter
bitig build     # compiles dist/book.md, book.html, book.pdf, book-metadata.json
```

Open `dist/book.html` or `dist/book.pdf`. That's a complete, working book. Everything below is optional depth.

---

## 2. Choose Your Path

| Your situation                                                         | Go to                                                      |
| ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| Writing solo, no AI agent involved                                     | [Path A](#path-a-solo-human-author)                        |
| Drafting chapters together with an AI coding agent (Claude Code, etc.) | [Path B](#path-b-ai-assisted-writing-the-facilitator-loop) |
| Writing fiction/a novel and need character & timeline consistency      | [Path C](#path-c-fiction--story-bible)                     |
| Want quality control before calling a chapter "done"                   | [Path D](#path-d-quality-control)                          |
| Ready to publish to Kindle or print                                    | [Path E](#path-e-publishing)                               |

You can combine paths freely — they share the same `assets/` files and `book.json`.

---

## Path A: Solo Human Author

1. `bitig init` — scaffold the project.
2. Write markdown directly in `assets/section-X/X.Y.md`.
3. Restructure as needed: `bitig add:section`, `add:chapter`, `move:chapter`, `delete:chapter`.
4. `bitig stats` — word counts and structure at a glance.
5. `bitig check` — catches unclosed code blocks, broken internal links, unused citation terms.
6. `bitig search "<term>"` — check how a term/name is used across the whole manuscript.
7. `bitig dev` — live-reloading local preview at `http://localhost:3000`.
8. `bitig build` — compile final Markdown/HTML/PDF/EPUB.

---

## Path B: AI-Assisted Writing (The Facilitator Loop)

Bitig packages everything an agent needs into one prompt; the agent writes; you feed results back so the _next_ chapter's context is even better.

1. **`bitig context <coords>`** — pull the full prompt pack: book metadata, chapter outlines/synopses, the preceding chapter's full text, memory/feedback history, and (if present) the story bible.
2. **Draft/edit** the chapter markdown file directly.
3. **`bitig capture --coords <coords>`** — screenshot the rendered chapter to visually sanity-check layout.
4. **`bitig analyze:context <coords>`** → agent scores it against `quality-guidelines.json` → **`bitig analyze:report <coords> --file <result.json>`** logs a scored diagnostic.
5. **`bitig learn <coords> --feedback "..."`** — record corrections so future context packs include them automatically.
6. **`bitig update:metadata <coords> --synopsis "..."`** — keep the book-wide outline accurate for later chapters.
7. If using the story bible: **`bitig add:event ...`** / **`update:character ...`** to record what just happened, then `bitig check` to verify nothing broke.

**Shortcut:** add `--task <mode>` to `context` to get task-specific instructions instead of the generic ones — `continue`, `rewrite`, `summarize`, `expand`, `dialogue`, or `style-transform` (with `--style-target "noir"` etc.). See [README §6](README.md#6-ai-agent-context-packaging).

For a fully scripted, multi-role version of this loop (Continuity/Style/Proofreader/Fact-Checker/Final-Editor agents run in sequence), see [Path D → Orchestrating everything](#orchestrating-everything-the-pipeline).

---

## Path C: Fiction & Story Bible

Three optional JSON files under `assets/` — `characters.json`, `plot.json`, `world.json` — give writing agents a ground truth to stay consistent against. Projects without them behave exactly as before.

1. `bitig init --fiction` (new project) or `bitig story:init` (existing project).
2. Populate as you write:
   ```bash
   bitig add:character aylin --name "Aylin Demir" --role protagonist
   bitig add:event ev-1 --title "The crash" --coords 1.2 --characters aylin
   bitig add:world place haydarpasa --name "Haydarpaşa Station"
   ```
3. `bitig context <coords>` now auto-injects a relevance-filtered **STORY BIBLE** block (character cards, timeline neighborhood, open threads, world rules) — no extra step needed.
4. `bitig check` validates the story data itself: dangling id references, timeline contradictions, characters acting before they're born, non-reciprocal relationships, unused entries.
5. `bitig story:guide` — full JSON schemas and the recommended agent update loop.

---

## Path D: Quality Control

Three independent tools, cheapest to most expensive:

- **Local & free** (no AI, instant): `bitig check` (mechanical linting), `bitig check --story-names` (heuristic name scan), `bitig analyze:prose <coords>` (repeated words, sentence stats, dialogue ratio, approximate readability).
- **AI-scored rubric**: `bitig analyze:init` → `analyze:context <coords>` → agent scores it → `analyze:report <coords> --file <result.json>` prints a weighted ASCII score table.
- **AI editorial review**: `bitig review:context <coords> --type continuity|style|plotholes` → agent produces findings → `bitig review:report <coords> --type <type> --file <findings.json> [--learn]`. Continuity checks against the story bible; style checks against recorded memory + prose metrics; plotholes hunts for unresolved setups (Chekhov's guns) and dead threads, book-wide with `all`.

### Orchestrating everything: the pipeline

`bitig pipeline:init` writes an editable six-role checklist (Chapter Review → Continuity → Style → Proofreader → Fact-Checker → Final Editor) over the tools above. Per chapter:

```bash
bitig pipeline:next 1.2      # prints the next incomplete role + its exact commands
# ... run those commands, feed an agent, save its output ...
bitig pipeline:status 1.2    # ✔/⬜ checklist for this chapter
bitig pipeline:status        # progress table across the whole book (e.g. 4/6)
```

A role counts as done once its report file exists under `diagnostics/`; delete that file to re-run it. See `bitig pipeline:guide`.

---

## Path E: Publishing

```bash
bitig build --profile kindle   # EPUB only + automatic structural pre-flight (errors fail the build)
bitig build --profile print    # PDF with a KDP 6"x9" trim, mirrored margins + binding gutter
bitig check:epub               # run the EPUB pre-flight standalone, any time
```

`--profile` can also be set permanently as `"profile"` in `book.json`. Explicit `--pdf`/`--epub`/`--no-pdf`/`--no-epub` flags always override the profile. Note: the pre-flight is a local structural check (mimetype, manifest, spine, nav, cover) — it complements but doesn't replace the official `epubcheck` tool before submitting to a store. For visual design (fonts, page size, custom CSS), see [README §2 Styling & Layout](README.md#2-styling--layout-customization).

---

## 3. Command Cheat Sheet

| Category                     | Commands                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project & structure**      | `init [--fiction]`, `build [--profile kindle\|print]`, `dev`, `add:section`, `add:chapter`, `move:chapter`, `delete:chapter`, `update:metadata` |
| **Inspect & lint**           | `stats [--goals]`, `check [--story-names]`, `check:epub`, `search "<query>"`                                                                    |
| **AI context & memory**      | `context <coords> [--memory][--story][--task][--style-target]`, `learn <scope>`                                                                 |
| **Prose analytics & goals**  | `analyze:prose [<coords>] [--top][--json]`, `goals:set`                                                                                         |
| **Rubric scoring**           | `analyze:init`, `analyze:context`, `analyze:report`                                                                                             |
| **Editorial review**         | `review:context <coords>\|all --type ...`, `review:report`, `review:guide`                                                                      |
| **Pipeline orchestration**   | `pipeline:init`, `pipeline:next`, `pipeline:status`, `pipeline:done`, `pipeline:guide`                                                          |
| **Story bible — characters** | `story:init`, `add:character`, `update:character`, `delete:character`, `list:characters`                                                        |
| **Story bible — plot**       | `add:event`, `update:event`, `delete:event`, `list:events`, `add:thread`, `update:thread`, `delete:thread`, `list:threads`                      |
| **Story bible — world**      | `add:world <category>`, `update:world`, `delete:world`, `list:world`, `story:guide`                                                             |
| **Visual verification**      | `capture [--page][--range][--coords][--selector][--epub-chapter]`                                                                               |
| **In-terminal guides**       | `guide`, `diagnostics-guide`, `story:guide`, `review:guide`, `pipeline:guide`                                                                   |

Run `bitig --help` for the full flag-by-flag listing at any time.

---

## 4. Where to Read More

- **[README.md → Command Reference](README.md#command-reference)** — every command with every flag documented.
- **[README.md → book.json Reference](README.md#book-configuration-reference-bookjson)** — full configuration schema, themes, custom CSS.
- **[roadmap.md](roadmap.md)** — what's shipped, what's planned.
- **In-terminal, for AI agents mid-session:** `bitig guide`, `bitig diagnostics-guide`, `bitig story:guide`, `bitig review:guide`, `bitig pipeline:guide` — each prints its subsystem's full workflow and JSON schemas directly to stdout, so an agent never has to leave the terminal to look something up.
