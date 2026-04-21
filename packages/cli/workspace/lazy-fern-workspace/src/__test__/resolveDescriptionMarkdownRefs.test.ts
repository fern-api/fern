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

    it("warns and coerces JSON Pointer refs to empty string", async () => {
        const doc = {
            info: { description: { $ref: "#/components/schemas/Foo" } }
        };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        expect((doc.info as Record<string, unknown>).description).toBe("");
        expect(warn).toHaveBeenCalledOnce();
        expect(warn.mock.calls[0]?.[0]).toContain("info.description");
        expect(warn.mock.calls[0]?.[0]).toContain("#/components/schemas/Foo");
    });

    it("warns and coerces URL refs to empty string", async () => {
        const doc = {
            info: { description: { $ref: "https://example.com/foo.md" } }
        };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        expect((doc.info as Record<string, unknown>).description).toBe("");
        expect(warn).toHaveBeenCalledOnce();
        expect(warn.mock.calls[0]?.[0]).toContain("https://example.com/foo.md");
    });

    it("warns and coerces non-markdown file refs to empty string", async () => {
        const doc = {
            info: { description: { $ref: "./description.txt" } }
        };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        expect((doc.info as Record<string, unknown>).description).toBe("");
        expect(warn).toHaveBeenCalledOnce();
        expect(warn.mock.calls[0]?.[0]).toContain("./description.txt");
    });

    it("warns and coerces $ref objects with sibling keys to empty string", async () => {
        await writeFile(join(tempDir, "foo.md"), "ignored");
        const doc = {
            info: { description: { $ref: "./foo.md", summary: "other" } }
        };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        expect((doc.info as Record<string, unknown>).description).toBe("");
        expect(warn).toHaveBeenCalledOnce();
        expect(warn.mock.calls[0]?.[0]).toContain("sibling keys");
        expect(warn.mock.calls[0]?.[0]).toContain("summary");
    });

    it("leaves string descriptions unchanged", async () => {
        const doc = { info: { description: "already a string" } };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        expect(doc.info.description).toBe("already a string");
        expect(warn).not.toHaveBeenCalled();
    });

    it("does not touch schema properties literally named 'description'", async () => {
        const doc = {
            components: {
                schemas: {
                    User: {
                        type: "object",
                        description: "A user",
                        properties: {
                            description: {
                                type: "string",
                                description: "The user-supplied description field"
                            },
                            otherField: { $ref: "#/components/schemas/Other" }
                        }
                    }
                }
            }
        };

        const { context, warn } = createContextWithWarn();
        await resolveDescriptionMarkdownRefs(doc, tempDir, context);

        const user = (doc.components as Record<string, Record<string, Record<string, unknown>>>).schemas?.User;
        expect(user?.description).toBe("A user");
        const props = user?.properties as Record<string, Record<string, unknown>>;
        expect(props.description).toEqual({
            type: "string",
            description: "The user-supplied description field"
        });
        expect(props.otherField).toEqual({ $ref: "#/components/schemas/Other" });
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
