import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { mkdtemp, readFile } from "fs/promises";
import yaml from "js-yaml";
import { tmpdir } from "os";
import { join } from "path";
import { describe, expect, it, vi } from "vitest";
import { writeAiExamplesOverride } from "../writeAiExamplesOverride.js";

const context = { logger: { debug: vi.fn(), warn: vi.fn() } } as unknown as TaskContext;

describe("writeAiExamplesOverride", () => {
    it("keeps every endpoint when specs in one directory write concurrently", async () => {
        const dir = await mkdtemp(join(tmpdir(), "ai-examples-override-"));
        const endpoints = ["/plants", "/plants/{id}", "/seeds", "/gardens", "/soil"];
        await Promise.all(
            endpoints.map((endpoint, index) =>
                writeAiExamplesOverride({
                    enhancedExamples: [{ endpoint, method: "GET", responseBody: { index } }],
                    sourceFilePath: AbsoluteFilePath.of(join(dir, `openapi-${index}.yml`)),
                    context
                })
            )
        );
        const written = yaml.load(await readFile(join(dir, "ai_examples_override.yml"), "utf-8")) as {
            paths: Record<string, unknown>;
        };
        expect(Object.keys(written.paths).sort()).toEqual([...endpoints].sort());
    });
});
