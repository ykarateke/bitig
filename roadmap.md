# Bitig CLI - Project Roadmap

This document outlines the planned feature roadmap for the **Bitig** book compiler and writing ecosystem. These features aim to expand output formats, enhance visual layout control, improve AI agent collaboration, and provide tools for narrative and content diagnostics.

---

## 🗺️ Feature Roadmap

### [COMPLETED] 1. EPUB Compilation & Visual Testing Support

- **Objective**: Add EPUB as a primary export target format alongside Markdown, HTML, and PDF.
- **Details**:
  - Implement a new compiler target to bundle and export to standard **EPUB 3** format.
  - Ensure all layout customization capabilities (themes, typography, metadata) align between EPUB and PDF.
  - Extend the `bitig capture` layout screenshot testing framework to emulate and verify EPUB viewer dimensions.

### [COMPLETED] 2. Legal & Publishing Metadata Standards

- **Objective**: Integrate industry-standard metadata into the book configuration and output headers.
- **Details**:
  - Support configuration keys in `book.json` for publishing parameters:
    - **`isbn`**: International Standard Book Number.
    - **`publisher`**: Publishing house or entity.
    - **`publishDate`**: Standard date format.
    - **`copyright`**: Rights statement and license (e.g., Creative Commons, All Rights Reserved).
  - Automatically render legal copyright pages and insert metadata tags into HTML header blocks and EPUB packages.

### 3. Asset & Image Management

- **Objective**: Introduce structured support for media files inside the book assets, ensuring reliable local paths and correct rendering across HTML and PDF outputs.
- **Details**:
  - Standardize a media assets directory (e.g., `assets/images/`) within the workspace.
  - Automatically copy, bundle, and resolve image assets during compilation (`bitig build`).
  - Support responsive visual container styles in predefined stylesheets.
  - _Prerequisite for advanced cover layout designs._

### [COMPLETED] 4. Semantic Diagnostics & Quality Scoring Guide

- **Objective**: Introduce a framework to analyze manuscript quality (e.g. style consistency, narrative flow, interdisciplinarity, rationality) using AI evaluations.
- **Details**:
  - Add a scoring guideline schema (`quality-guidelines.json`) where editors can define rubrics and style guides (implemented via `bitig analyze:init`).
  - Implement CLI helper utilities to package evaluations context (`bitig analyze:context`) and report diagnostic evaluations (`bitig analyze:report --file <file>`) back to the CLI.
  - Reports are formatted in a clean zero-dependency ASCII table directly in stdout and logged to local files under `diagnostics/`.

### [COMPLETED] 5. AI Agent Thought Logging & Learning History

- **Objective**: Create a persistent history and memory mechanism for AI writing assistants to log internal rationale, feedback, and key style configurations.
- **Details**:
  - Introduce an agent memory file (`memory.json`) in the book workspace root.
  - Allow writing assistants to programmatically append "lessons learned", user preferences, or characters' tone details.
  - Enrich the `bitig context <coords>` command to automatically inject past notes, feedback history, and context-specific rules into the RAG prompt package.

### [COMPLETED] 6. Fiction & Narrative Planning Tools

- **Objective**: Provide structured database models for managing plot structures and character arcs, targeted at creative writing and novels.
- **Details**:
  - Character profiles (attributes, relationships, arcs, speech styles) live in a structured database file (`assets/characters.json`) managed via `bitig add:character` / `update:character` / `delete:character` / `list:characters`.
  - Plot threads and a chronological event timeline live in `assets/plot.json` (`add:event`, `add:thread`, `list:events`, ...); world building data (places, organizations, species, technologies, rules, lore dictionary) lives in `assets/world.json` (`add:world`, ...).
  - `bitig context <coords>` automatically injects a relevance-filtered STORY BIBLE block (character cards, timeline neighborhood, open threads, world rules) into the RAG prompt package (`--story <layers>` to filter).
  - `bitig check` validates story consistency: dangling id references, unknown chapter coordinates, timeline date/order conflicts, birth/death date contradictions, non-reciprocal relationships, unused entities, and an opt-in unregistered-name scan (`--story-names`).
  - Scaffolding via `bitig story:init` or `bitig init --fiction`; workflow documented in `bitig story:guide`.

### 7. Advanced Cover Design System (Research & Implementation)

- **Objective**: Research and design customizable cover templates and graphics, building on top of the core Asset Management module.
- **Details**:
  - Implement customizable cover designs supporting full-page background images, title alignments, and geometric color blocks.
  - Provide easy configuration overrides in `book.json` to load background graphics and set front cover layouts.

### 8. CSS & Bibliography Validation

- **Objective**: Add static validation checks to ensure all CSS classes used in manuscript files exist in the stylesheet, and all bibliography citations are correctly referenced.
- **Details**:
  - Extend the `bitig check` / `bitig lint` command to scan markdown content for undeclared CSS classes.
  - Cross-check met citation numbers with entries in the bibliography source files to detect broken or missing references.

### 9. Compact Configuration & Predefined Layout Profiles

- **Objective**: Make the configuration structure compact and introduce predefined layout profiles matching different book genres (e.g., novels, scientific papers, textbooks) while keeping the core schema flexible and generic.
- **Details**:
  - Allow defining a `profile` key in `book.json` (e.g., `"profile": "novel"` or `"profile": "academic-article"`) that automatically configures visual templates, styling rules, page dimensions, and page numbering conventions.
  - Maintain a clean, minimal root configuration schema where custom parameters can still override profile defaults.

### 10. Local Prose Analytics & Writing Goals

- **Objective**: Deterministic, LLM-free manuscript metrics and progress tracking.
- **Details**:
  - `bitig analyze:prose [<coords>]`: repeated-word frequency (language-aware stopword lists), sentence-length distribution, dialogue/narration ratio, approximate readability scoring.
  - Writing goals in `book.json` (`goals` block: total words, per-chapter min/max, daily words) surfaced by `bitig stats --goals` with completion bars and a `progress.json` daily word log.

### 11. Smart Context Task Modes

- **Objective**: Task-specific instruction blocks for the context pack — the facilitator answer to "continue/rewrite this chapter".
- **Details**:
  - `bitig context <coords> --task continue|rewrite|summarize|expand|dialogue|style-transform` swaps the instruction block and adjusts included content per task.

### 12. AI Review Suite: Continuity, Style & Plot Holes

- **Objective**: Facilitator-pattern review loops (clone of the `analyze:*` triple) grounded in the story bible data.
- **Details**:
  - `bitig review:context <coords>|all --type continuity|style|plotholes` packages character cards, chronology, world rules, open threads, and Chekhov's-gun instructions with a strict JSON findings schema.
  - `bitig review:report --file findings.json` validates, renders an ASCII findings table, and logs under `diagnostics/`.

### 13. Multi-Agent Editor Pipeline

- **Objective**: A documented, trackable six-role editorial workflow (Chapter Review, Continuity, Style, Proofreader, Fact Checker, Final Editor) with zero API calls.
- **Details**:
  - `bitig pipeline:init` (role definitions in `pipeline.json`), `pipeline:status` (per-chapter checklist from diagnostics logs), `pipeline:next` (next role's exact command + packaged context).

### 14. Publishing Outputs: Kindle EPUB Validation & Print-Ready PDF

- **Objective**: Submission-grade outputs. Amazon deprecated MOBI; KDP ingests EPUB 3, so Kindle support means a validated, Kindle-safe EPUB profile.
- **Details**:
  - Zero-dependency structural EPUB pre-flight validation (`bitig check:epub`) as a companion to external epubcheck.
  - `bitig build --profile kindle|print`: KDP trim sizes, mirrored margins/gutter, widow/orphan control (print), Kindle-safe CSS/font policies (kindle). Implements the config plumbing for roadmap item 9's `profile` key.
