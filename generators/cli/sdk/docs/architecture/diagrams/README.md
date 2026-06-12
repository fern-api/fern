# Architecture diagrams

These files are [Mermaid](https://mermaid.js.org/) sources. GitHub renders
them natively in markdown when embedded in a fenced ` ```mermaid ` block.

| File | View | What it shows |
|---|---|---|
| [`01-context.mmd`](./01-context.mmd) | C4 — System Context | Spec sources, invokers, target APIs |
| [`02-containers.mmd`](./02-containers.mmd) | C4 — Container | `[lib]` vs `[[bin]]` split, protocol-path isolation |
| [`03-component-shared.mmd`](./03-component-shared.mmd) | C4 — Component | Shared infra above both protocol paths |
| [`04-component-openapi.mmd`](./04-component-openapi.mmd) | C4 — Component | OpenAPI protocol path |
| [`05-component-graphql.mmd`](./05-component-graphql.mmd) | C4 — Component | GraphQL protocol path (reference implementation) |
| [`06-runtime-request.mmd`](./06-runtime-request.mmd) | Sequence | CLI invocation lifecycle (auth → request → format → emit) |

## Embedding a diagram in a markdown doc

```markdown
\`\`\`mermaid
%% paste contents of 01-context.mmd here
\`\`\`
```

## Local rendering

```bash
# Install once:
npm install -g @mermaid-js/mermaid-cli
# Render any diagram to SVG:
mmdc -i 01-context.mmd -o 01-context.svg
```

## Conventions

- Light-blue fill = inside `fern-cli-sdk`.
- Green fill = shared infrastructure (above both protocol paths).
- Orange fill = OpenAPI protocol path (intentionally isolated).
- Light-blue fill (deeper) = GraphQL protocol path (intentionally isolated).
- Dashed link between the two protocol paths = "no shared abstractions"
  ([§8.2](../ARCHITECTURE.md#82-protocol-path-isolation)).
