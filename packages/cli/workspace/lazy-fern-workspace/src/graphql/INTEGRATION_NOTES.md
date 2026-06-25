# GraphQL IR Pipeline Integration Notes

## Files to Modify

### 1. OSSWorkspace.ts (`packages/cli/workspace/lazy-fern-workspace/src/OSSWorkspace.ts`)

#### Add import (near line 21-22):
```typescript
import { GraphQLIRGenerator } from "./graphql/GraphQLIRGenerator.js";
```

#### Add parallel generation (line ~314, after protobuf parallel start):
```typescript
// Start GraphQL IR generation in parallel with OpenAPI processing
const graphqlIRResultsPromise = this.generateAllGraphQLIRs({ context });
```

#### Add merge step (after line ~480, after protobuf merge):
```typescript
// Await and merge GraphQL IR results (generated in parallel with OpenAPI processing)
const graphqlIRResults = await graphqlIRResultsPromise;
const graphqlCasingsGenerator = constructCasingsGenerator({
    generationLanguage: "typescript",
    keywords: undefined,
    smartCasing: false
});
for (const ir of graphqlIRResults) {
    mergedIr =
        mergedIr === undefined ? ir : mergeIntermediateRepresentation(mergedIr, ir, graphqlCasingsGenerator);
}
```

#### Add new private method (after `generateAllProtobufIRs`, line ~558):
```typescript
private async generateAllGraphQLIRs({ context }: { context: TaskContext }): Promise<IntermediateRepresentation[]> {
    const graphqlSpecs = this.allSpecs.filter((spec): spec is GraphQLSpec => spec.type === "graphql");
    if (graphqlSpecs.length === 0) {
        return [];
    }

    const results: IntermediateRepresentation[] = [];
    for (const spec of graphqlSpecs) {
        try {
            const generator = new GraphQLIRGenerator({ context });
            const ir = await generator.generate({
                absoluteFilepath: spec.absoluteFilepath,
                namespace: spec.namespace
            });
            results.push(ir);
        } catch (error) {
            context.logger.log("warn", "Failed to generate GraphQL IR: " + error);
        }
    }

    return results;
}
```

### 2. SdkChecker.ts (`packages/cli/cli-v2/src/sdk/checker/SdkChecker.ts`)

#### Remove or update the GraphQL warning (lines 217-230):

**Before** (current):
```typescript
const hasGraphQl = api.specs.some(isGraphQlSpec);
if (!hasGraphQl) {
    continue;
}
violations.push({
    severity: "warning",
    relativeFilepath: target.sourceLocation.relativeFilePath,
    nodePath: ["sdks", "targets", target.name, "api"],
    message: `API '${target.api}' contains a GraphQL spec. GraphQL SDKs are not supported and graphql specs will be skipped for this target.`,
    ...
});
```

**After** (remove the entire block):
```typescript
// GraphQL SDK generation is now supported via Transport.graphql
// No warning needed — GraphQL specs are processed like protobuf specs
```

### 3. GraphQLSpec type (`packages/commons/api-workspace-commons/src/Spec.ts`)

No changes needed — the existing `GraphQLSpec` interface already has all needed fields:
```typescript
export interface GraphQLSpec {
    type: "graphql";
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined;
    absoluteFilepathToExamples: AbsoluteFilePath | undefined;
    namespace?: string;
}
```
