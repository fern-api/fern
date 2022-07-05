# Frequently Asked Questions

## 1. How is Fern different than OpenAPI (f.k.a Swagger)?

- **Higher quality code generation**: Fern is more restrictive in what you can model, enabling idiomatic, easy to use code generation.

- **Protocol agnostic**: Fern let's you define RESTful services alongside WebSocket subscriptions.

- **Managed code generation**: Fern runs code generators remotely and manages publishing packages to registries (e.g., npm, maven, pypi). You get a dependency that you can start using right away.

## 2. How does remote code generation work?

Code generators run remotely in the cloud. They take a set of Fern API Definition YAML files, run the generators listed in `.fernrc.yml`, and product generated files as an output. Files can output locally (i.e., seen in the file system of your IDE) or remotely (i.e., in a package manager like npm, maven, or pypi).

### Generating clients

![client generators](assets/diagrams/frontend-diagram.png)

### Generating servers

![server generators](assets/diagrams/backend-diagram.png)
