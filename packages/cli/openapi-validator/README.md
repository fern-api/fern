# OpenAPI 3.1 Validator

A comprehensive validator for OpenAPI 3.1 specifications.

## Overview

This package provides validation for OpenAPI 3.1 documents, ensuring they conform to the OpenAPI 3.1 specification and follow best practices.

## Features

- **Required Fields Validation**: Ensures all required fields are present (info, openapi version, etc.)
- **Version Validation**: Validates that the document uses OpenAPI 3.1.x
- **Path Validation**: Checks path formatting and structure
- **Operation Validation**: Validates HTTP operations have required fields
- **Parameter Validation**: Ensures parameters are properly defined
- **Request Body Validation**: Validates request body structure
- **Response Validation**: Checks response definitions
- **Schema Validation**: Validates schema definitions in components
- **Security Validation**: Validates security schemes and requirements
- **Component Validation**: Ensures component names follow conventions
- **Reference Validation**: Checks that all $ref references point to existing components
- **Circular Reference Detection**: Detects circular references in schemas
- **Example Validation**: Optionally validates examples against their schemas

## Usage

```typescript
import { validateOpenApiDocument } from "@fern-api/openapi-validator";
import { OpenAPIV3_1 } from "openapi-types";

const document: OpenAPIV3_1.Document = {
  openapi: "3.1.0",
  info: {
    title: "My API",
    version: "1.0.0"
  },
  paths: {
    "/users": {
      get: {
        responses: {
          "200": {
            description: "Success"
          }
        }
      }
    }
  }
};

const logger = /* your logger instance */;
const violations = validateOpenApiDocument(document, logger, {
  validateExamples: true
});

if (violations.length > 0) {
  violations.forEach(violation => {
    console.log(`[${violation.severity}] ${violation.message}`);
    if (violation.nodePath.length > 0) {
      console.log(`  at: ${violation.nodePath.join('/')}`);
    }
  });
}
```

## Validation Options

- `validateExamples` (boolean): Validate example values against their schemas

## Validation Rules

### Required Rules
- `required-info`: Validates info object with title and version
- `required-paths`: Ensures paths or webhooks object exists
- `valid-openapi-version`: Validates OpenAPI version is 3.1.x

### Structure Rules
- `valid-server-urls`: Validates server URL formatting
- `valid-path-items`: Checks path item structure
- `valid-operations`: Validates operation definitions
- `valid-parameters`: Ensures parameters are properly defined
- `valid-request-body`: Validates request body structure
- `valid-responses`: Checks response definitions
- `valid-schemas`: Validates schema definitions
- `valid-security`: Validates security schemes
- `valid-components`: Ensures component naming conventions

### Reference Rules
- `valid-references`: Validates all $ref references
- `no-circular-references`: Detects circular schema references

### Optional Rules
- `valid-examples`: Validates examples (when enabled)

## Violation Severity Levels

- **fatal**: Critical errors that prevent the document from being valid
- **error**: Errors that violate the OpenAPI specification
- **warning**: Best practice violations or potential issues

## Development

### Building

```bash
pnpm compile
```

### Testing

```bash
pnpm test
```

### Debugging

```bash
pnpm compile:debug
pnpm test:debug
```

## License

MIT
