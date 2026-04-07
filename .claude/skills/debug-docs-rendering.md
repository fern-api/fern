# Debugging Docs Rendering Issues

## When to Use

Use when docs are showing incorrect values (e.g., "object" instead of "ParseStepRun", missing fields, wrong names).

## The Test-First Debugging Approach

**Always start by creating a test case first.** Don't read code or guess - get data.

### Step 1: Create a Minimal Test Case

Add a test following [`packages/cli/register/src/ir-to-fdr-converter/__test__/CLAUDE.md`](../../packages/cli/register/src/ir-to-fdr-converter/__test__/CLAUDE.md):

```bash
# Create a fixture directory
mkdir -p packages/cli/register/src/ir-to-fdr-converter/__test__/fixtures/my-bug

# Add minimal OpenAPI that reproduces the bug
# Copy the relevant parts from the customer's spec
```

The test will generate two snapshots:
- `*-ir.snap` - The Intermediate Representation
- `*-fdr.snap` - The FDR output (what docs consume)

### Step 2: Inspect the Snapshots to Diagnose

Open both snapshot files and find the relevant section:

**Check `*-fdr.snap` first (what docs see):**
```json
{
  "displayName": undefined  // ← Bug found!
}
```

**Then check `*-ir.snap` (what CLI generates):**
```json
{
  "displayName": "ParseStepRun"  // ← IR has it
}
```

This tells you immediately where the problem is:

| IR Snapshot | FDR Snapshot | Problem Location |
|-------------|--------------|------------------|
| Has correct value | Missing/wrong | IR → FDR converter (`packages/cli/register/`) |
| Missing/wrong | Missing/wrong | OpenAPI → IR parser (`packages/cli/api-importers/`) |
| Has correct value | Has correct value | Frontend rendering (`fern-platform` repo) |

### Step 3: Fix Based on Diagnosis

**If IR has it but FDR doesn't:**
- Problem: `packages/cli/register/src/ir-to-fdr-converter/`
- The converter isn't mapping the field correctly

**If IR is missing it:**
- Problem: `packages/cli/api-importers/openapi-to-ir/` or `packages/cli/api-importers/v3-importer-commons/`
- The parser isn't extracting/creating the field

**If both IR and FDR have it:**
- Problem: Frontend (fern-platform repo)
- Not a CLI issue

## Working Backwards from Output

Once you know which layer has the bug, work backwards from the output.

### For IR → FDR Issues

**Start where FDR reads the data:**

```bash
# Find where the field is read
grep -r "displayName" packages/cli/register/src/ir-to-fdr-converter/ -n

# Example result:
# convertTypeShape.ts:120: displayName: variant.type.displayName
```

This tells you: FDR reads `variant.type.displayName` (which is a TypeReference)

**Then find where that field is set:**

```bash
# Find where TypeReference is created
grep -r "TypeReference.named" packages/cli/api-importers/ -A5 | grep -B5 "displayName"
```

### For OpenAPI → IR Issues

**Start where IR objects are created:**

```bash
# For unions
grep -r "unionTypes.push" packages/cli/api-importers/v3-importer-commons/ -B10

# For type references
grep -r "convertReferenceToTypeReference" packages/cli/api-importers/ -B3
```

**Add debug logging at the creation point:**

```typescript
console.log("Creating TypeReference:", {
    schemaName: rawSchemaName,
    title: schema.title,
    displayName: displayName
});
```

Run the test and look at the actual values.

## Understanding IR vs FDR

### IR (Intermediate Representation)
- Generated from OpenAPI/AsyncAPI/Protobuf specs
- Location: `packages/cli/api-importers/`
- Consumed by: Generators (SDKs) AND FDR converter
- Schema: `packages/ir-sdk/fern/apis/ir-types-latest/`

### FDR (Fern Definition Registry)
- Generated from IR
- Location: `packages/cli/register/src/ir-to-fdr-converter/`
- Consumed by: Docs frontend
- Schema: `fern-platform` repo at `fern/apis/fdr/`

**Key difference**: IR has more detail (for SDK generation), FDR is docs-focused.

## Common Data Structures

### TypeReference
A **pointer** to a type. Used in function signatures, union variants, properties.

```typescript
{
  type: "named",
  typeId: "ParseStepRun",
  displayName: "ParseStepRun"  // ← Separate displayName field
}
```

**Where docs read it**: `variant.type.displayName`

### TypeDeclaration
The **actual type definition**. Has all the properties, variants, etc.

```typescript
{
  name: {
    typeId: "ParseStepRun",
    displayName: "ParseStepRun"  // ← displayName in name object
  },
  shape: { ... }
}
```

**Where docs read it**: `typeDeclaration.name.displayName`

**Critical**: These are DIFFERENT fields. Docs might read from either one depending on context.

## Example: Fixing "object" Bug

### Step 1: Create Test
```bash
mkdir -p packages/cli/register/src/ir-to-fdr-converter/__test__/fixtures/union-displayname
# Add OpenAPI with oneOf schema
```

### Step 2: Check Snapshots
```json
// *-fdr.snap
{
  "variants": [{
    "displayName": undefined  // ← Bug in FDR
  }]
}

// *-ir.snap
{
  "types": {
    "ParseStepRun": {
      "name": {
        "displayName": undefined  // ← Bug in IR
      }
    }
  }
}
```

**Diagnosis**: IR is missing displayName → Problem in OpenAPI parser

### Step 3: Find Where TypeReference is Created
```bash
grep -r "TypeReference.named" packages/cli/api-importers/ -A5 | grep -B5 "displayName"

# Found: OpenAPIConverterContext3_1.ts:92-102
```

### Step 4: Add Debug Logging
```typescript
console.log("TypeRef displayName:", {
  title: resolvedReference.value.title,
  displayNameOverride: displayNameOverride,
  displayNameOverrideSource: displayNameOverrideSource,
  rawSchemaName: rawSchemaName
});
```

### Step 5: Run Test, See Values
```
TypeRef displayName: {
  title: undefined,
  displayNameOverride: "ParseStepRun",
  displayNameOverrideSource: "schema_identifier",
  rawSchemaName: "ParseStepRun"
}
```

### Step 6: Fix the Bug
```typescript
// OLD: Only use title when source is "schema_identifier"
displayName = resolvedReference.value.title;  // undefined!

// NEW: Fallback to rawSchemaName
displayName = resolvedReference.value.title ?? rawSchemaName;
```

### Step 7: Update Snapshot
```bash
pnpm test:update
```

Verify the snapshot now has `displayName: "ParseStepRun"`.

## Quick Commands

```bash
# Create test and see snapshots
cd packages/cli/register/src/ir-to-fdr-converter/__test__/fixtures/
mkdir my-bug
# Add openapi.yml
pnpm test

# Find where FDR reads a field
grep -r "fieldName" packages/cli/register/src/ir-to-fdr-converter/ -n

# Find where IR creates an object
grep -r "TypeReference.named" packages/cli/api-importers/ -A5

# Update all snapshots after fix
pnpm test:update

# Run specific test
pnpm test my-bug
```

## Key Files Reference

**IR → FDR Conversion (docs reads here):**
- `packages/cli/register/src/ir-to-fdr-converter/convertTypeShape.ts`

**OpenAPI → IR (creates TypeReferences):**
- `packages/cli/api-importers/openapi-to-ir/src/3.1/OpenAPIConverterContext3_1.ts`
- `packages/cli/api-importers/v3-importer-commons/src/converters/schema/OneOfSchemaConverter.ts`
- `packages/cli/api-importers/v3-importer-commons/src/converters/schema/SchemaConverter.ts`

## Anti-Patterns to Avoid

❌ Reading code without data
❌ Guessing where the bug is
❌ Making changes without a test
❌ Fixing symptoms instead of root cause
❌ Assuming TypeReference and TypeDeclaration are the same

✅ Create test first
✅ Inspect snapshots
✅ Add debug logging with actual values
✅ Work backwards from output
✅ Fix where data is first created
