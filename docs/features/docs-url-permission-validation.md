# Docs URL Permission Validation

## Overview

The Fern CLI now includes enhanced permission validation when generating documentation with the `--docs` flag. This feature ensures that users have proper permissions to publish to specific docs instances before starting the generation process.

## Feature Description

When using `fern generate --docs`, the CLI now validates permissions against the target docs instance during the API registration phase. This prevents failed documentation deployments and provides clearer error messages when permission issues exist.

## CLI Usage

### Basic Docs Generation
```bash
fern generate --docs
```

### Docs Generation with Instance
```bash
fern generate --docs --instance acme.docs.buildwithfern.com
```

### Multiple Docs Sites
```bash
fern generate --docs my-docs-site
```

## Permission Validation Behavior

### When Validation Occurs
- Permission validation happens during the FDR API registration phase
- Only triggered when using the `--docs` flag
- Does not affect API-only generation (`fern generate` without `--docs`)

### Validation Process
1. CLI extracts the docs URL from the generation context
2. Docs URL is passed to FDR's `registerApiDefinition` endpoint
3. FDR validates user permissions against the specified docs instance
4. Generation proceeds if permissions are valid, fails with clear error if not

### Backwards Compatibility
- Feature is fully backwards compatible
- API-only generation remains unchanged
- No breaking changes to existing workflows

## FDR API Changes

### registerApiDefinition Endpoint

The FDR API's `registerApiDefinition` endpoint now supports an optional `docsUrl` parameter:

```typescript
interface RegisterApiDefinitionRequest {
  orgId: string;
  apiId: string;
  definition: ApiDefinition;
  definitionV2?: ApiDefinitionV2;
  dynamicIRs?: Record<string, DynamicIr>;
  docsUrl?: string;  // NEW: Optional docs URL for permission validation
}
```

### Behavior
- **When docsUrl is provided**: FDR validates user permissions against the docs instance
- **When docsUrl is omitted**: Standard registration without additional permission checks
- **Backwards compatible**: Existing API integrations continue to work unchanged

## Error Handling

### Permission Denied Errors
When permission validation fails, you'll see clear error messages:

```
You do not have permissions to register the docs. Reach out to support@buildwithfern.com
```

### Troubleshooting
If you encounter permission errors:

1. **Verify Login Status**: Ensure you're logged in with the correct account
   ```bash
   fern login
   ```

2. **Check Organization**: Verify you belong to the correct organization in your `fern.config.json`

3. **Contact Support**: For persistent issues, contact support@buildwithfern.com

## Implementation Details

### CLI Component
- **Location**: `packages/cli/generation/remote-generation/remote-workspace-runner/src/publishDocs.ts`
- **Function**: Extracts docs URL and passes it to FDR during API registration
- **Trigger**: Only active during `fern generate --docs` commands

### FDR Component
- **Endpoint**: `POST /api/v1/register/registerApiDefinition`
- **Enhancement**: Added optional `docsUrl` parameter
- **Validation**: Checks user permissions against target docs instance

## Technical Benefits

### Security Improvements
- Prevents unauthorized docs publishing attempts
- Validates permissions before resource-intensive generation
- Maintains principle of least privilege

### Developer Experience
- Early failure detection (fail fast principle)
- Clear error messages with actionable guidance
- No additional configuration required

### System Reliability
- Reduces failed deployment attempts
- Cleaner separation of concerns between CLI and FDR
- Consistent permission checking across all docs operations

## Version Information

This feature was introduced in CLI version 0.30.0 and FDR API version 2.0, and is available in all subsequent versions.