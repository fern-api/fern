# @fern-api/openapi-pruner

A package for pruning OpenAPI specifications down to specific endpoints while retaining all recursively required components.

## Overview

This package allows you to take a full OpenAPI specification and prune it down to only include specific endpoints and their dependencies. It automatically retains:

- All schemas recursively referenced by the selected endpoints
- Request bodies and their schemas
- Response schemas and definitions
- Parameters (path, query, header, cookie)
- Security schemes used by the endpoints
- Headers, examples, links, and callbacks
- All metadata including descriptions, validation rules (min/max), formats, patterns, etc.

## Installation

This is an internal package within the Fern monorepo. It is not published to npm.

```bash
pnpm add @fern-api/openapi-pruner
```

## Usage

### Basic Example

```typescript
import { OpenAPIPruner } from "@fern-api/openapi-pruner";
import { OpenAPIV3 } from "openapi-types";

const document: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0"
  },
  paths: {
    "/users": {
      get: {
        summary: "Get users",
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User"
                }
              }
            }
          }
        }
      }
    },
    "/posts": {
      get: {
        summary: "Get posts",
        responses: {
          "200": {
            description: "Success"
          }
        }
      }
    }
  },
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" }
        }
      }
    }
  }
};

const pruner = new OpenAPIPruner({
  document,
  endpoints: [
    { path: "/users", method: "get" }
  ]
});

const result = pruner.prune();

console.log(result.document); // Pruned OpenAPI document
console.log(result.statistics); // Statistics about what was pruned
```

### Selecting Multiple Endpoints

```typescript
const pruner = new OpenAPIPruner({
  document,
  endpoints: [
    { path: "/users", method: "get" },
    { path: "/users/{userId}", method: "get" },
    { path: "/users", method: "post" }
  ]
});
```

### Selecting All Methods for a Path

Omit the `method` field to include all HTTP methods for a given path:

```typescript
const pruner = new OpenAPIPruner({
  document,
  endpoints: [
    { path: "/users" } // Includes GET, POST, PUT, DELETE, etc.
  ]
});
```

### Working with Nested References

The pruner automatically follows all references recursively:

```typescript
const document: OpenAPIV3.Document = {
  // ...
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          address: {
            $ref: "#/components/schemas/Address" // Will be included
          }
        }
      },
      Address: {
        type: "object",
        properties: {
          street: { type: "string" },
          city: {
            $ref: "#/components/schemas/City" // Will also be included
          }
        }
      },
      City: {
        type: "object",
        properties: {
          name: { type: "string" }
        }
      }
    }
  }
};
```

### Preserving Metadata

All metadata is preserved, including:

- Descriptions
- Validation rules (minimum, maximum, minLength, maxLength, etc.)
- Formats (email, date-time, uuid, etc.)
- Patterns (regex)
- Required fields
- Default values
- Examples
- Deprecated flags

```typescript
const document: OpenAPIV3.Document = {
  // ...
  components: {
    schemas: {
      User: {
        type: "object",
        description: "A user in the system",
        properties: {
          age: {
            type: "integer",
            description: "User's age",
            minimum: 0,
            maximum: 150
          },
          email: {
            type: "string",
            format: "email",
            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
          }
        },
        required: ["email"]
      }
    }
  }
};

// All of this metadata will be preserved in the pruned document
```

### Statistics

The pruner returns statistics about what was pruned:

```typescript
const result = pruner.prune();

console.log(result.statistics);
// {
//   originalEndpoints: 10,
//   prunedEndpoints: 2,
//   originalSchemas: 20,
//   prunedSchemas: 5,
//   originalParameters: 15,
//   prunedParameters: 3,
//   originalResponses: 8,
//   prunedResponses: 2,
//   originalRequestBodies: 5,
//   prunedRequestBodies: 1,
//   originalSecuritySchemes: 3,
//   prunedSecuritySchemes: 1
// }
```

## API Reference

### `OpenAPIPruner`

The main class for pruning OpenAPI specifications.

#### Constructor

```typescript
constructor(options: PruneOptions)
```

#### Methods

##### `prune(): PruneResult`

Prunes the OpenAPI document and returns the result.

### Types

#### `PruneOptions`

```typescript
interface PruneOptions {
  document: OpenAPIV3.Document;
  endpoints: EndpointSelector[];
}
```

#### `EndpointSelector`

```typescript
interface EndpointSelector {
  path: string;
  method?: OpenAPIV3.HttpMethods; // Optional: if omitted, all methods are included
}
```

#### `PruneResult`

```typescript
interface PruneResult {
  document: OpenAPIV3.Document;
  statistics: PruneStatistics;
}
```

#### `PruneStatistics`

```typescript
interface PruneStatistics {
  originalEndpoints: number;
  prunedEndpoints: number;
  originalSchemas: number;
  prunedSchemas: number;
  originalParameters: number;
  prunedParameters: number;
  originalResponses: number;
  prunedResponses: number;
  originalRequestBodies: number;
  prunedRequestBodies: number;
  originalSecuritySchemes: number;
  prunedSecuritySchemes: number;
}
```

## Features

- ✅ Prunes endpoints not in the selector list
- ✅ Retains all recursively referenced schemas
- ✅ Handles `allOf`, `oneOf`, `anyOf` compositions
- ✅ Preserves request bodies and their schemas
- ✅ Preserves response schemas and definitions
- ✅ Retains parameters (path, query, header, cookie)
- ✅ Retains security schemes used by endpoints
- ✅ Preserves all metadata (descriptions, validation rules, formats, patterns)
- ✅ Handles component references (parameters, responses, request bodies)
- ✅ Supports path parameter matching
- ✅ Provides detailed statistics

## Testing

Run the test suite:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test:watch
```

## License

MIT
