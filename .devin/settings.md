# Devin Settings for fern-api/fern

## Pull Request Title Rules

PR titles are validated by CI (`.github/workflows/lint-pr-title.yml`) using [semantic-pull-request](https://github.com/amannn/action-semantic-pull-request). Both type and scope are **required**.

**Format**: `<type>(<scope>): <description>`

**Allowed types**: `fix`, `feat`, `revert`, `break`, `chore`

**Allowed scopes**: `docs`, `changelog`, `internal`, `cli`, `typescript`, `python`, `java`, `csharp`, `go`, `php`, `ruby`, `seed`, `ci`, `lint`, `fastapi`, `spring`, `express`, `openapi`, `deps`, `deps-dev`, `fiber`, `pydantic`, `ai-search`, `swift`, `rust`

**Examples**:
- `chore(docs): update guidelines`
- `feat(python): add new feature`
- `fix(cli): resolve config loading bug`

## Pull Request Guidelines

- **Assignee**: Always assign the person who prompted you to create the PR as the assignee.
- **Description**: Follow the PR template in `.github/pull_request_template.md`.
- **Testing**: Ensure all tests pass before marking PR as ready for review.
