import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { RelativeFilePath } from "@fern-api/path-utils";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseDocument } from "yaml";
import { ReferenceResolver } from "../ReferenceResolver";
import { YamlDocument } from "../YamlDocument";

function createYamlDocument(yaml: string, absoluteFilePath: AbsoluteFilePath, cwd: AbsoluteFilePath): YamlDocument {
    const document = parseDocument(yaml);
    const relativeFilePath = RelativeFilePath.of(absoluteFilePath.replace(cwd + "/", ""));
    return new YamlDocument({
        absoluteFilePath,
        relativeFilePath,
        document,
        source: yaml
    });
}

describe("ReferenceResolver", () => {
    let testDir: string;
    let cwd: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = join(tmpdir(), `ref-resolver-test-${Date.now()}`);
        await mkdir(testDir, { recursive: true });
        cwd = AbsoluteFilePath.of(testDir);
    });

    afterEach(async () => {
        if (await doesPathExist(AbsoluteFilePath.of(testDir))) {
            await rm(testDir, { recursive: true });
        }
    });

    describe("valid cases", () => {
        it("resolves a simple file reference", async () => {
            const dbConfigPath = join(testDir, "database.yaml");
            await writeFile(
                dbConfigPath,
                `
host: localhost
port: 5432
name: db
`
            );

            const mainYaml = `
app: myapp
database:
  $ref: "./database.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({
                    app: "myapp",
                    database: {
                        host: "localhost",
                        port: 5432,
                        name: "db"
                    }
                });
            }
        });

        it("resolves multiple references in the same document", async () => {
            await writeFile(
                join(testDir, "db.yaml"),
                `
host: host
port: 5432
`
            );
            await writeFile(
                join(testDir, "cache.yaml"),
                `
host: cachehost
port: 6379
`
            );

            const mainYaml = `
database:
  $ref: "./db.yaml"
cache:
  $ref: "./cache.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({
                    database: { host: "host", port: 5432 },
                    cache: { host: "cachehost", port: 6379 }
                });
            }
        });

        it("resolves a reference inside an array", async () => {
            await writeFile(
                join(testDir, "endpoint1.yaml"),
                `
path: /api/users
method: GET
`
            );
            await writeFile(
                join(testDir, "endpoint2.yaml"),
                `
path: /api/posts
method: POST
`
            );

            const mainYaml = `
endpoints:
  - $ref: "./endpoint1.yaml"
  - $ref: "./endpoint2.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({
                    endpoints: [
                        { path: "/api/users", method: "GET" },
                        { path: "/api/posts", method: "POST" }
                    ]
                });
            }
        });

        it("resolves references in nested subdirectories", async () => {
            const commonDir = join(testDir, "common");
            await mkdir(commonDir, { recursive: true });
            await writeFile(
                join(commonDir, "shared.yaml"),
                `
timeout: 30
retries: 3
`
            );

            const mainYaml = `
config:
  $ref: "./common/shared.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({
                    config: { timeout: 30, retries: 3 }
                });
            }
        });

        it("resolves chained references (non-circular)", async () => {
            await writeFile(
                join(testDir, "c.yaml"),
                `
value: deep
`
            );
            await writeFile(
                join(testDir, "b.yaml"),
                `
nested:
  $ref: "./c.yaml"
`
            );

            const mainYaml = `
root:
  $ref: "./b.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({
                    root: {
                        nested: { value: "deep" }
                    }
                });
            }
        });

        it("returns the document as-is when there are no references", async () => {
            const mainYaml = `
simple: value
nested:
  key: value
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({
                    simple: "value",
                    nested: { key: "value" }
                });
            }
        });

        it("resolves a reference to a primitive value", async () => {
            await writeFile(
                join(testDir, "version.yaml"),
                `
1.2.3
`
            );

            const mainYaml = `
version:
  $ref: "./version.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({
                    version: "1.2.3"
                });
            }
        });

        it("resolves a reference to an array value", async () => {
            await writeFile(
                join(testDir, "tags.yaml"),
                `
- tag1
- tag2
- tag3
`
            );

            const mainYaml = `
tags:
  $ref: "./tags.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({
                    tags: ["tag1", "tag2", "tag3"]
                });
            }
        });
    });

    describe("error cases", () => {
        it("errors when $ref is not a string", async () => {
            const mainYaml = `
database:
  $ref: 123
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            await writeFile(mainPath, mainYaml);
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const error = result.issues[0];
                expect(error).toBeDefined();
                expect(error?.message).toContain("$ref must be a string");
            }
        });

        it("errors when $ref has sibling properties", async () => {
            await writeFile(
                join(testDir, "db.yaml"),
                `
host: localhost
`
            );

            const mainYaml = `
database:
  $ref: "./db.yaml"
  poolSize: 10
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const error = result.issues[0];
                expect(error).toBeDefined();
                expect(error?.message).toContain("$ref cannot have sibling keys");
                expect(error?.message).toContain("poolSize");
            }
        });

        it("errors when referenced file does not exist", async () => {
            const mainYaml = `
database:
  $ref: "./nonexistent.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const issue = result.issues[0];
                expect(issue).toBeDefined();
                expect(issue?.message).toContain("Referenced file does not exist");
                expect(issue?.message).toContain("./nonexistent.yaml");
            }
        });

        it("errors on circular reference (direct)", async () => {
            // main.yaml -> main.yaml
            const mainYaml = `
self:
  $ref: "./main.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            await writeFile(mainPath, mainYaml);
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const error = result.issues[0];
                expect(error).toBeDefined();
                expect(error?.message).toContain("Circular $ref detected");
            }
        });

        it("errors on circular reference (indirect)", async () => {
            // main.yaml -> a.yaml -> b.yaml -> main.yaml
            await writeFile(
                join(testDir, "b.yaml"),
                `
ref:
  $ref: "./main.yaml"
`
            );
            await writeFile(
                join(testDir, "a.yaml"),
                `
ref:
  $ref: "./b.yaml"
`
            );

            const mainYaml = `
root:
  $ref: "./a.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            await writeFile(mainPath, mainYaml);
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const error = result.issues[0];
                expect(error).toBeDefined();
                expect(error?.message).toContain("Circular $ref detected");
            }
        });

        it("errors on JSON pointer reference", async () => {
            await writeFile(
                join(testDir, "data.yaml"),
                `
schemas:
  User:
    name: string
`
            );

            const mainYaml = `
user:
  $ref: "./data.yaml#/schemas/User"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const error = result.issues[0];
                expect(error).toBeDefined();
                expect(error?.message).toContain("JSON pointer and in-document references are not supported");
            }
        });

        it("errors on in-document reference", async () => {
            const mainYaml = `
definitions:
  User:
    name: string
user:
  $ref: "#/definitions/User"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const error = result.issues[0];
                expect(error).toBeDefined();
                expect(error?.message).toContain("JSON pointer and in-document references are not supported");
            }
        });

        it("errors when $ref resolves to null", async () => {
            await writeFile(
                join(testDir, "null.yaml"),
                `
null
`
            );

            const mainYaml = `
value:
  $ref: "./null.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const error = result.issues[0];
                expect(error).toBeDefined();
                expect(error?.message).toContain("$ref resolves to null");
            }
        });

        it("collects all errors instead of failing on the first one", async () => {
            const mainYaml = `
db1:
  $ref: "./missing1.yaml"
db2:
  $ref: "./missing2.yaml"
db3:
  $ref: 123
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues.length).toBeGreaterThanOrEqual(3);
            }
        });

        it("includes source file path in error message", async () => {
            const mainYaml = `
database:
  $ref: "./nonexistent.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                const error = result.issues[0];
                expect(error).toBeDefined();
                const errorString = error?.toString();
                expect(errorString).toContain("main.yaml");
            }
        });

        it("errors when referenced file contains invalid YAML", async () => {
            await writeFile(join(testDir, "invalid.yaml"), `this is not: valid: yaml: content`);

            const mainYaml = `
data:
  $ref: "./invalid.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const error = result.issues[0];
                expect(error).toBeDefined();
                expect(error?.message).toContain("Failed to parse referenced file");
            }
        });
    });

    describe("ValidationIssue integration", () => {
        it("formats issue with location and message", async () => {
            const mainYaml = `
database:
  $ref: "./nonexistent.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                const issue = result.issues[0];
                expect(issue).toBeDefined();
                expect(issue?.location).toBeDefined();
                expect(issue?.message).toBeDefined();
                expect(issue?.yamlPath).toEqual(["database", "$ref"]);
            }
        });
    });

    describe("source location tracking in referenced files", () => {
        it("provides accurate source location for errors in referenced files", async () => {
            const nestedYaml = `
first: value
second:
  nested:
    $ref: "./missing.yaml"
third: value
`;
            await writeFile(join(testDir, "nested.yaml"), nestedYaml);

            const mainYaml = `
config:
  $ref: "./nested.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const issue = result.issues[0];
                expect(issue).toBeDefined();
                expect(issue?.location.relativeFilePath).toBe("nested.yaml");
                expect(issue?.location.line).toBe(5);
            }
        });

        it("provides accurate source location for chained references", async () => {
            const bYaml = `
value: good
broken:
  $ref: 123
`;
            await writeFile(join(testDir, "b.yaml"), bYaml);

            const aYaml = `
nested:
  $ref: "./b.yaml"
`;
            await writeFile(join(testDir, "a.yaml"), aYaml);

            const mainYaml = `
root:
  $ref: "./a.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const issue = result.issues[0];
                expect(issue).toBeDefined();
                expect(issue?.location.relativeFilePath).toBe("b.yaml");
                expect(issue?.location.line).toBe(4);
            }
        });

        it("includes refFrom location pointing to the original $ref", async () => {
            const nestedYaml = `
name: test
data:
  $ref: "./missing.yaml"
`;
            await writeFile(join(testDir, "nested.yaml"), nestedYaml);

            const mainYaml = `
first: value
config:
  $ref: "./nested.yaml"
last: value
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const issue = result.issues[0];
                expect(issue).toBeDefined();

                expect(issue?.location.relativeFilePath).toBe("nested.yaml");
                expect(issue?.location.line).toBe(4);

                expect(issue?.location.refFrom).toBeDefined();
                expect(issue?.location.refFrom?.relativeFilePath).toBe("main.yaml");
                expect(issue?.location.refFrom?.line).toBe(4);
            }
        });

        it("includes refFrom for chained references pointing to immediate parent $ref", async () => {
            const bYaml = `
value: good
broken:
  $ref: "./missing.yaml"
`;
            await writeFile(join(testDir, "b.yaml"), bYaml);

            const aYaml = `
nested:
  $ref: "./b.yaml"
`;
            await writeFile(join(testDir, "a.yaml"), aYaml);

            const mainYaml = `
root:
  $ref: "./a.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.issues).toHaveLength(1);
                const issue = result.issues[0];
                expect(issue).toBeDefined();

                expect(issue?.location.relativeFilePath).toBe("b.yaml");
                expect(issue?.location.line).toBe(4);

                expect(issue?.location.refFrom).toBeDefined();
                expect(issue?.location.refFrom?.relativeFilePath).toBe("a.yaml");
                expect(issue?.location.refFrom?.line).toBe(3);
            }
        });
    });

    describe("path mappings for post-resolution source location lookup", () => {
        it("returns path mappings for simple nested references", async () => {
            const dbYaml = `
host: localhost
port: 5432
`;
            await writeFile(join(testDir, "db.yaml"), dbYaml);

            const mainYaml = `
app: myapp
database:
  $ref: "./db.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.pathMappings).toHaveLength(1);
                expect(result.pathMappings[0]?.yamlPath).toEqual(["database"]);
                expect(result.pathMappings[0]?.document.relativeFilePath).toBe("db.yaml");
            }
        });

        it("returns path mappings for doubly nested references", async () => {
            const typescriptYaml = `
lang: typescript
version: 1.0.0
`;
            await writeFile(join(testDir, "typescript.yaml"), typescriptYaml);

            const sdksYaml = `
targets:
  typescript:
    $ref: "./typescript.yaml"
`;
            await writeFile(join(testDir, "sdks.yaml"), sdksYaml);

            const mainYaml = `
edition: 2026-01-01
sdks:
  $ref: "./sdks.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.pathMappings).toHaveLength(2);

                const sdksMapping = result.pathMappings.find(
                    (m) => m.yamlPath.length === 1 && m.yamlPath[0] === "sdks"
                );
                expect(sdksMapping).toBeDefined();
                expect(sdksMapping?.document.relativeFilePath).toBe("sdks.yaml");

                const tsMapping = result.pathMappings.find((m) => m.yamlPath.length === 3);
                expect(tsMapping).toBeDefined();
                expect(tsMapping?.yamlPath).toEqual(["sdks", "targets", "typescript"]);
                expect(tsMapping?.document.relativeFilePath).toBe("typescript.yaml");
            }
        });

        it("getSourceLocationWithMappings resolves to correct file for doubly nested paths", async () => {
            const typescriptYaml = `
lang: typescript
version: 1.0.0
`;
            await writeFile(join(testDir, "typescript.yaml"), typescriptYaml);

            const sdksYaml = `
targets:
  typescript:
    $ref: "./typescript.yaml"
`;
            await writeFile(join(testDir, "sdks.yaml"), sdksYaml);

            const mainYaml = `
edition: 2026-01-01
sdks:
  $ref: "./sdks.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                const location = resolver.getSourceLocationWithMappings({
                    document,
                    pathMappings: result.pathMappings,
                    yamlPath: ["sdks", "targets", "typescript", "lang"]
                });

                expect(location.relativeFilePath).toBe("typescript.yaml");
                expect(location.line).toBe(2);

                expect(location.refFrom).toBeDefined();
                expect(location.refFrom?.relativeFilePath).toBe("sdks.yaml");
            }
        });

        it("getSourceLocationWithMappings resolves to correct file for singly nested paths", async () => {
            const typescriptYaml = `
lang: typescript
version: 1.0.0
`;
            await writeFile(join(testDir, "typescript.yaml"), typescriptYaml);

            const sdksYaml = `
targets:
  autorelease: xyz
  typescript:
    $ref: "./typescript.yaml"
`;
            await writeFile(join(testDir, "sdks.yaml"), sdksYaml);

            const mainYaml = `
edition: 2026-01-01
sdks:
  $ref: "./sdks.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                const location = resolver.getSourceLocationWithMappings({
                    document,
                    pathMappings: result.pathMappings,
                    yamlPath: ["sdks", "targets", "autorelease"]
                });

                expect(location.relativeFilePath).toBe("sdks.yaml");
                expect(location.line).toBe(3);

                expect(location.refFrom).toBeDefined();
                expect(location.refFrom?.relativeFilePath).toBe("main.yaml");
            }
        });

        it("getSourceLocationWithMappings falls back to original document for non-referenced paths", async () => {
            const sdksYaml = `
targets:
  typescript:
    lang: typescript
`;
            await writeFile(join(testDir, "sdks.yaml"), sdksYaml);

            const mainYaml = `
edition: 2026-01-01
org: myorg
sdks:
  $ref: "./sdks.yaml"
`;
            const mainPath = AbsoluteFilePath.of(join(testDir, "main.yaml"));
            const document = createYamlDocument(mainYaml, mainPath, cwd);

            const resolver = new ReferenceResolver({ cwd });
            const result = await resolver.resolve({ document });

            expect(result.success).toBe(true);
            if (result.success) {
                const location = resolver.getSourceLocationWithMappings({
                    document,
                    pathMappings: result.pathMappings,
                    yamlPath: ["org"]
                });

                expect(location.relativeFilePath).toBe("main.yaml");
                expect(location.line).toBe(3);

                expect(location.refFrom).toBeUndefined();
            }
        });
    });
});
