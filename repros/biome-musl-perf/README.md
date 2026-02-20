# Biome performance regression on Alpine Linux (musl)

Minimal reproduction for a significant performance regression when running Biome inside an Alpine-based Docker container (musl libc).

## The Problem

Running `biome check --fix` on a generated TypeScript SDK (~322 files, ~1.6 MB) is **~15x slower** on Alpine Linux (musl) compared to glibc-based systems.

| Environment | Biome self-reported time | Libc |
|---|---|---|
| Native Linux (host) | **119ms** | glibc |
| Docker Debian (`node:22-bookworm-slim`) | **119ms** | glibc |
| Docker Alpine (`node:22-alpine3.20`) | **1731ms** | musl |

The slowdown is specific to **musl libc** — the Debian-based Docker container performs identically to native. This is likely related to musl's memory allocator performance characteristics with Rust binaries.

## Context

We use Biome as the default linter/formatter in our [TypeScript SDK code generator](https://github.com/fern-api/fern). The generator runs inside a Docker container based on `node:22.12-alpine3.20`. Code generation itself takes ~4 seconds, but running Biome adds ~30 seconds on some machines, making it the dominant cost.

The Biome command used during generation:
```
biome check --fix --unsafe --skip-parse-errors --no-errors-on-unmatched --max-diagnostics=none
```

## Reproduction

### Prerequisites
- Docker
- Node.js >= 18
- pnpm (`npm install -g pnpm`)

### Quick Benchmark

```bash
cd sdk && pnpm install && cd ..
./benchmark.sh
```

### Manual Reproduction

**Alpine (slow — musl):**
```bash
docker build -t biome-repro .
docker run --rm biome-repro -c \
  "./node_modules/.bin/biome check --fix --unsafe --skip-parse-errors --no-errors-on-unmatched --max-diagnostics=none"
# Look for "Checked 324 files in Xms" — expect ~1700ms
```

**Debian (fast — glibc):**
```bash
docker build -t biome-repro-debian -f Dockerfile.debian .
docker run --rm biome-repro-debian -c \
  "./node_modules/.bin/biome check --fix --unsafe --skip-parse-errors --no-errors-on-unmatched --max-diagnostics=none"
# Look for "Checked 324 files in Xms" — expect ~120ms
```

## Environment

- **Biome version**: 2.3.11
- **Alpine image**: `node:22.12-alpine3.20`
- **Debian image**: `node:22.12-bookworm-slim`
- **File count**: 322 TypeScript files (~1.6 MB total)

## Files

```
.
├── Dockerfile           # Alpine-based (musl) — slow
├── Dockerfile.debian    # Debian-based (glibc) — fast
├── benchmark.sh         # Compares native vs Alpine vs Debian
├── .dockerignore
├── README.md
└── sdk/
    ├── biome.json       # Biome configuration
    ├── package.json     # Only @biomejs/biome as a dependency
    └── src/             # 322 TypeScript files from a generated SDK
```

## Source of TypeScript Files

The `sdk/src/` directory contains output from the [Fern TypeScript SDK generator](https://github.com/fern-api/fern/tree/main/generators/typescript/sdk) using the "trace" API definition. These are real generated files, not synthetic test data.
