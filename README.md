# Bitig - OOP Book Compiler and Writing Workflow CLI

Bitig is a structured, type-safe TypeScript command-line tool designed for authors and AI agents to outline, write, analyze, lint, and compile manuscripts into high-quality publications (Markdown, HTML, PDF, and AI-readable metadata).

---

## Getting Started

To initialize a template book structure in your current working directory, run:

```bash
bitig init
```

This creates:

- `book.json`: Configuration for titles, authors, styling, sections, and automated citations.
- `assets/`: Folders for chapters and sections (e.g. `section-0/0.1.md`, `section-1/1.1.md`).
- `assets/epilogue.md` and `assets/bibliography.md`: Placeholder markdown files.

---

## Command Reference

### 1. Compiling the Book

```bash
bitig build [options]
```

Generates outputs inside the `dist/` directory.

- `--no-pdf`: Compiles Markdown, HTML, and AI metadata but skips Puppeteer PDF rendering.
- `-t, --theme <serif|sans-serif|academic>`: Overrides the visual stylesheet.
- `-c, --config <path>`: Points to a custom configuration JSON (defaults to `./book.json`).

### 2. Manuscript Structure Management

Instead of manually renaming files and hacking config paths, manage your book structure with:

```bash
# Add a new section folder and update book.json
bitig add:section 2 --title "The Silicon Mind"

# Add a chapter file under section 2
bitig add:chapter 2.1 --title "First Breath of the Machine"

# Move/re-index a chapter file and references
bitig move:chapter 2.1 2.2

# Delete a chapter markdown file
bitig delete:chapter 2.2
```

### 3. Writing Statistics

```bash
bitig stats
```

Displays draft statistics (word count, reading time estimation) and structural layout mapping.

### 4. Integrity Checks & Diagnostics

```bash
bitig check
```

Scans the manuscript for:

- Odd number of backticks (unclosed code blocks).
- Broken internal links pointing to non-existent markdown chapters.
- Citation terms declared in `book.json` that are unused in the text.

### 5. Semantic Search

```bash
bitig search "<keyword>"
```

Crawls all chapter files and returns line matches, files, line numbers, and headings.

### 6. AI Agent Context Packaging

```bash
bitig context <sectionNum>.<chapterNum>
```

Produces a focused context window prompt pack for LLM/RAG writers to edit or continue the target chapter. Contains:

- Outlines and synopses of all chapters.
- Complete text of the preceding chapter to maintain tone and narrative flow.
- Visual theme guidelines and citation constraints.

### 7. Workflow Guide

```bash
bitig guide
```

Outputs this writing workflow guide directly to the terminal for easy reading by AI agents.

---

105: ## AI Agent Workflow Guide
106:
107: When writing or editing using Bitig, follow this recommended workflow loop:
108:
109: 1. **Read Outlines**: Run `bitig stats` to check the manuscript layout.
110: 2. **Retrieve Context**: Run `bitig context <coords>` for the chapter you are writing. Use the preceding chapter text to match vocabulary, character details, and pacing.
111: 3. **Drafting / Updating**:
112: - Write your markdown chapter inside its designated file under `assets/section-X/X.Y.md`.
113: - Or programmatically update titles or summaries using `bitig update:metadata <coords> --title "Title" --synopsis "Synopsis"`.
114: 4. **Keyword Check**: Use `bitig search "<keyword>"` to check consistency of terms across other sections.
115: 5. **Static Diagnostics**: Run `bitig check` to verify formatting.
116: 6. **Local Preview**: Run `bitig dev` to start the live preview server, open `http://localhost:3000` in a browser, and watch changes compile and hot-reload in real-time.
117: 7. **Compile for Release**: Run `bitig build` to generate the final distribution files (including PDF compilation).
118: 8. **Commit & Format**: Run `git commit -m "your message"`. Husky and `lint-staged` will automatically run Prettier to format your modifications before finalizing the commit.
119:
120: ---
121:
122: ## Book Configuration Reference (book.json)
123:
124: `book.json` is the central configuration file of your book project. It governs both structural properties (e.g. metadata, files) and visual styling (e.g. themes, custom CSS, layout parameters).
125:
126: ### 1. Structural Configuration Options
127:
128: _ **`title`** (Required - `string`): The primary title of the book. Printed on the cover page, headers, and metadata.
129: _ **`subtitle`** (Optional - `string`): The subtitle of the book. Printed below the title.
130: _ **`author`** (Optional - `string`): The author's name. Printed on the cover page and metadata.
131: _ **`description`** (Optional - `string`): A brief summary of the book. Printed on the cover page and used in metadata.
132: _ **`assetsDir`** (Required - `string`): Path to the manuscript directory (default: `"./assets"`). Contains section directories (e.g. `section-1`) and special chapters.
133: _ **`distDir`** (Required - `string`): Path to the output directory (default: `"./dist"`). Compiles to Markdown, HTML, PDF, and JSON.
134: _ **`outputFilename`** (Required - `string`): Filename of the compiled book (default: `"book.md"`). Basename is used to name HTML (`book.html`) and PDF (`book.pdf`).
135: _ **`epilogueFile`** (Optional - `string`): Name of the epilogue file under `assetsDir` (default: `"epilogue.md"`). Treated as Section 998.
136: _ **`bibliographyFile`** (Optional - `string`): Name of the bibliography file under `assetsDir` (default: `"bibliography.md"`). Treated as Section 999.
137: _ **`pdf`** (Optional - `boolean`): Enables/disables PDF compilation via Puppeteer (default: `true`).
138: _ **`language`** (Optional - `string`): Locale code of the book (default: `"tr"`, supported: `"tr"`, `"en"`). Determines TOC headings and template localizations.
139: _ **`sectionTitles`** (Optional - `Record<string, string>`): Map of section folder numbers (e.g. `"1"`) to section header titles.
140: _ **`citations`** (Optional - `Array<{ term: string, replacement: string }>`): Auto-replacement rules for inserting reference citations (e.g., term matching to HTML footnotes).
141: _ **`synopses`** (Optional - `Record<string, string>`): Coordinate mapping of custom summaries for chapters (e.g. `"1.1": "Chapter 1.1 synopsis"`).
142:
143: ### 2. Styling & Layout Customization
144:
145: #### Theme Configurations
146: _ **`theme`** (Optional - `string`): Set a predefined style theme (default: `"serif"`).
147: _ **`serif`**: Uses **Merriweather** for body and **Montserrat** for headings. Offers a classic literary look.
148: _ **`sans-serif`**: Uses **Inter** for body and **Outfit** for headings. Modern, clean look.
149: _ **`academic`**: Uses **EB Garamond** for body and headings. Clean classical look with 3cm margins and paragraph indentation.
150: _ **`customThemePath`** (Optional - `string`): Path to a custom CSS stylesheet file. If provided, completely overrides the predefined themes.
151:
152: #### Customizing Layout and Design using CSS (customThemePath)
153: By pointing `customThemePath` to a local CSS file (e.g. `"./custom.css"`), you can customize every detail of the book's look and feel for HTML and PDF outputs:
154:
155: _ **Typography & Fonts**: Import Google Fonts or system fonts, and define font sizes:
156: `css
157:   @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
158:   
159:   body {
160:     font-family: 'Lora', serif;
161:     font-size: 11.5pt;
162:     line-height: 1.7;
163:     color: #222222;
164:   }
165:   h1, h2, h3 {
166:     font-family: 'Playfair Display', serif;
167:     color: #111111;
168:   }
169:   `
170: _ **Page Dimensions & Margins**: Use CSS `@page` selectors to alter page sizes, margins, headers, and footers (which affect PDF printing):
171: ```css
172: @page {
173: size: A4; /_ Options: A4, A5, letter, etc. _/
174: margin: 2.5cm 2.5cm 2.5cm 2.5cm; /_ Custom margins _/
175: @bottom-center {
176: content: counter(page); /_ Page number alignment _/
177: font-size: 9pt;
178: font-family: sans-serif;
179: }
180: }
181: ```
182: _ **Selective Page Layouts**: Customize cover and TOC pages separately to suppress page numbers:
183: `css
184:   /* Cover layout */
185:   @page cover-page-layout {
186:     margin: 0;
187:     @bottom-center { content: none; } /* Hide page numbers on cover */
188:   }
189:   .cover-page {
190:     page: cover-page-layout;
191:     padding: 3cm;
192:   }
193: 
194:   /* Table of Contents layout */
195:   @page toc-page-layout {
196:     @bottom-center { content: none; } /* Hide page numbers on TOC */
197:   }
198:   .toc-page {
199:     page: toc-page-layout;
200:   }
201:   `
202: _ **Paragraph Styling**: Define alignment, line spaces, and indentation:
203: ```css
204: p {
205: text-align: justify; /_ Justified text for clean margins _/
206: text-indent: 1cm; /_ First line paragraph indent _/
207: margin-bottom: 1.2em;
208: orphans: 3;
209: widows: 3;
210: }
211: p:first-of-type {
212: text-indent: 0; /_ Remove indent from first paragraph _/
213: }
214: ```
215: _ **Custom Containers**: Style elements like blockquotes, code snippets, lists, and tables:
216: `css
217:   blockquote {
218:     font-style: italic;
219:     background-color: #f9f9f9;
220:     border-left: 5px solid #d2b48c; /* Custom left border color */
221:     padding: 10px 20px;
222:     margin: 1.5em 0;
223:   }
224:   `
