# Library Docs Generator - Implementation Plan

**Location:** `packages/cli/library-docs-generator/` in fern CLI repo
**Branch:** `paarth/library-docs-generator`
**Status:** Iteration 10 complete (Integration Test) — all iterations done

## Design Decisions

### 1. Use FDR Types
- **Import:** `import type { FdrAPI } from "@fern-api/fdr-sdk"` — all types live under `FdrAPI.*` (not `FernRegistry`; the SDK re-exports `FernRegistry` as `FdrAPI`)
- **Input:** `FdrAPI.libraryDocs.PythonLibraryDocsIr`
- **Navigation Output:** `FdrAPI.navigation.v1.SectionNode`
- Keeps us in sync as FDR types evolve

### 2. Stream to Disk (Memory Efficient)
- Do NOT hold all `pages` in memory
- Write each MDX file immediately as we render
- Only keep navigation `SectionNode` in memory

### 3. Public API

```typescript
import type { FdrAPI } from "@fern-api/fdr-sdk";

interface GenerateOptions {
    ir: FdrAPI.libraryDocs.PythonLibraryDocsIr;
    outputDir: string;
    slug: string;
    title: string;
}

interface GenerateResult {
    navigationNode: FdrAPI.navigation.v1.SectionNode;
    writtenFiles: string[];
    pageCount: number;
}

function generate(options: GenerateOptions): Promise<GenerateResult>;
```

## Migration Process

Each component is ported from the FDR server (`servers/fdr/src/services/library-docs/renderer/`) into this standalone package. This is not a blind copy — every component goes through a review-and-improve pass during migration:

### Code Review & Improvement Checklist
For each component being ported, evaluate and fix:
1. **Type safety** — Remove redundant null/truthy checks where the IR type guarantees a value (e.g. array fields are always arrays, not `| undefined`). Use the `FdrAPI.*` types as the source of truth.
2. **Correct escape function** — Audit every `escapeMdx` call. Text that could contain fenced code blocks (descriptions, notes, warnings, returns descriptions) should use `escapeMdxPreservingCodeBlocks` instead. Only use `escapeMdx` for short identifiers (type names, default values, exception types) or text inside JSX component children where code blocks don't render reliably.
3. **Dead code / unnecessary abstractions** — Remove any code that only existed for the server context (Express middleware, Lambda SDK wrappers, etc.). Don't carry over indirection that doesn't serve the CLI use case.
4. **Naming clarity** — Rename vague names to be self-documenting (e.g. `escapeMdxForDescription` → `escapeMdxPreservingCodeBlocks`).
5. **Conciseness** — Collapse verbose patterns (e.g. multi-line `lines.push(a); lines.push(""); lines.push(b);` → single `lines.push(a, "", b)` where it helps readability).

### Testing with NeMo IR Fixtures
Every component must include tests against real data extracted from the NeMo-RL IR (`nemo_rl_ir.json` in fern-platform). This catches issues that synthetic unit tests miss:
- **Fixture source**: `servers/fdr/src/services/library-docs/__test__/nemo-rl-docs/nemo_rl_ir.json` in `fern-platform`
- **Fixture location**: `src/__test__/fixtures/` — extract the relevant subset (docstrings, functions, classes, modules) into small focused JSON files per component
- **What to test**: Feed real IR data through the renderer and assert on structural properties of the output (contains expected sections, correct escaping, proper MDX structure). Don't snapshot the full output — assert on meaningful properties so tests aren't brittle.
- **Why**: Real docstrings contain edge cases we'd never think to synthesize — math notation (`$rA$`), `{doctest}` language tags on code blocks, multi-line param descriptions with indented lists, Unicode characters (θ, ε, π), etc.

## Iterations

### ✅ Iteration 1: Package Scaffolding
- [x] package.json, tsconfig.json, src/index.ts
- [x] Compiles successfully

### ✅ Iteration 2: MDX Utilities
- [x] `src/utils/mdx.ts` - escapeMdx, escapeMdxPreservingCodeBlocks, generateAnchorId, formatTypeAnnotation, createFrontmatter, escapeTableCell
- [x] `src/__test__/mdx.test.ts` - 33 tests covering all functions

### ✅ Iteration 3: Type Link Resolver
- [x] `src/utils/TypeLinkResolver.ts` - buildTypeLinkData, extractLinksFromTypes, getTypeDisplay, getTypePathForSignature, linkTypeInfo, renderCodeBlockWithLinks, formatSignatureMultiline
- [x] `src/__test__/TypeLinkResolver.test.ts` - 54 tests covering all functions

### ✅ Iteration 4: Docstring Renderer
- [x] `src/renderers/DocstringRenderer.ts` - renderDocstring, renderSimpleDocstring
- [x] `src/__test__/DocstringRenderer.test.ts` - 49 tests (41 unit + 8 NeMo fixture)
- [x] `src/__test__/fixtures/nemo-docstrings.json` - Real docstrings from nemo_rl IR
- Improvements over FDR server version:
  - Removed redundant null checks on array fields (params, raises, examples, notes, warnings are always arrays)
  - Uses `escapeMdxPreservingCodeBlocks` for description text in returns, examples, notes, warnings (FDR server used `escapeMdx` which would mangle code blocks)
  - Keeps `escapeMdx` for param descriptions inside `<ParamField>` JSX context

### ✅ Iteration 5: Function Renderer
- [x] `src/renderers/FunctionRenderer.ts` - renderFunctionDetailed, renderMethodDetailed, renderProperty
- [x] `src/__test__/FunctionRenderer.test.ts` - 38 tests (33 unit + 5 NeMo fixture)
- [x] `src/__test__/fixtures/nemo-functions.json` - Real functions from nemo_rl IR
- [x] `vitest.config.ts` - Restrict test discovery to `src/` (fixes duplicate lib/ test runs)
- Improvements over FDR server version:
  - Uses FdrAPI types directly instead of FdrLambda
  - Uses `??` instead of `||` for null coalescing on `param.default` (avoids false-positive on empty string defaults)
  - Collapsed verbose multi-line `lines.push` patterns

### ✅ Iteration 6: Class Renderer
- [x] `src/renderers/ClassRenderer.ts` - renderClassDetailed (dispatches to regular/TypedDict/Enum renderers)
- [x] `src/__test__/ClassRenderer.test.ts` - 53 tests (46 unit + 7 NeMo fixture)
- [x] `src/__test__/fixtures/nemo-classes.json` - Real classes from nemo_rl IR (7 classes covering all kinds)
- Improvements over FDR server version:
  - Uses FdrAPI types directly instead of FdrLambda
  - Uses `||` instead of `??` for TypedDict field type fallback (fixes `getTypeDisplay` returning `""` instead of null)
  - Collapsed verbose multi-line `lines.push` patterns

### ✅ Iteration 7: Module Renderer
- [x] `src/renderers/ModuleRenderer.ts` - renderModulePage, renderAllModulePages, renderSubmodulesSection, renderAttributeDetailed
- [x] `src/__test__/ModuleRenderer.test.ts` - 44 tests (38 unit + 6 NeMo fixture)
- [x] `src/__test__/fixtures/nemo-modules.json` - Real modules from nemo_rl IR (5 modules: leaf mixed, attributes-only, package with content, with docstring, submodules-only)
- Improvements over FDR server version:
  - Uses FdrAPI types directly instead of FdrLambda
  - Removed redundant null checks on array fields (submodules, classes, functions, attributes are always arrays)
  - Collapsed verbose multi-line `lines.push` patterns

### ✅ Iteration 8: File Writers
- [x] `src/writers/MdxFileWriter.ts` - MdxFileWriter class with streaming writePage() and result()
- [x] `src/writers/NavigationBuilder.ts` - buildNavigation(), NavNode/NavPageNode/NavSectionNode types
- [x] `src/__test__/writers.test.ts` - 20 tests (7 MdxFileWriter + 10 NavigationBuilder unit + 3 NeMo fixture)
- Design notes:
  - MdxFileWriter is a stateful class for streaming: writePage() writes immediately, result() returns accumulated stats
  - NavigationBuilder is a pure function — builds NavNode[] tree from module IR without touching page content
  - Both designed for the streaming architecture: render each page → write immediately → never hold all pages in memory

### ✅ Iteration 9: Main Generator
- [x] `src/PythonDocsGenerator.ts` - generate() orchestrates: buildTypeLinkData → RenderContext → streaming render+write → navigation
- [x] `src/__test__/PythonDocsGenerator.test.ts` - 12 unit tests (basic behavior, file writing, content, navigation, type links, deep nesting)
- [x] `src/index.ts` - exports generate(), GenerateOptions, GenerateResult, NavNode types
- Design notes:
  - Synchronous (all I/O is writeFileSync via MdxFileWriter)
  - renderModuleTree() traverses the IR and writes each page immediately (streaming)
  - Returns NavNode[] navigation (consumer wraps in whatever format needed)
  - rootPageId identifies the root module overview page

### ✅ Iteration 10: Integration Test
- [x] `src/__test__/integration.test.ts` - 16 tests with composed NeMo-RL fixture
- Composes a realistic IR from existing NeMo module fixtures (root + 3 submodules + nested leaf)
- Validates: page count, file paths, frontmatter, content structure, navigation hierarchy, type links

## Current Files

```
packages/cli/library-docs-generator/
├── package.json          ✅
├── tsconfig.json         ✅
├── vitest.config.ts      ✅
├── IMPLEMENTATION_PLAN.md ✅
└── src/
    ├── index.ts          ✅ (empty placeholder)
    ├── utils/
    │   ├── mdx.ts            ✅
    │   └── TypeLinkResolver.ts ✅
    ├── renderers/
    │   ├── DocstringRenderer.ts   ✅
    │   ├── FunctionRenderer.ts    ✅
    │   ├── ClassRenderer.ts       ✅
    │   └── ModuleRenderer.ts      ✅
    ├── writers/
    │   ├── MdxFileWriter.ts       ✅
    │   └── NavigationBuilder.ts   ✅
    └── __test__/
        ├── fixtures/
        │   ├── nemo-docstrings.json   ✅
        │   ├── nemo-functions.json    ✅
        │   ├── nemo-classes.json      ✅
        │   └── nemo-modules.json      ✅
        ├── mdx.test.ts                ✅
        ├── TypeLinkResolver.test.ts   ✅
        ├── DocstringRenderer.test.ts  ✅
        ├── FunctionRenderer.test.ts   ✅
        ├── ClassRenderer.test.ts      ✅
        ├── ModuleRenderer.test.ts     ✅
        └── writers.test.ts            ✅
```

## Next Step

Run `/clear` then continue with **Iteration 9: Main Generator**
