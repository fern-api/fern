# `docs/architecture/`

Architecture documentation for `fern-cli-sdk`.

| File | What it is |
|---|---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | The arc42-lite system architecture document — start here. |
| [`diagrams/`](./diagrams/) | C4-style Mermaid diagrams (context, container, components, runtime). See [`diagrams/README.md`](./diagrams/README.md). |
| [`decisions/INDEX.md`](./decisions/INDEX.md) | Index of formal ADRs (at [`docs/adr/`](../adr/)) and implicit decisions in `AGENTS.md` / Linear / commit history. |
| [`CHANGELOG-ARCH.md`](./CHANGELOG-ARCH.md) | Running log of architecture-shaping changes. Authoring guidance inside. |
| [`automation/`](./automation/) | Playbook + sources config for the scheduled multi-source agent that keeps this directory fresh. See [`automation/README.md`](./automation/README.md). |

## Reading order for a new contributor

1. [`../../README.md`](../../README.md) — what the project does, end-user
   shape.
2. [`../../AGENTS.md`](../../AGENTS.md) — source-of-truth layout reference,
   test layers, changeset policy, the *load-bearing* constraint (no shared
   abstractions between protocol paths).
3. [`ARCHITECTURE.md`](./ARCHITECTURE.md) §1 (goals) and §3 (context) — the
   "what's inside the box vs outside" view.
4. [`diagrams/01-context.mmd`](./diagrams/01-context.mmd) and
   [`02-containers.mmd`](./diagrams/02-containers.mmd) — the picture.
5. [`ARCHITECTURE.md`](./ARCHITECTURE.md) §5 (building blocks) and §8
   (cross-cutting concepts) — the layers and the rules.
6. [`decisions/INDEX.md`](./decisions/INDEX.md) — the *why* behind the *what*.

## Relationship to other docs

| Doc | Owns |
|---|---|
| [`README.md`](../../README.md) | User-facing — install, usage, bundled CLIs |
| [`AGENTS.md`](../../AGENTS.md) | Contributor-facing — source layout, test layers, conventions |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Architect-facing — system shape, why it's shaped that way |
| [`LIBRARY_DESIGN.md`](../../LIBRARY_DESIGN.md), [`DESIGN.md`](../../DESIGN.md), [`PLAN_A_TYPED_FLAGS.md`](../../PLAN_A_TYPED_FLAGS.md), [`LIBRARY_PLAN.md`](../../LIBRARY_PLAN.md) | In-flight feature design and plan docs — distilled into `ARCHITECTURE.md` once they land |
| [`ROADMAP_TRACKER.md`](../../ROADMAP_TRACKER.md) | Live checkbox tracker — orthogonal to this directory |

When an in-flight plan lands, the durable architectural outcome should be
distilled into [`ARCHITECTURE.md`](./ARCHITECTURE.md) and (if applicable) a
new ADR; the plan doc itself can be archived. The plan / arch split keeps
the architecture doc stable while plans churn.
