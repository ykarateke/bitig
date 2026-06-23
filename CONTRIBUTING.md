# Contributing to Bitig

Thank you for your interest in contributing to **Bitig**! Whether you are a human developer, an AI coding assistant, or a team of autonomous agents, your contributions are welcome.

Bitig was designed from day one with a unique philosophy: to serve as a lightweight, type-safe, and highly modular book-compiling pipeline optimized for both human authors and AI writing workflows.

---

## Our Philosophy & Current Direction

Bitig is built on a few core architectural principles:
1. **The Facilitator Pattern**: Bitig does not make external LLM/API calls. It acts as a local infrastructure tool that packages context, manages local memory layers, and prints reports, allowing developers and AI agents to orchestrate their own LLM flows on top of it.
2. **Zero-Dependency Core**: To keep the CLI extremely fast, secure, and easily runnable in any environment, we prioritize vanilla JavaScript/TypeScript solutions. We avoid adding external dependencies (e.g., CLI table builders or parsing libraries) unless absolutely necessary.
3. **OOP & Strict Type Safety**: The codebase strictly enforces TypeScript's compiler constraints (`strict: true`, `noImplicitAny: true`, etc.) and follows object-oriented programming principles.

---

## The AI-Human Pair Programming Journey

Bitig is proud to be **co-created through an intensive AI-Human pair programming partnership** (between a human developer and Google's Gemini). Because the codebase was built in this collaborative environment, it is highly structured, modular, and self-documenting, making it exceptionally easy for AI coding assistants to read, understand, and modify.

### AI Agent Contribution Guide
If you are an AI agent or coding assistant contributing to this repository:
1. **Bootstrapping**: Run `bitig guide` and `bitig diagnostics-guide` in your workspace to understand the full compiler workflow, memory schema, and semantic scoring loop.
2. **Architectural Review**: Read `roadmap.md` to see the planned objectives and architectural goals before suggesting modifications.
3. **Code Quality**: Keep scripts modular and preserve strict TypeScript types.
4. **Test Guardrails**: Bitig maintains a **96%+ statement coverage** target. If you add or modify features, you must write corresponding unit/integration tests under the `tests/` directory. Run `npm run test:cov` to check coverage.
5. **Formatting**: Always run `npm run format` (via Prettier) before submitting. Husky hooks will reject commits with unformatted code.

---

## How to Contribute

### 1. Check the Roadmap
Take a look at [roadmap.md](roadmap.md) to see what features are currently in progress or planned (e.g., Asset & Image Management, Fiction & Narrative Planning Tools, Advanced Cover Design Systems). If you want to work on a roadmap item, open an Issue to announce it.

### 2. Propose Changes (RFC)
For major architectural changes or new commands, please open a GitHub Issue first. Explain your proposed design, why it fits the "Facilitator Pattern," and how it keeps the dependency footprint minimal.

### 3. Submitting a Pull Request
1. Fork the repository and create your feature branch.
2. Verify that the project builds successfully:
   ```bash
   npm run build
