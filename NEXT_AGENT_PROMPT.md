# Task: Design a Shared Generation Library to Unify CLI and Fiddle

## Your Mission

Fern has a **duplication problem**: the generation pipeline's post-processing logic (GitHub operations, `.fernignore` handling, commit management, PR creation) exists in **two separate places** — the Fern CLI (`local-workspace-runner`) and the Fiddle server (remote generation service). This duplication is already causing friction because the new **Replay** feature was integrated only into the CLI, and now needs to work with Fiddle too.

Your job is to **design a shared generation library** (working name: `generator-cli` or `generation-lib`) that:
1. Encapsulates all post-generation logic (git operations, `.fernignore`, GitHub PRs, Replay) in one place
2. Can be consumed by **both** the Fern CLI (TypeScript, runs locally) and **Fiddle** (server-side, currently handles GitHub operations remotely)
3. Integrates Replay so it works in both local and remote generation modes

---

## Background: What Exists Today

### Two Generation Pipelines

**Local Generation** (`fern generate --local`):
- CLI runs Docker container locally with the generator
- Generator writes SDK files to an output directory
- CLI handles ALL post-processing: git clone → `.fernignore` preservation → Replay → commit → push/PR
- Entry point: `packages/cli/generation/local-generation/local-workspace-runner/src/runLocalGenerationForWorkspace.ts`

**Remote Generation** (`fern generate` without `--local`):
- CLI sends IR + config to Fiddle server via HTTP
- Fiddle runs the generator server-side
- **Fiddle handles GitHub operations** (clone, commit, push, PR creation) — this is a separate Go/TypeScript service
- CLI just sends `fernignoreContents` as a string; Fiddle applies it
- Entry point: `packages/cli/generation/remote-generation/remote-workspace-runner/src/createAndStartJob.ts`
- Fiddle SDK: `@fern-fern/fiddle-sdk`

### Existing `generator-cli` (The npm Package)

There's already a `@fern-api/generator-cli` npm package that generators call from inside their Docker containers:
- Lives at: `generators/base/src/GeneratorAgentClient.ts`
- Provides: `generateReadme()`, `generateReference()`, `pushToGitHub()`
- Used by: `AbstractGeneratorAgent` in `generators/base/src/AbstractGeneratorAgent.ts`
- The Go SDK for the same API: `github.com/fern-api/generator-cli-go`

This existing `generator-cli` runs **inside** the generator Docker container and handles things like README generation. It's a different concern from what we need, but the naming overlap is important to be aware of.

### Replay (Just Integrated into CLI)

Replay preserves user customizations across SDK regenerations. It was just integrated into the **local generation** pipeline only:

- Library: `/Users/tanmay/Documents/fern/fern-replay/` (external repo, linked via `file:` dependency)
- Main API: `ReplayService.runReplay(options)` → `ReplayReport`
- Integration point in CLI: `runLocalGenerationForWorkspace.ts` lines 285-344
- Creates commits: `[fern-generated]` → replayed patches → `[fern-replay]`
- `.fernignore` entries (`.fern/replay.lock`, `.fern/replay.yml`) preserve lockfile across generation wipes
- CLI commands: `fern replay bootstrap/status/forget/reset`

**Problem**: Replay does NOT work with remote generation (Fiddle), because Fiddle handles GitHub operations server-side and has no concept of Replay.

---

## Key Files to Read

### CLI Local Generation (where Replay lives now)
- `packages/cli/generation/local-generation/local-workspace-runner/src/runLocalGenerationForWorkspace.ts` — **THE core file**. Read the entire thing. Pay special attention to:
  - Lines 28-55: Function signature with `replay` parameter
  - Lines 179-239: GitHub self-hosted clone/checkout flow
  - Lines 256-281: Docker generator execution
  - Lines 285-344: Replay integration block
  - Lines 346-354: `postProcessGithubSelfHosted()` call with `skipCommit`
  - Lines 414-537: PR detection logic (`findExistingUpdatablePR`, `checkPRHasOnlyGenerationCommits`)
  - Lines 539-724: `postProcessGithubSelfHosted()` — GitHub PR/push logic with `.fernignore` creation, commit, push, PR creation/update
  - Lines 950-966: `ensureReplayFernignoreEntries()`

### CLI Remote Generation (Fiddle path)
- `packages/cli/generation/remote-generation/remote-workspace-runner/src/runRemoteGenerationForGenerator.ts` — Remote gen entry point
- `packages/cli/generation/remote-generation/remote-workspace-runner/src/createAndStartJob.ts` — Creates Fiddle job, sends `fernignoreContents`
- `packages/cli/generation/remote-generation/remote-workspace-runner/src/pollJobAndReportStatus.ts` — Polls Fiddle for results
- `packages/cli/generation/remote-generation/remote-workspace-runner/src/RemoteTaskHandler.ts` — Processes Fiddle responses

### `.fernignore` Preservation
- `packages/cli/generation/local-generation/local-workspace-runner/src/LocalTaskHandler.ts` — Lines 273-375: The `git rm -rf .` → copy → `git reset` flow that preserves fernignore paths

### Generator Base (existing generator-cli)
- `generators/base/src/AbstractGeneratorCli.ts` — Base class generators extend
- `generators/base/src/AbstractGeneratorAgent.ts` — Higher-level abstraction with `pushToGitHub()`, `generateReadme()`
- `generators/base/src/GeneratorAgentClient.ts` — Wraps the `@fern-api/generator-cli` binary

### GitHub Utilities
- `packages/commons/github/src/ClonedRepository.ts` — Git operations wrapper (clone, checkout, commit, push, force-push, PR branch management)

### Replay Library
- `/Users/tanmay/Documents/fern/fern-replay/src/index.ts` — All exports
- `/Users/tanmay/Documents/fern/fern-replay/src/ReplayService.ts` — Main service
- `/Users/tanmay/Documents/fern/fern-replay/src/ReplayDetector.ts` — Patch detection
- `/Users/tanmay/Documents/fern/fern-replay/src/ReplayApplicator.ts` — Patch application
- `/Users/tanmay/Documents/fern/fern-replay/src/ReplayCommitter.ts` — Git commit creation
- `/Users/tanmay/Documents/fern/fern-replay/src/commands/bootstrap.ts` — Bootstrap command
- `/Users/tanmay/Documents/fern/fern-replay/src/commands/status.ts` — Status command

### Configuration Schema
- `fern/apis/generators-yml/definition/replay.yml` — Replay schema in generators.yml
- `fern/apis/generators-yml/definition/generators.yml` — Main generators.yml schema

---

## The Core Design Question

Currently, the post-generation lifecycle looks like this:

```
[Generator runs in Docker] → [Output files written]
                                      ↓
                            ┌─── LOCAL PATH ───┐          ┌─── REMOTE PATH ───┐
                            │ CLI handles:      │          │ Fiddle handles:    │
                            │ • .fernignore     │          │ • .fernignore      │
                            │ • git operations  │          │ • git operations   │
                            │ • Replay          │          │ • commit/push/PR   │
                            │ • commit/push/PR  │          │ • (NO Replay)      │
                            └───────────────────┘          └────────────────────┘
```

We need to design a **shared library** that both paths can call:

```
[Generator runs] → [Output files written]
                            ↓
                   ┌── Shared Generation Library ──┐
                   │ • .fernignore preservation     │
                   │ • Replay (detect, apply, merge)│
                   │ • git operations               │
                   │ • commit management             │
                   │ • PR creation/update            │
                   │ • Conflict handling             │
                   └────────────────────────────────┘
                      ↑                        ↑
                 CLI (local)              Fiddle (remote)
```

---

## Questions to Answer in Your Design

1. **Where does this library live?** Options:
   - New package in the monorepo (e.g., `packages/cli/generation/shared/`)
   - Extension of `fern-replay` to become the full post-generation library
   - Extension of the existing `@fern-api/generator-cli`
   - Something else?

2. **What is the API surface?** Design the TypeScript interface(s) that this library exposes. Consider:
   - Input: output directory, git config, GitHub config, replay config, `.fernignore` content
   - Output: report of what happened (commits made, PR URL, replay results, conflicts)
   - Options: dry-run, stage-only, skip-replay, CI vs local mode

3. **How does Fiddle consume it?** Options:
   - Fiddle imports it as a TypeScript library directly
   - It becomes a CLI binary that Fiddle shells out to (like current `generator-cli`)
   - Fiddle makes HTTP calls to a microservice
   - Some hybrid approach

4. **What about the existing `postProcessGithubSelfHosted()` function?** This ~200-line function in `runLocalGenerationForWorkspace.ts` handles:
   - PR branch management (find existing PR, create new branch, update existing)
   - `.fernignore` creation
   - Committing changes
   - Push (regular, force-push for replay)
   - PR creation/update via Octokit
   - All the `skipCommit` logic for replay

   Should this move wholesale into the shared library? How should it be factored?

5. **How does `.fernignore` preservation work in the shared library?** Currently:
   - Local: `LocalTaskHandler` does `git rm -rf .` → copy → `git reset fernignore paths` (complex git dance)
   - Remote: CLI sends `fernignoreContents` string to Fiddle; Fiddle applies it somehow server-side
   - Should the shared library own this, or just the post-preservation operations?

6. **How does Replay interact with the shared library?** Currently Replay:
   - Creates its own git commits (`[fern-generated]`, replayed patches, `[fern-replay]`)
   - Needs the output directory to be a git repo
   - Uses `stageOnly` mode when GitHub operations happen later
   - Needs the lockfile (`.fern/replay.lock`) preserved via `.fernignore`
   - In Fiddle mode, Fiddle would need to run Replay after generation but before push

7. **Incremental migration path**: We can't rewrite everything at once. What's the phased approach?
   - Phase 1: Extract shared types/interfaces
   - Phase 2: Move git/GitHub operations
   - Phase 3: Integrate Replay
   - Phase 4: Wire Fiddle to use the shared library

---

## Constraints

- **Language**: TypeScript (Fern CLI is TypeScript, Fiddle is... you should investigate)
- **Backward compatibility**: Existing `fern generate` behavior must not change
- **Replay is optional**: The shared library should work with or without Replay enabled
- **Self-hosted vs cloud GitHub**: Self-hosted mode uses personal tokens; cloud mode may use GitHub App installation tokens
- **PR deduplication**: Finding and updating existing PRs is critical (not creating duplicates)
- **`.fernignore` is sacred**: Users rely on this to preserve custom files; breaking it is a showstopper
- **Error handling**: Generation should succeed even if Replay fails (fail-safe, log warning)

---

## Deliverable

Write a detailed design document that includes:

1. **Architecture overview** with a diagram of the proposed library structure
2. **Package structure** — where it lives, what it exports
3. **API design** — TypeScript interfaces for the public API
4. **Integration plan** for CLI (how `runLocalGenerationForWorkspace.ts` changes)
5. **Integration plan** for Fiddle (how Fiddle would consume this; research what Fiddle's architecture looks like)
6. **Migration plan** — phased approach with clear milestones
7. **File-level change list** — which files move/change/get created

Write the design document to a file at `packages/cli/generation/SHARED_GENERATION_LIBRARY_DESIGN.md`.

---

## How to Start

1. Read ALL the key files listed above to understand the current architecture
2. Investigate what Fiddle actually does — search for `fiddle` in the codebase, look at the Fiddle SDK types
3. Understand the full lifecycle of both local and remote generation
4. Map out all the duplicated logic between the two paths
5. Design the shared library API
6. Write the design document
