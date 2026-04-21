# Autoresearch: TypeScript SDK Generator Performance

This is an experiment to have an LLM autonomously optimize the Fern TypeScript SDK generator's performance.

## Setup

To set up a new experiment, work with the user to:

1. **Agree on a run tag**: propose a tag based on today's date (e.g. `apr20`). The branch `autoresearch/<tag>` must not already exist.
2. **Create the branch**: `git checkout -b autoresearch/<tag>` from current main.
3. **Read the in-scope files**: The generator codebase is large but focused. Read these for full context:
   - `autoresearch/program.md` — this file, your strategy document.
   - `autoresearch/results.tsv` — experiment history.
   - `generators/typescript/sdk/generator/src/SdkGenerator.ts` — main orchestrator (2,200+ lines). THE primary optimization target.
   - `generators/typescript/utils/commons/src/typescript-project/TypescriptProject.ts` — file I/O (persist, writeVolumeToDisk). THE primary I/O bottleneck.
   - `generators/typescript/utils/commons/src/exports-manager/ExportsManager.ts` — barrel file generation.
   - `generators/typescript/sdk/cli/src/SdkGeneratorCli.ts` — CLI entry point, calls generateTypescriptProject().
4. **Verify build works**: `pnpm turbo run dist:cli --filter @fern-typescript/sdk-generator-cli`
5. **Verify benchmark works**: `./autoresearch/benchmark.sh 1 --quick`
6. **Confirm and go**: Confirm setup looks good with the user.

Once you get confirmation, kick off the experimentation.

## Experimentation

Each experiment optimizes the TypeScript SDK generator and benchmarks against Square's OpenAPI spec.

**The benchmark command**: `./autoresearch/benchmark.sh`
- Compiles the generator via turbo (incremental)
- Runs `pnpm seed:local run --generator ts-sdk --path benchmarks/fern/apis/square --skip-scripts` 3 times
- Reports median duration in milliseconds
- Validates correctness against baseline SHA-256 manifest

**What you CAN do:**
- Modify any file under `generators/typescript/` — this is the only directory you edit.
- Architecture changes, algorithmic optimizations, I/O improvements, caching, parallelization, reducing ts-morph overhead — everything is fair game.

**What you CANNOT do:**
- Modify `packages/seed/`, `packages/cli/`, `packages/ir-sdk/`, `benchmarks/`, `.github/`.
- Install new packages or add dependencies.
- Modify the benchmark harness (`autoresearch/benchmark.sh`).
- Break the generated output — the SDK must still be valid TypeScript.

**The goal is simple: get the lowest median_e2e_ms.** The primary metric is the full `pnpm seed:local run` wall-clock time, which matches what PostHog tracks in CI (~100s on GitHub Actions). The seed-reported "Generation Time" is tracked as a secondary metric for deeper insight. Everything is fair game within the generator code.

**Current baseline**: e2e=38,596ms, gen=18,400ms (1,987 generated files from Square's OpenAPI spec, local machine).

**Correctness is a hard constraint.** If the generated output changes, it must still compile with `tsc --noEmit`. If the file structure changes (files added/removed), investigate carefully. Identical output to baseline is always safe.

**Simplicity criterion**: All else being equal, simpler is better. A small improvement that adds ugly complexity is not worth it. Removing code and getting equal or better results is a great outcome.

## Architecture Understanding

The TypeScript SDK generator pipeline has three phases:

### Phase 1: Generation (SdkGenerator.ts)
```
SdkGeneratorCli.generateTypescriptProject()
  -> new SdkGenerator(context)
  -> generator.generate(tsMorphProject)
    -> copyAsIsFiles()
    -> generateTypeDeclarations()         # iterates IR types
    -> generateErrorDeclarations()        # iterates IR errors
    -> generateWebSocketClients()         # iterates IR websocket channels
    -> generateBaseClientTypes()          # iterates IR services
    -> generateServiceDeclarations()      # iterates IR services + endpoints
    -> generateRequestWrappers()          # iterates IR services + endpoints
    -> generateVersionInfo()
    -> generateAuthProviders()
    -> generateWebhooksHelper()
    -> generateSdkErrorUnions()           # conditional, iterates endpoints
    -> generateErrorSchemas()             # conditional, iterates errors
    -> generateTypeSchemas()              # conditional, iterates types
    -> generateEndpointTypeSchemas()      # conditional, iterates endpoints
    -> generateTests()                    # conditional, iterates endpoints
    -> publicExportsManager.generatePublicExportsFiles()  # barrel files
```

### Phase 2: Persist (TypescriptProject.ts)
```
project.persist()
  -> writeSrcToVolume()         # ts-morph SourceFiles -> memfs (getFullText() per file)
  -> writeExtraFiles()          # config files -> memfs
  -> addFilesToVolume()         # package.json, tsconfig, gitignore -> memfs
  -> writeVolumeToDisk()        # memfs -> real filesystem (SEQUENTIAL per-file)
```

### Phase 3: Output
The persisted project directory is returned to the seed runner for output.

## Optimization Categories (Ranked by Expected Impact)

### A. File I/O — writeVolumeToDisk (~30-40% of time)
**Current**: `writeVolumeToDiskRecursive` reads from memfs and writes to real FS sequentially, one file at a time. Each file does `mkdir(recursive: true)` + `writeFile()`.
**Ideas**:
- Parallel file writes with `Promise.all()` (batched to avoid fd exhaustion)
- Skip memfs entirely — write directly to disk during generation
- Pre-create directory tree in one pass, then write files without mkdir per-file
- Use `fs.promises.writeFile` with pre-allocated buffers

### B. ts-morph Overhead (~20-30% of time)
**Current**: Every `SourceFile.getFullText()` call in `writeSrcToVolume()` triggers ts-morph's internal formatting/printing. This is called once per generated file.
**Ideas**:
- Build source files as raw strings instead of ts-morph AST nodes where possible
- Cache `getFullText()` results if files are read multiple times
- Use ts-morph's `print()` with minimal formatting options
- For simple/template-like files, skip ts-morph entirely and use string concatenation

### C. Generation Loops (~15-20% of time)
**Current**: Each sub-generator (types, errors, services, schemas) iterates the IR independently. Each creates new SourceFile, ImportsManager, FileContextImpl instances.
**Ideas**:
- Object pooling for ImportsManager/FileContextImpl
- Batch file creation in ts-morph (reduce per-file overhead)
- Lazy initialization of sub-generators (only create when needed)
- Parallelize independent generation phases (types and errors are independent)

### D. Export Management (~5-10% of time)
**Current**: `PublicExportsManager.generatePublicExportsFiles()` traverses the directory tree to create barrel files (index.ts) for every directory.
**Ideas**:
- Pre-compute export map during generation instead of post-hoc traversal
- Generate barrel files inline during type/service generation
- Reduce number of barrel files for deeply nested structures

### E. Miscellaneous
- `copyAsIsFiles()` — could be parallelized
- Snippet JSON serialization
- README/reference generation
- Import resolution and deduplication

## The Experiment Loop

LOOP FOREVER:

1. Look at the git state: the current branch/commit
2. Decide on an optimization idea based on the categories above and past results
3. Implement the change in `generators/typescript/`
4. `git commit -m "exp-NNN: <description>"`
5. Run the benchmark: `./autoresearch/benchmark.sh > /tmp/autoresearch-result.log 2>&1`
6. Read the results: `grep "^median_ms:\|^status:\|^validation:" /tmp/autoresearch-result.log`
7. If status is not "ok", the run crashed. Read `tail -50 /tmp/autoresearch-result.log` for the error and attempt a fix. If you can't fix after 2 attempts, give up on this idea.
8. Record the results in `autoresearch/results.tsv`
9. If median_e2e_ms improved (lower), KEEP: advance the branch
10. If median_e2e_ms is equal or worse, DISCARD: `git reset --hard HEAD~1`

**Timeout**: Each benchmark run should complete within 5 minutes. If it hangs, kill it and treat as a failure.

**Crashes**: If a run crashes (compile error, runtime error), use judgment: fix typos/imports and re-run, or skip the idea entirely.

**NEVER STOP**: Once the experiment loop has begun, do NOT pause to ask the human. The human might be asleep. You are autonomous. If you run out of ideas, think harder — re-read the source files, look for patterns in what worked, try combining near-misses, try more radical changes. The loop runs until the human interrupts you.
