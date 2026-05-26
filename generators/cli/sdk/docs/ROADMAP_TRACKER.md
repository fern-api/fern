# Roadmap Implementation Tracker

This document tracks the implementation progress of the P0/P1 roadmap items from DESIGN.md. Each plan is independently executable and produces working, testable software.

## Plan A: Typed flags & parameter handling

**Status:** Complete
**Plan file:** `PLAN_A_TYPED_FLAGS.md`
**Scope:** Transform CLI UX from `--params` JSON blobs to individual typed flags.

| # | Item | Status | Commit |
|---|------|--------|--------|
| 1 | Individual typed flags per parameter | Done | `feat: generate individual typed flags` + `feat: collect individual flag values` |
| 2 | Nested dot-notation params (`--name.full-name`) | Deferred to Plan B | (request body concern) |
| 3 | Query param serialization styles (deepObject, explode) | Done | `feat: query parameter serialization styles` |
| 6 | Header parameters (`in: header`) | Done | `feat: send header parameters as HTTP headers` |

**Dependencies:** None. This is the first plan to execute.

---

## Plan B: Request body & I/O

**Status:** Not started
**Plan file:** `PLAN_B_REQUEST_BODY.md`
**Scope:** Improve how request bodies and files get into the CLI.

| # | Item | Status | Commit |
|---|------|--------|--------|
| 4 | Schema composition (oneOf/anyOf/allOf) | Not started | |
| 5 | multipart/form-data uploads with @file syntax | Not started | |
| 7 | Stdin/pipe input for request bodies | Not started | |

**Dependencies:** Plan A (typed flags are needed for multipart form field flags).

---

## Plan C: Developer experience

**Status:** Not started
**Plan file:** `PLAN_C_DEVELOPER_EXPERIENCE.md`
**Scope:** Shell completions, man pages, auth flows, and debugging flags.

| # | Item | Status | Commit |
|---|------|--------|--------|
| 8 | Man pages via clap_mangen | Not started | |
| 9 | Shell completions (bash/zsh/fish/powershell) | Not started | |
| 10 | OAuth2 PKCE authentication flow | Not started | |
| 11 | Multiple auth schemes per operation | Not started | |
| 12 | `--base-url` override flag | Not started | |
| 13 | `--debug` request/response inspection flag | Not started | |

**Dependencies:** None (can run in parallel with Plan B after Plan A lands).

---

## Execution notes

- Plans are executed sequentially: A → B → C
- Each plan has its own detailed implementation plan file with bite-sized tasks
- Agents should read the plan file, execute tasks, update this tracker, commit, and push
- Each item should get its own commit (or small set of commits) for clean git history
