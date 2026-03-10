# CLAUDE.md Quality Report

**Repository**: fern (https://github.com/fern-api/fern)
**Audit Date**: 2026-03-10
**Auditor**: Claude Code (claude-md-management:claude-md-improver)

---

## Summary

- **Files found**: 17
- **Average score**: 72/100 (Grade: B)
- **Files needing update**: 10
- **Coverage gaps**: 4 generators lack CLAUDE.md files entirely (PHP, Swift, TypeScript-v2, OpenAPI)

---

## File-by-File Assessment

### 1. ./CLAUDE.md (Project Root)

**Score: 91/100 (Grade: A)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 19/20 | Excellent coverage of build, test, lint, seed commands. DevBox setup included. |
| Architecture clarity | 18/20 | Clear three-layer architecture with key directories and patterns. |
| Non-obvious patterns | 14/15 | Good coverage of IR-centric design, tandem generators, PR title rules, turbo filters. |
| Conciseness | 12/15 | Thorough but slightly verbose in places (TypeScript rules section is long). |
| Currency | 14/15 | Minor inaccuracies: claims "28 sub-packages" for CLI (actual: 32), references `packages/generation/ir-migrations/` (correct path: `packages/cli/generation/ir-migrations/`). |
| Actionability | 14/15 | All commands are copy-paste ready. Seed workflow well documented. |

**Issues:**
- The root CLAUDE.md references `packages/generation/ir-migrations/` in the Development Notes section, but the correct path is `packages/cli/generation/ir-migrations/`.
- The TypeScript rules section (~65 lines) is comprehensive but lengthy for a CLAUDE.md. Could be extracted to a separate file and referenced.
- Missing mention of `generators/typescript-v2/` which exists in the codebase.
- The `@~/.claude/my-fern-instructions.md` import at the bottom is good practice.

**Recommended additions:**
- Add `typescript-v2` to the generator-specific documentation list.
- Fix the IR migrations path typo.
- Consider extracting the TypeScript rules into a separate `.claude/typescript-rules.md` and referencing it.

---

### 2. ./packages/cli/CLAUDE.md

**Score: 74/100 (Grade: B)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 16/20 | Good command coverage, but `pnpm -w lint:biome` is unusual syntax and may confuse. |
| Architecture clarity | 16/20 | Good sub-package breakdown, but claims "28 sub-packages" (actual: 32). |
| Non-obvious patterns | 10/15 | Covers workspace loading and generation pipeline, but some sections are generic. |
| Conciseness | 8/15 | Overly verbose. Many sections read like generic documentation rather than actionable CLAUDE.md content. Best Practices, Architecture Patterns, and Version Management sections are largely generic advice. |
| Currency | 12/15 | cli.ts is claimed to be "58K+ lines" -- actual is ~2,287 lines. Sub-package count is wrong. |
| Actionability | 12/15 | Commands are usable but some code examples use generic patterns rather than actual codebase patterns. |

**Issues:**
- **Factual error**: Claims `cli.ts` is "58K+ lines" -- it is actually ~2,287 lines.
- **Factual error**: Claims "28 specialized packages" -- actual count is 32 directories.
- Several sections are generic padding (Best Practices, Architecture Patterns with placeholder code examples, Version Management System). These don't add value for Claude Code.
- The `Configuration System` section duplicates what's already in the root CLAUDE.md.
- Code examples in "Architecture Patterns" and "Error Handling" sections are generic templates, not actual codebase patterns.
- Missing mention of `cli-v2/` sub-package which exists in the directory.

**Recommended additions:**
- Fix factual inaccuracies (line count, package count).
- Remove generic "Best Practices" and "Architecture Patterns" sections -- they add noise.
- Add actual key files/entry points with real function signatures rather than generic templates.
- Mention the `cli-v2/` sub-package and its relationship to the main CLI.

---

### 3. ./packages/ir-sdk/CLAUDE.md

**Score: 78/100 (Grade: B)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 16/20 | Good commands for regenerating IR SDK and compiling. |
| Architecture clarity | 16/20 | Clear explanation of versioning system and directory structure. |
| Non-obvious patterns | 12/15 | Covers schema evolution gotchas (breaking changes, field removal). |
| Conciseness | 10/15 | Some sections are verbose (Best Practices, Version Strategy are generic). |
| Currency | 12/15 | Claims "60+ IR versions" with examples up to v60 -- actual latest is v63. |
| Actionability | 12/15 | Commands are actionable, but `vim` commands should be neutral editor references. |

**Issues:**
- Version numbers are stale: claims "v58, v59, v60" as examples, but actual latest is v63.
- "Best Practices" section is generic guidance that doesn't add CLAUDE.md value.
- Uses `vim` in command examples -- should use neutral language or just reference the file path.
- The `pnpm generate` command in the "IR SDK Development" section lacks context about which `generate` script this refers to.

**Recommended additions:**
- Update version examples to reflect current state (v63).
- Remove generic "Best Practices" section.
- Add a note about the relationship between `ir-types-latest` and the numbered version that gets frozen from it.

---

### 4. ./packages/seed/CLAUDE.md

**Score: 73/100 (Grade: B)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 17/20 | Excellent command coverage with useful flag combinations. |
| Architecture clarity | 14/20 | Good overview but claims `cli.ts` is "40K+ lines" (actual: ~1,514 lines). |
| Non-obvious patterns | 10/15 | Covers parallel execution and semaphore patterns. |
| Conciseness | 9/15 | Verbose. Parallel Execution System and Performance Optimization sections are padding. |
| Currency | 11/15 | Line count claim is wildly inaccurate. |
| Actionability | 12/15 | Commands are actionable and well-organized. |

**Issues:**
- **Factual error**: Claims `cli.ts` is "40K+ lines" -- actual is ~1,514 lines.
- The "Parallel Execution System" section describes internal implementation details that are not useful for CLAUDE.md context.
- TypeScript code file listing (`TaskContextImpl.ts`, `Semaphore.ts`, `Stopwatch.ts`) gives filenames but no explanation of when/why you'd need to modify them.
- "Best Practices" section is generic advice.

**Recommended additions:**
- Fix the line count claim.
- Remove or condense the Parallel Execution System section.
- Add information about how fixtures map to test definitions (the mapping between `/test-definitions/` and `/seed/`).

---

### 5. ./generators/go/CLAUDE.md

**Score: 80/100 (Grade: B+)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 16/20 | Good commands for both v1 and v2 development. |
| Architecture clarity | 17/20 | Clear tandem system explanation with directory breakdown. |
| Non-obvious patterns | 13/15 | Good coverage of `enableExplicitNull`, import path vs module config. |
| Conciseness | 11/15 | Mostly focused, but "File Patterns" and "Common Go-Specific Patterns" are somewhat generic. |
| Currency | 12/15 | go-v2 directory structure matches reality. |
| Actionability | 11/15 | Commands are actionable. Configuration options well documented. |

**Issues:**
- "Common Go-Specific Patterns" section describes general Go idioms, not project-specific patterns.
- Missing information about how v1 and v2 coordinate in Docker (unlike the Java CLAUDE.md which explains this well).
- No mention of `versions.yml` for the Go generator.

**Recommended additions:**
- Add Docker coordination details (how v1 calls v2).
- Add reference to `versions.yml` for Go SDK versioning.
- Remove generic Go idioms section.

---

### 6. ./generators/python/CLAUDE.md

**Score: 75/100 (Grade: B)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 15/20 | Good v1 and v2 commands, but v1 Poetry commands may be stale. |
| Architecture clarity | 15/20 | Clear tandem explanation. |
| Non-obvious patterns | 11/15 | Good pydantic version compatibility note. |
| Conciseness | 11/15 | Reasonably focused. |
| Currency | 11/15 | python-v2 directory matches reality (includes `browser-compatible-base/` not mentioned). |
| Actionability | 12/15 | Commands are actionable. |

**Issues:**
- The last line ("Add changelogs entries to the relevant versions.yml files. This should happen once per branch") appears to be an orphaned note, possibly pasted in accidentally. It has no section header or context.
- Missing mention of `browser-compatible-base/` sub-package in python-v2 directory listing.
- No information about how v1 and v2 coordinate in Docker (contrast with Java CLAUDE.md).

**Recommended additions:**
- Remove or properly contextualize the orphaned changelog note at the bottom.
- Add `browser-compatible-base/` to the v2 directory listing.
- Add Docker coordination explanation.

---

### 7. ./generators/typescript/CLAUDE.md

**Score: 68/100 (Grade: C+)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 13/20 | Basic commands present but uses `npm` instead of `pnpm`. |
| Architecture clarity | 14/20 | Good "legacy" context, but directory details are thin. |
| Non-obvious patterns | 10/15 | "Legacy" warnings are useful context. Configuration options well listed. |
| Conciseness | 10/15 | "Comparison to Modern Generators" and "Migration Considerations" are somewhat verbose. |
| Currency | 10/15 | Uses `npm` commands -- should verify if this is correct or if pnpm is used. |
| Actionability | 11/15 | Configuration options are specific and useful. |

**Issues:**
- Uses `npm install` / `npm run build` / `npm run test` -- the rest of the monorepo uses `pnpm`. Should verify whether `npm` is actually correct for this subdirectory or if it should be `pnpm`.
- No mention of `generators/typescript-v2/` which exists in the codebase. This is a significant omission -- developers need to know there's a v2.
- "Comparison to Modern Generators" section is subjective commentary ("more complex", "messier patterns") rather than actionable information.
- Missing actual configuration file locations for the TypeScript generator.

**Recommended additions:**
- Verify and fix the package manager (npm vs pnpm).
- Add a note about `generators/typescript-v2/` and its relationship.
- Replace subjective comparison section with concrete differences.

---

### 8. ./generators/java/CLAUDE.md

**Score: 88/100 (Grade: A-)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 17/20 | Good commands for both v1 and v2 with clear build instructions. |
| Architecture clarity | 19/20 | Excellent tandem system explanation with execution flow diagram. Docker multi-stage build documented. |
| Non-obvious patterns | 14/15 | Outstanding documentation of v1-v2 coordination, adapter pattern, Docker packaging. |
| Conciseness | 12/15 | Slightly verbose in places but information density is high. |
| Currency | 13/15 | Detailed and appears current. File paths match actual codebase. |
| Actionability | 13/15 | Execution flow and file references are very specific and useful. |

**Issues:**
- The "Why This Isn't a True Separation Yet" section, while informative, could be more concise.
- Some duplication between this file and `generators/java-v2/CLAUDE.md`.

**Recommended additions:**
- Cross-reference the `generators/java-v2/CLAUDE.md` more explicitly to reduce duplication.
- This is the gold standard for tandem generator documentation -- other tandem generators (Go, Python) should follow this pattern.

---

### 9. ./generators/java-v2/CLAUDE.md

**Score: 90/100 (Grade: A)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 16/20 | Clear build and test commands. Good local development workflow. |
| Architecture clarity | 19/20 | Excellent directory tree, execution flow, and relationship documentation. |
| Non-obvious patterns | 15/15 | Outstanding coverage: notification disabling, adapter pattern, common failure modes with solutions. |
| Conciseness | 13/15 | Information-dense throughout. Future Direction section is speculative but brief. |
| Currency | 14/15 | File paths verified against codebase. Detailed and specific. |
| Actionability | 13/15 | Troubleshooting section with symptom/solution format is excellent. |

**Issues:**
- Minor overlap with `generators/java/CLAUDE.md` (the execution flow is documented in both).
- "Future Direction" section is speculative and may become stale.

**Recommended additions:**
- Consider merging the execution flow documentation into one file and cross-referencing from the other.

---

### 10. ./generators/rust/CLAUDE.md

**Score: 82/100 (Grade: B+)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 16/20 | Good compile and test commands with turbo filters. |
| Architecture clarity | 17/20 | Clear five-package structure with purpose for each. |
| Non-obvious patterns | 14/15 | Filename collision resolution, template variables, dual-generator pattern -- all excellent. |
| Conciseness | 13/15 | Well-focused. No padding. |
| Currency | 11/15 | Appears current but less verified than some others. |
| Actionability | 11/15 | Good but could benefit from more configuration option details. |

**Issues:**
- Configuration options reference source files but don't list the actual options available.
- No mention of Docker setup or how the Rust generator is packaged.

**Recommended additions:**
- Add key configuration options inline (or at least the most common ones).
- Add Docker packaging information.

---

### 11. ./generators/ruby-v2/CLAUDE.md

**Score: 65/100 (Grade: C+)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 13/20 | Basic commands present. |
| Architecture clarity | 12/20 | Directory listing is thin. Legacy ruby directory described but not deeply. |
| Non-obvious patterns | 8/15 | "Standalone Operation" note is useful. Otherwise mostly generic. |
| Conciseness | 9/15 | Multiple sections are generic Ruby guidance rather than project-specific. |
| Currency | 12/15 | Appears current. |
| Actionability | 11/15 | Commands work but configuration options are vague ("Modern TypeScript-based configuration options"). |

**Issues:**
- Configuration Options section is vague: "Modern TypeScript-based configuration options" and "Ruby-specific settings for gem generation" are not actionable.
- "Ruby-Specific Patterns" section describes generic Ruby conventions, not project-specific patterns.
- "Testing and Validation" section is generic checklist advice.
- "Transition Notes" section may become stale as the transition completes.
- No reference to actual configuration schema file location (unlike Rust and C# CLAUDE.md files).

**Recommended additions:**
- Add actual configuration schema file reference.
- Replace generic Ruby patterns with project-specific ones.
- Add concrete configuration options or at minimum the schema file path.

---

### 12. ./generators/csharp/CLAUDE.md

**Score: 83/100 (Grade: B+)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 16/20 | Good compile and test commands with both SDK and model variants. |
| Architecture clarity | 15/20 | Clear directory structure. |
| Non-obvious patterns | 14/15 | Excellent C#-specific requirements (TFM targets, System.Text.Json, nullable handling). |
| Conciseness | 13/15 | Well-focused throughout. |
| Currency | 13/15 | Appears current. Configuration schema file path is specific. |
| Actionability | 12/15 | Configuration schema reference is excellent pattern. Testing guidance is specific. |

**Issues:**
- No Docker packaging information.
- Could benefit from a brief architecture section explaining the relationship between `codegen/`, `sdk/`, and `model/`.

**Recommended additions:**
- Add brief architecture explanation of package relationships.
- Add Docker packaging details.

---

### 13. ./packages/commons/mock-utils/CLAUDE.md

**Score: 0/100 (Grade: F)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 0/20 | Empty file. |
| Architecture clarity | 0/20 | Empty file. |
| Non-obvious patterns | 0/15 | Empty file. |
| Conciseness | 0/15 | N/A - Empty. |
| Currency | 0/15 | N/A - Empty. |
| Actionability | 0/15 | N/A - Empty. |

**Issues:**
- File exists but is completely empty (0 content lines).
- Should either be populated with useful context or removed to avoid confusion.

**Recommended additions:**
- Either add basic package documentation (purpose, commands, key files) or delete the empty file.

---

### 14. ./packages/cli/api-importers/openapi/openapi-ir-to-fern/CLAUDE.md

**Score: 92/100 (Grade: A)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 17/20 | Clear compile, test, and snapshot update commands. Notes separate test package location. |
| Architecture clarity | 19/20 | Excellent: entry point, core components, builder pattern, function table. |
| Non-obvious patterns | 15/15 | Outstanding: schema resolution (root vs namespaced), state tracking, declaration depth, conversion options. |
| Conciseness | 14/15 | Dense and focused. Every section earns its place. |
| Currency | 14/15 | Notes active DEBUG console.log statements -- highly specific and current. |
| Actionability | 13/15 | Options table is immediately useful. Key dependencies listed. |

**Issues:**
- Minor: mentions "DEBUG console.log statements" are "currently active" -- this should be cleaned up or at least tracked.

**Recommended additions:**
- This file is exemplary. Other package-level CLAUDE.md files should follow this pattern.

---

### 15. ./packages/cli/api-importers/openapi/openapi-ir-parser/CLAUDE.md

**Score: 88/100 (Grade: A-)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 16/20 | Good commands including single test file execution. |
| Architecture clarity | 18/20 | Excellent processing flow diagram. Clear directory structure. |
| Non-obvious patterns | 14/15 | Reference resolution, schema conversion recursion, multi-document merging. |
| Conciseness | 14/15 | Very focused and information-dense. |
| Currency | 13/15 | Appears current. File paths verifiable. |
| Actionability | 13/15 | Entry point and key types are clearly identified. |

**Issues:**
- No issues of note. This is a well-crafted CLAUDE.md.

**Recommended additions:**
- None significant. Could optionally add common debugging scenarios.

---

### 16. ./packages/cli/register/src/ir-to-fdr-converter/__test__/CLAUDE.md

**Score: 85/100 (Grade: B+)**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 17/20 | Clear test and snapshot update commands. |
| Architecture clarity | 15/20 | Good pipeline diagram. |
| Non-obvious patterns | 13/15 | "Output matches exactly what gets uploaded to S3" is critical context. |
| Conciseness | 13/15 | Well-focused on testing. |
| Currency | 14/15 | Appears current and specific. |
| Actionability | 13/15 | Full test case template is immediately usable. |

**Issues:**
- Test template code example is quite long -- could be a bit more concise.
- Located deep in the directory tree (`__test__/`) which is unusual for CLAUDE.md placement.

**Recommended additions:**
- Consider if this would be better placed one level up at `ir-to-fdr-converter/CLAUDE.md`.

---

## Coverage Gaps

### Generators Missing CLAUDE.md

The following generators have **no CLAUDE.md file** and would benefit from one:

| Generator | Directory | Priority |
|-----------|-----------|----------|
| PHP | `generators/php/` | Medium |
| Swift | `generators/swift/` | Medium |
| TypeScript v2 | `generators/typescript-v2/` | High -- new generator with no documentation for Claude |
| OpenAPI | `generators/openapi/` | Low |
| Postman | `generators/postman/` | Low |

### Notable Omissions in Root CLAUDE.md

1. **`generators/typescript-v2/`** is not mentioned in the generator-specific documentation list.
2. **`packages/cli/cli-v2/`** sub-package is not documented anywhere.
3. **`generators/base/`** and **`generators/browser-compatible-base/`** shared infrastructure packages are mentioned in passing but have no CLAUDE.md.

---

## Cross-Cutting Issues

### 1. Factual Inaccuracies

Several CLAUDE.md files contain incorrect line counts or package counts that appear to be fabricated or outdated:

| File | Claim | Actual |
|------|-------|--------|
| `packages/cli/CLAUDE.md` | `cli.ts` is "58K+ lines" | ~2,287 lines |
| `packages/seed/CLAUDE.md` | `cli.ts` is "40K+ lines" | ~1,514 lines |
| `packages/cli/CLAUDE.md` | "28 specialized packages" | 32 directories |
| `packages/ir-sdk/CLAUDE.md` | "60+ IR versions" up to v60 | Goes up to v63 |

These inaccuracies suggest the files were generated programmatically without verification. They should be corrected or the specific line counts removed entirely (they add little value).

### 2. Generic Content Inflation

Several files contain sections that read like generic best practices documentation rather than CLAUDE.md context:

- **Best Practices** sections (CLI, IR SDK, Seed) -- generic software engineering advice
- **Architecture Patterns** code examples (CLI) -- placeholder code, not actual codebase patterns
- **Language-Specific Patterns** (Go, Ruby) -- describe general language idioms, not project-specific ones
- **Version Management System** (CLI) -- generic versioning advice

These sections inflate file size without helping Claude Code be more effective. CLAUDE.md should contain information that is **non-obvious from reading the code**.

### 3. Inconsistent Quality

There is a stark quality difference between files:

- **Excellent** (A/A-): `openapi-ir-to-fern`, `openapi-ir-parser`, `java-v2`, `java` -- specific, dense, actionable
- **Good** (B/B+): Root CLAUDE.md, `rust`, `csharp`, `go` -- solid but with some padding
- **Mediocre** (C+): `typescript`, `ruby-v2` -- too generic, vague configuration docs
- **Empty** (F): `mock-utils` -- completely empty file

### 4. Tandem Generator Documentation Inconsistency

The Java tandem system (v1 + v2) is exceptionally well documented with execution flows, Docker packaging details, and adapter patterns. The Go and Python tandem systems lack comparable detail about their coordination mechanisms.

---

## Recommendations Summary

### High Priority

1. **Fix factual inaccuracies** -- Remove or correct fabricated line counts and package counts across CLI, Seed, and IR SDK CLAUDE.md files.
2. **Create `generators/typescript-v2/CLAUDE.md`** -- This generator exists but has zero documentation for Claude Code.
3. **Fix the orphaned line** in `generators/python/CLAUDE.md` ("Add changelogs entries...").
4. **Remove or populate `packages/commons/mock-utils/CLAUDE.md`** -- An empty file is misleading.
5. **Fix path typo** in root CLAUDE.md: `packages/generation/ir-migrations/` should be `packages/cli/generation/ir-migrations/`.

### Medium Priority

6. **Remove generic padding sections** from CLI, IR SDK, Seed, Ruby-v2, and Go CLAUDE.md files. Focus on non-obvious, project-specific information.
7. **Add Docker coordination details** to Go and Python tandem generator docs (follow Java's example).
8. **Add configuration schema file references** to Ruby-v2 CLAUDE.md (follow Rust and C# pattern).
9. **Update IR version numbers** in IR SDK CLAUDE.md to reflect v63.
10. **Verify npm vs pnpm** in TypeScript generator CLAUDE.md.

### Low Priority

11. Create CLAUDE.md files for PHP and Swift generators.
12. Consider extracting TypeScript rules from root CLAUDE.md into a separate referenced file.
13. Reduce duplication between `generators/java/CLAUDE.md` and `generators/java-v2/CLAUDE.md`.
14. Add CLAUDE.md for `generators/base/` shared infrastructure package.

---

## Scoring Summary Table

| File | Score | Grade |
|------|-------|-------|
| `./CLAUDE.md` (root) | 91 | A |
| `./packages/cli/api-importers/openapi/openapi-ir-to-fern/CLAUDE.md` | 92 | A |
| `./generators/java-v2/CLAUDE.md` | 90 | A |
| `./packages/cli/api-importers/openapi/openapi-ir-parser/CLAUDE.md` | 88 | A- |
| `./generators/java/CLAUDE.md` | 88 | A- |
| `./packages/cli/register/src/ir-to-fdr-converter/__test__/CLAUDE.md` | 85 | B+ |
| `./generators/csharp/CLAUDE.md` | 83 | B+ |
| `./generators/rust/CLAUDE.md` | 82 | B+ |
| `./generators/go/CLAUDE.md` | 80 | B+ |
| `./packages/ir-sdk/CLAUDE.md` | 78 | B |
| `./generators/python/CLAUDE.md` | 75 | B |
| `./packages/cli/CLAUDE.md` | 74 | B |
| `./packages/seed/CLAUDE.md` | 73 | B |
| `./generators/typescript/CLAUDE.md` | 68 | C+ |
| `./generators/ruby-v2/CLAUDE.md` | 65 | C+ |
| `./packages/commons/mock-utils/CLAUDE.md` | 0 | F |

**Tip**: During a Claude Code session, press `#` to have Claude auto-incorporate learnings into CLAUDE.md files. Use `.claude.local.md` for personal preferences (add to `.gitignore`).
