# IR Migrations Package

This package handles migration of Intermediate Representation (IR) between versions for backward compatibility with older generators.

## Dynamic Generator Version Map

The minimum generator version map is automatically generated from `generators/*/versions.yml` files.

### Configuration

- `src/constants.ts`: Contains `MINIMUM_SUPPORTED_IR_VERSION` constant that drives the entire system
- `scripts/generate-version-map.ts`: Generation script that analyzes all generator YAML files
- `src/generated/generatorVersionMap.ts`: Auto-generated output (committed to git)

### How It Works

1. **Discovery**: The script finds all `generators/*/versions.yml` files (21+ files across generator families)
2. **Analysis**: For each generator, finds the first version where `irVersion >= MINIMUM_SUPPORTED_IR_VERSION`
3. **Mapping**: Creates `generatorName → minVersion` map using Docker naming convention
4. **Generation**: Outputs TypeScript constants file with proper types

### Generator Name Mapping

The script converts YAML paths to standardized generator names:

- `generators/go-v2/sdk/versions.yml` → `fernapi/fern-go-sdk`
- `generators/python/sdk/versions.yml` → `fernapi/fern-python-sdk`
- `generators/typescript/express/versions.yml` → `fernapi/fern-express`
- `generators/postman/versions.yml` → `fernapi/fern-postman`

### Updating Minimum IR Version

1. Update `MINIMUM_SUPPORTED_IR_VERSION` in `src/constants.ts`
2. Run `pnpm generate:version-map` to regenerate the map
3. Verify generated map is correct
4. Commit changes

The system automatically:
- Updates all generator minimum versions based on the new IR version
- Maintains backward compatibility with legacy generator names
- Validates output against known expected values

### Build Integration

- `prebuild` script: Automatically regenerates version map before compilation
- `clean` script: Removes generated file to force regeneration
- Generated file is committed to git for transparency and reproducibility

### Testing

Run `pnpm test` to verify:
- Generated constants are properly typed
- Core generators are present with valid versions
- Legacy generator names are included
- No undefined or empty versions exist

### Manual Generation

```bash
# Regenerate the version map (uses cache if possible)
pnpm generate:version-map

# Force regeneration (bypasses cache)
pnpm generate:version-map:force

# Clean and regenerate
pnpm clean && pnpm compile
```

### Caching & Performance

The script uses ultra-lightweight caching to avoid unnecessary work:

- **Cache trigger**: Only regenerates when `MINIMUM_SUPPORTED_IR_VERSION` changes
- **Cache method**: IR version encoded in filename (`generatorVersionMap.v53.ts`)
- **Performance**:
  - First run: ~0.5 seconds (full generation)
  - Cached run: ~0.4 seconds (filename check only)
- **Cache bypass**: Use `--force` flag to regenerate regardless of cache
- **Ultra-lightweight**: Just filesystem stat check, no file reading required
- **Files created**:
  - `generatorVersionMap.v53.ts` - versioned for caching
  - `generatorVersionMap.ts` - stable for imports

### Build Output

The script runs completely silently during builds:
- **Cached builds**: No output, exits immediately (~0.4s)
- **Full generation**: No output during normal builds (~0.5s)
- **Errors**: Always shown regardless of mode

## Migration System

The migration system automatically downgrades IR to match generator requirements:

1. **Version Detection**: Determines target IR version for specific generator
2. **Migration Chain**: Applies sequential migrations from latest to target version
3. **Validation**: Ensures target version is above minimum supported threshold
4. **Error Handling**: Provides clear upgrade guidance for unsupported versions

### Adding New Migrations

1. Create migration in `src/migrations/vX-to-vY/`
2. Update builder chain in `IntermediateRepresentationMigrator.ts`
3. Migration automatically included in version map generation