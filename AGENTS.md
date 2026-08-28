# Art / Muuzee Project Instructions

## Project Context

Before starting project-related work, read:

`docs/project-context.md`

Use the Notion Project URL defined there to access the project specifications through the Notion MCP when the task requires approved product specifications, decisions, or project context.

The local project directory may remain named `art` during the exploration phase.
The intended product / repository name is `muuzee`.

---

## Core Operating Principle

Use three distinct layers:

1. **Notion = approved product intent and decisions**
2. **`prototype/` = exploratory UI/UX workspace**
3. **`src/` = production implementation**

Do not force exploratory prototype changes into Notion.

Do not treat prototype implementation details as approved specifications unless the user explicitly approves them.

---

## Source of Truth

### Notion is the source of truth for approved service intent

Use Notion for:

- Product and business strategy
- Approved product requirements and service operations
- Approved UX and experience specifications
- Marketing and go-to-market planning
- Brand and design-system specifications
- Research, evidence, hypotheses, and assumptions
- Roadmap and outcomes
- Tasks
- Decisions
- Release information

### Local files are the source of truth for implementation state

Use local files for:

- Source code
- Prototypes
- Assets
- Tests
- Development configuration

### Prototype status

`prototype/` is intentionally experimental.

A prototype may contain:

- unapproved UI directions
- temporary copy
- placeholder data
- temporary interactions
- exploratory layout choices
- incomplete states

Do not infer that something is a product requirement only because it exists in `prototype/`.

---

## Working Modes

Always determine which mode the current task belongs to.

### Mode A — Prototype Discovery

Use this mode when the user is:

- exploring UI ideas
- adjusting layout, typography, imagery, motion, or interaction
- comparing design directions
- iterating responsive behavior
- building or revising a visual prototype
- asking to “try”, “see”, “test”, or “make an image / prototype”

Rules:

1. Work primarily inside `prototype/`.
2. Read `docs/project-context.md`.
3. Inspect the current prototype before changing it.
4. Read existing Notion brand / UX decisions only when they materially constrain the requested change.
5. Do **not** update Notion for normal exploratory changes.
6. Do **not** create Requirement IDs for exploratory UI.
7. Make the smallest reasonable prototype change.
8. Validate desktop and mobile behavior.
9. Summarize what changed.
10. Commit meaningful checkpoints to Git when requested or when the user asks to publish the latest prototype.

Prototype exploration should remain fast.

### Mode B — Approved Specification Change

Use this mode when the user explicitly approves a direction or says it should become part of the service specification.

Examples:

- “これで行きましょう”
- “採用で”
- “仕様にしてください”
- “Notionにも反映してください”
- “これを正式なデザインルールにしてください”

Rules:

1. Read the relevant Notion specification and Decisions.
2. Confirm what is being promoted from prototype to approved intent.
3. Update the relevant Notion page.
4. Add or update a `Decisions` entry when the decision is meaningful.
5. Update `docs/` only when Codex needs durable implementation context that should not live only in Notion.
6. Keep the prototype aligned with the approved direction.
7. Commit the related local changes to Git.

### Mode C — Production Implementation

Use this mode only after the user explicitly asks to implement the real service or move approved behavior into production code.

Rules:

1. Read `docs/project-context.md`.
2. Read the relevant Notion specifications and Decisions.
3. Inspect the approved prototype.
4. Implement production code under `src/`.
5. Treat `prototype/` as a visual and UX reference, not as production architecture.
6. Do not directly evolve prototype HTML into production architecture unless explicitly instructed.
7. Validate implementation against the approved specification.
8. Add tests where appropriate.
9. Report remaining differences between prototype, specification, and production implementation.

---

## Recommended Local Structure

```text
art/                         # rename to muuzee later
├── AGENTS.md
├── README.md
│
├── docs/
│   ├── project-context.md
│   ├── architecture.md      # create when production architecture starts
│   └── decisions/           # optional technical notes only
│
├── prototype/
│   ├── index.html           # HOME / default prototype entry
│   ├── exhibition.html
│   ├── museum.html
│   ├── artist.html
│   ├── map.html
│   ├── saved.html
│   └── my-art.html
│
├── src/
│   └── ...                  # production implementation; can remain empty for now
│
└── assets/
    ├── brand/
    ├── artists/
    ├── exhibitions/
    └── icons/
```

Keep the structure simple until complexity is actually needed.

Do not create a new framework, package structure, or architecture only for future possibilities.

---

## Prototype File Rules

### Canonical filenames

Use stable filenames such as:

- `prototype/index.html`
- `prototype/exhibition.html`
- `prototype/museum.html`

Do not create:

- `home_v2.html`
- `home_v7_final.html`
- `home_latest2.html`

Use Git history for versioning instead.

### Assets

Use `assets/` for reusable project assets.

Prefer:

```text
assets/brand/
assets/artists/
assets/exhibitions/
```

Prototype pages should reference those assets rather than duplicating them when practical.

Temporary one-off assets may remain local to a prototype only while actively exploring.

---

## Git Workflow

Git should be used from the prototype phase onward.

Intended repository:

The current repository URL is defined by `git remote get-url origin`.
After the pending repository rename, use `https://github.com/keianduu/muuzee`.

The local directory may remain named `art`; the local folder name does not need to match the GitHub repository name.

### Simple workflow

Use `main` as the primary branch while the project is small.

Typical flow:

```text
UI discussion / exploration
        ↓
prototype/ update
        ↓
browser validation
        ↓
git diff
        ↓
commit
        ↓
push
        ↓
GitHub Pages preview
```

Prefer small meaningful commits.

Example commit messages:

```text
prototype: refine home hero
prototype: add featured artist portraits
prototype: add museum map
design: approve Muuzee home IA
spec: sync approved ArtWall behavior
feat: implement exhibition detail
```

Do not save versions by duplicating HTML files.

### GitHub Pages

During prototype development, publish the prototype for browser / mobile review.

Preferred preview path:

After the pending repository rename:

`https://keianduu.github.io/muuzee/prototype/`

Until then, derive the preview path from the current `origin` repository name.

If a root `index.html` is used, it may redirect to `prototype/`.

Do not treat GitHub Pages deployment as a production release unless explicitly stated.

---

## Promotion Workflow: Prototype → Specification

A prototype does not automatically become the specification.

Promote a design only when the user explicitly approves it.

When approved:

```text
prototype exploration
        ↓
user approval
        ↓
Notion UX / Brand / Requirement update
        ↓
Decision entry if meaningful
        ↓
Git commit
```

Examples of items worth promoting to Notion:

- Home information architecture
- navigation model
- brand copy
- major interaction behavior
- responsive behavior that affects UX
- component rules
- design tokens
- product capability decisions

Examples that normally do **not** need Notion updates:

- 52vh → 55vh
- 46px → 54px during exploration
- small margin adjustments
- temporary image substitutions
- minor border-radius tuning
- intermediate map styling experiments

Git preserves these implementation changes.

---

## Notion Information Architecture

The project uses the following top-level Notion structure:

1. `00 Inbox`
2. `01 Product Strategy`
3. `02 Product Requirements`
4. `03 UX & Experience`
5. `04 Marketing & GTM`
6. `05 Brand & Design System`
7. `06 Research & Evidence`
8. `07 Release Notes`
9. `Tasks`
10. `Decisions`

Business, Growth, and Roadmap information belongs in `01 Product Strategy` rather than separate top-level pages.

Data, Platform, Legal, and Operations specifications belong in `02 Product Requirements` rather than separate top-level pages.

---

## Information Classification

Classify approved or durable information as follows:

- Unsorted notes, raw ideas, source material, research inputs, and material awaiting review by Codex -> `00 Inbox`
- Vision, problems, target users, value proposition, positioning, business model, monetization, pricing, revenue targets, growth loops, product KPIs, strategy, and roadmap outcomes -> `01 Product Strategy`
- Capability candidates, approved functional and non-functional requirements, data model, APIs, architecture, frontend/backend boundaries, auth, storage, analytics, legal constraints, service operations, and admin/CMS specifications -> `02 Product Requirements`
- Experience concept, user journey, information architecture, navigation, user flows, screens, interaction behavior, UI states, responsive behavior, and accessibility behavior -> `03 UX & Experience`
- Target audience, JTBD, acquisition, GTM, launch, channels, SEO, SNS, content, referral, partnership, inbound, campaigns, and marketing KPIs -> `04 Marketing & GTM`
- Brand purpose, personality, emotional value, visual direction, typography, color, layout, illustration, icons, motion, design principles, tokens, components, UI patterns, voice, accessibility standards, and quality standards -> `05 Brand & Design System`
- Market, competitor, and user research; PMF evidence; data; assumptions; open questions; and validation results -> `06 Research & Evidence`
- Shipped changes and release history -> `07 Release Notes`
- Concrete, executable work with a clear completion condition -> `Tasks`
- Important product, business, UX, technical, marketing, brand, design, or operational decisions -> `Decisions`

Preserve important raw source material in `00 Inbox` or `06 Research & Evidence` even after synthesizing it elsewhere.

---

## Evidence and Uncertainty

Always distinguish:

- **Fact**: supported by an attributable source or direct observation
- **Hypothesis**: a testable prediction or explanation
- **Assumption**: an unverified premise currently being used

Never present a hypothesis or assumption as fact.

Do not infer or finalize undecided brand or design specifications.

During Prototype Discovery, speculative directions are allowed, but they remain exploratory until explicitly approved.

---

## Capability vs Requirement

Do not turn an idea into a Requirement automatically.

- Put ideas, possible features, and capabilities under the `Capability Map` in `02 Product Requirements` only when they are ready to be recorded as durable product candidates.
- Assign a Requirement ID such as `REQ-001` only after implementation is explicitly decided and the scope and acceptance criteria are clear.
- Tasks are for executable work, not for storing feature ideas or unresolved product concepts.
- When a capability becomes a Requirement, preserve its supporting evidence and link relevant Decisions.

Prototype existence alone is not sufficient reason to create a Requirement.

---

## Before Work

### For Prototype Discovery

Before changing a prototype:

1. Read `docs/project-context.md`.
2. Inspect the current `prototype/` implementation.
3. Identify relevant existing design / UX constraints.
4. Read Notion only when approved specifications or Decisions materially affect the requested change.
5. Make the requested exploratory change.
6. Validate responsive behavior.

Do not require a Notion update before every prototype iteration.

### For Approved Specification or Production Work

Before changing approved specification or production implementation:

1. Read `docs/project-context.md`.
2. Access the linked Notion Project.
3. Classify the task using the Notion Information Architecture.
4. Read the relevant Notion specification, evidence, and Decisions.
5. Inspect the current local implementation.
6. Compare specification with implementation.
7. Identify and report meaningful differences before making ambiguous changes.

Do not make assumptions when an approved specification exists in Notion.

---

## Specification Conflicts

If the Notion specification and current implementation conflict:

1. Treat Notion as authoritative for **approved product and service intent**.
2. Treat local files as authoritative for **current implementation state**.
3. A prototype may intentionally differ from Notion during exploration.
4. Do not silently promote a prototype difference into the specification.
5. Report conflicts before making ambiguous product decisions.

---

## Notion Changes

Do not modify Notion unless:

- the user explicitly asks to change the specification, or
- the user explicitly approves a meaningful product / UX / brand / technical direction, or
- the task clearly includes an approved specification change.

When a meaningful decision is approved:

- update the relevant Notion specification if necessary
- add or update the corresponding `Decisions` entry when appropriate

Preserve the Project relations and filtered linked views for `Tasks` and `Decisions`.

Do not write every prototype iteration to Notion.

---

## Implementation Workflow

### Prototype

1. Inspect current prototype.
2. Make the smallest reasonable change.
3. Preserve existing visual conventions unless intentionally exploring a new direction.
4. Validate desktop and mobile.
5. Summarize changed files.
6. Commit meaningful checkpoints when requested.

### Production

1. Read the relevant Notion specification.
2. Inspect approved prototype and production files.
3. Make the smallest reasonable production change.
4. Preserve existing conventions.
5. Validate the result.
6. Add or update tests where appropriate.
7. Summarize changed files.
8. Report remaining differences from the approved specification.

---

## Renaming `art` to `muuzee`

Do not rename the local directory only for naming consistency while integrations are still being established.

Rename when the project identity and repository workflow are stable.

When renaming:

1. Rename local `art/` -> `muuzee/`.
2. Confirm Codex workspace path.
3. Confirm Notion project references in `docs/project-context.md`.
4. Confirm Git remote points to the current repository URL; update it to `https://github.com/keianduu/muuzee` after the repository rename.
5. Update this file's Project Boundaries section.
6. Validate local scripts and absolute paths.

Git history is not affected by changing the local folder name.

---

## Project Boundaries

This AGENTS.md currently applies only to the `art` project, which is the working directory for Muuzee.

Do not use specifications, research, Tasks, or Decisions from other projects under `my-project`.

Do not modify files outside this project unless the user explicitly requests it.

When the local project directory is renamed from `art` to `muuzee`, update this section accordingly.
