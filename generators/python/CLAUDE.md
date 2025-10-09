# Python Generator (v1 + v2 Tandem)

This file provides guidance for Claude Code when working with the Python generator system.

## Architecture

The Python generator operates as a **tandem system** with both v1 and v2 implementations:

- **v1 (generators/python/)**: Native Python implementation (legacy)
  - Written in Python using uv for dependency management
  - Generates: SDK, Pydantic models, FastAPI server
  - Contains extensive configuration options

- **v2 (generators/python-v2/)**: TypeScript-based implementation (modern)
  - Written in TypeScript with cleaner architecture
  - Structured as: `ast/`, `base/`, `fastapi/`, `pydantic-model/`, `sdk/`
  - Uses improved patterns from newer generator design

- **Docker Integration**: Both v1 and v2 run in a single Docker image and coordinate during generation

## Key Directories

### Python v1 (generators/python/)
- `sdk/` - SDK generation logic
- `fastapi/` - FastAPI server generator
- `pydantic/` - Pydantic model generator
- `core_utilities/` - Shared Python utilities
- `tests/` - Python-specific test suite
- `pyproject.toml` - uv configuration
- `requirements.txt` - Python dependencies

### Python v2 (generators/python-v2/)
- `ast/` - Python AST utilities (TypeScript)
- `base/` - Base generator infrastructure
- `sdk/` - SDK generator (TypeScript)
- `fastapi/` - FastAPI server generator (TypeScript)
- `pydantic-model/` - Pydantic model generator (TypeScript)
- `formatter/` - Code formatting utilities

## Common Issues & Debugging

### v1 (Native Python) Issues
- **Dependency lock conflicts**: Run `uv sync --extra dev` in generators/python/
- **Python dependency issues**: Check `requirements.txt` and `pyproject.toml`
- **Formatting issues**: v1 uses Black formatting (can be disabled with `skip_formatting: true`)
- **Pydantic version conflicts**: Check `pydantic_config.version` setting ("v1", "v2", "both", "v1_on_v2")

### v2 (TypeScript) Issues
- **TypeScript compilation**: Standard TS generator patterns apply
- **AST generation**: Issues often in `ast/` utilities
- **Coordination with v1**: Check how v1/v2 responsibilities are divided

### Tandem Operation Issues
- **Version mismatches**: Ensure IR versions are compatible between v1 and v2
- **Docker build failures**: Both generators must build successfully in single image
- **Output conflicts**: Check that v1 and v2 don't overwrite each other's outputs

## Development Commands

### Python v1 Development
```bash
cd generators/python
uv run pytest tests/
```

### Python v2 Development
```bash
cd generators/python-v2
pnpm install
pnpm compile
```

### Testing Both Generators
```bash
# From repository root
pnpm seed test --generator python-sdk --fixture <fixture-name> --skip-scripts
pnpm seed run --generator python-sdk --path /path/to/test/project --skip-scripts
```

## Configuration Options

The Python generator supports extensive configuration in `generators.yml`:

### SDK Generator
- `timeout_in_seconds`: Request timeout (default: 60)
- `client_class_name`: Custom client class name
- `skip_formatting`: Disable Black formatting
- `extra_dependencies`: Add custom PyPI dependencies
- `pydantic_config.version`: Pydantic compatibility ("v1", "v2", "both", "v1_on_v2")
- `pydantic_config.include_union_utils`: Generate union visitor utilities

### FastAPI Generator
- `async_handlers`: Generate async endpoint handlers
- `pydantic_config.version`: Pydantic compatibility
- `skip_formatting`: Disable Black formatting

### Pydantic Generator
- `version`: Pydantic compatibility mode

## Debug Patterns

1. **Generator failures**: Check both v1 Python logs and v2 TypeScript compilation
2. **Output issues**: Compare v1 vs v2 generated files to identify source
3. **Docker problems**: Verify both generators build in the Docker environment
4. **IR compatibility**: Ensure both v1 and v2 support the required IR version

## File Patterns

- **Generated Python code**: Uses Black formatting (unless disabled)
- **Import patterns**: v1 uses Python import conventions, v2 follows TS generator patterns
- **Error handling**: Different between v1 (Python exceptions) and v2 (TS error patterns)
