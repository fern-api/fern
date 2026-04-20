import { TaskContext, TaskResult } from "@fern-api/task-context";
import { mkdir, rm, writeFile } from "fs/promises";
import { noop } from "lodash-es";
import { tmpdir } from "os";
import { join } from "path";
import { vi } from "vitest";

import { resolveDescriptionMarkdownRefs } from "../utils/resolveDescriptionMarkdownRefs.js";

function createContextWithWarn(): { context: TaskContext; warn: ReturnType<typeof vi.fn> } {
    const warn = vi.fn();
    const context: TaskContext = {
        logger: {
            disable: noop,
            enable: noop,
            trace: noop,
            debug: noop,
            info: noop,
            warn,
            error: noop,
            log: noop
        },
        takeOverTerminal: async () => undefined,
        failAndThrow: (message?: string) => {
            throw new Error(message ?? "Task failed");
        },
        failWithoutThrowing: noop,
        captureException: noop,
        getResult: () => TaskResult.Success,
        addInteractiveTask: () => {
            throw new Error("not implemented");
        },
        runInteractiveTask: async () => false,
        instrumentPostHogEvent: noop
    };
    return { context, warn };
}

describe("resolveDescriptionMarkdownRefs", () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = join(tmpdir(), `resolve-desc-md-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        await mkdir(tempDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it("inlines markdown file contents into top-level and nested descriptions", async () => {
        await writeFile(join(tempDir, "info.md"), "# Intro\n\nTop-level description.\n");
        await mkdir(join(tempDir, "descriptions"), { recursive: true });
        await writeFile(join(tempDir, "descriptions", "op.md"), "Operation description.");
        await writeFile(join(tempDir, "descriptions", "schema.md"), "Schema description.");

        const doc: Record<string, unknown> = {
            info: { description: { $ref: "./info.md" } },
            paths: {
                "/pets": {
                    get: {
                        description: { $ref: "./descriptions/op.md" },
                        responses: {
                            "200": { description: "inline string" }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    Pet: {
                        description: { $ref: "./descriptions/schema.md" },
                        properties: {
                            name: { type: "string", description: "already a string" }
                        }
                    }
                }
            }
        };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        expect((doc.info as Record<string, unknown>).description).toBe("# Intro\n\nTop-level description.");
        const paths = doc.paths as Record<string, Record<string, Record<string, unknown>>>;
        expect(paths["/pets"]?.get?.description).toBe("Operation description.");
        const schemas = (doc.components as Record<string, Record<string, Record<string, unknown>>>).schemas;
        expect(schemas?.Pet?.description).toBe("Schema description.");
        expect(warn).not.toHaveBeenCalled();
    });

    it("replaces missing markdown refs with empty string and logs a warning", async () => {
        const doc = {
            info: { description: { $ref: "./does-not-exist.md" } }
        };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        expect((doc.info as Record<string, unknown>).description).toBe("");
        expect(warn).toHaveBeenCalledOnce();
        expect(warn.mock.calls[0]?.[0]).toContain("./does-not-exist.md");
    });

    it("leaves JSON Pointer refs unchanged", async () => {
        const doc = {
            info: { description: { $ref: "#/components/schemas/Foo" } }
        };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        expect((doc.info as Record<string, unknown>).description).toEqual({ $ref: "#/components/schemas/Foo" });
        expect(warn).not.toHaveBeenCalled();
    });

    it("leaves URL refs unchanged", async () => {
        const doc = {
            info: { description: { $ref: "https://example.com/foo.md" } }
        };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        expect((doc.info as Record<string, unknown>).description).toEqual({
            $ref: "https://example.com/foo.md"
        });
        expect(warn).not.toHaveBeenCalled();
    });

    it("leaves non-markdown file refs unchanged", async () => {
        const doc = {
            info: { description: { $ref: "./description.txt" } }
        };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        expect((doc.info as Record<string, unknown>).description).toEqual({ $ref: "./description.txt" });
        expect(warn).not.toHaveBeenCalled();
    });

    it("leaves $ref objects with sibling keys unchanged", async () => {
        await writeFile(join(tempDir, "foo.md"), "ignored");
        const doc = {
            info: { description: { $ref: "./foo.md", summary: "other" } }
        };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        expect((doc.info as Record<string, unknown>).description).toEqual({
            $ref: "./foo.md",
            summary: "other"
        });
        expect(warn).not.toHaveBeenCalled();
    });

    it("leaves string descriptions unchanged", async () => {
        const doc = { info: { description: "already a string" } };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        expect(doc.info.description).toBe("already a string");
        expect(warn).not.toHaveBeenCalled();
    });

    it("handles arrays containing objects with markdown description refs", async () => {
        await writeFile(join(tempDir, "param.md"), "Parameter description.");
        const doc = {
            paths: {
                "/pets": {
                    get: {
                        parameters: [
                            { name: "foo", in: "query", description: { $ref: "./param.md" } },
                            { name: "bar", in: "query", description: "plain" }
                        ]
                    }
                }
            }
        };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        const params = (doc.paths["/pets"].get as { parameters: Array<{ description: unknown }> }).parameters;
        expect(params[0]?.description).toBe("Parameter description.");
        expect(params[1]?.description).toBe("plain");
        expect(warn).not.toHaveBeenCalled();
    });
});
