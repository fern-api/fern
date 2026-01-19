import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { readFile, rm } from "fs/promises";
import yaml from "js-yaml";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { EnhancedExampleRecord, writeAiExamplesOverride } from "../writeAiExamplesOverride";

describe("writeAiExamplesOverride", () => {
    let tempDir: string;
    let sourceFilePath: AbsoluteFilePath;
    let context: ReturnType<typeof createMockTaskContext>;

    beforeEach(async () => {
        tempDir = join(tmpdir(), `ai-examples-test-${Date.now()}`);
        const { mkdir } = await import("fs/promises");
        await mkdir(tempDir, { recursive: true });
        sourceFilePath = AbsoluteFilePath.of(join(tempDir, "openapi.yaml"));
        context = createMockTaskContext();
    });

    afterEach(async () => {
        try {
            await rm(tempDir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    });

    it("writes x-fern-examples with request directly (not wrapped in body)", async () => {
        const enhancedExamples: EnhancedExampleRecord[] = [
            {
                endpoint: "/v1/text-to-speech/{voice_id}",
                method: "POST",
                pathParameters: { voice_id: "JBFqnCBsd6RMkjVDRZzb" },
                requestBody: {
                    text: "Hello world",
                    model_id: "eleven_monolingual_v1"
                },
                responseBody: {
                    audio_url: "https://example.com/audio.mp3"
                }
            }
        ];

        await writeAiExamplesOverride({
            enhancedExamples,
            sourceFilePath,
            context
        });

        const outputPath = join(tempDir, "ai_examples_override.yml");
        const content = await readFile(outputPath, "utf-8");
        const parsed = yaml.load(content) as {
            paths: Record<string, Record<string, { "x-fern-examples": unknown[] }>>;
        };

        const example = parsed.paths["/v1/text-to-speech/{voice_id}"]["post"]["x-fern-examples"][0] as Record<
            string,
            unknown
        >;

        expect(example["path-parameters"]).toEqual({ voice_id: "JBFqnCBsd6RMkjVDRZzb" });
        expect(example.request).toEqual({
            text: "Hello world",
            model_id: "eleven_monolingual_v1"
        });
        expect(example.response).toEqual({
            body: { audio_url: "https://example.com/audio.mp3" }
        });
    });

    it("unwraps FDR typed value wrappers from request body", async () => {
        const enhancedExamples: EnhancedExampleRecord[] = [
            {
                endpoint: "/v1/forced-alignment",
                method: "POST",
                requestBody: {
                    file: { type: "filename", value: "lecture_recording.wav" },
                    text: { type: "json", value: "Good morning everyone, welcome to the lecture." },
                    enabled_spooled_file: { type: "boolean" }
                },
                responseBody: {
                    alignment: { type: "json", value: { words: ["Good", "morning"] } }
                }
            }
        ];

        await writeAiExamplesOverride({
            enhancedExamples,
            sourceFilePath,
            context
        });

        const outputPath = join(tempDir, "ai_examples_override.yml");
        const content = await readFile(outputPath, "utf-8");
        const parsed = yaml.load(content) as {
            paths: Record<string, Record<string, { "x-fern-examples": unknown[] }>>;
        };

        const example = parsed.paths["/v1/forced-alignment"]["post"]["x-fern-examples"][0] as Record<string, unknown>;

        expect(example.request).toEqual({
            file: "lecture_recording.wav",
            text: "Good morning everyone, welcome to the lecture."
        });
        expect(example.response).toEqual({
            body: { alignment: { words: ["Good", "morning"] } }
        });
    });

    it("filters path parameters from request body", async () => {
        const enhancedExamples: EnhancedExampleRecord[] = [
            {
                endpoint: "/v1/voices/{voice_id}/samples/{sample_id}",
                method: "GET",
                pathParameters: { voice_id: "", sample_id: "" },
                requestBody: {
                    voice_id: "JBFqnCBsd6RMkjVDRZzb",
                    sample_id: "VW7YKqPnjY4h39yTbx2L",
                    extra_field: "should remain"
                }
            }
        ];

        await writeAiExamplesOverride({
            enhancedExamples,
            sourceFilePath,
            context
        });

        const outputPath = join(tempDir, "ai_examples_override.yml");
        const content = await readFile(outputPath, "utf-8");
        const parsed = yaml.load(content) as {
            paths: Record<string, Record<string, { "x-fern-examples": unknown[] }>>;
        };

        const example = parsed.paths["/v1/voices/{voice_id}/samples/{sample_id}"]["get"][
            "x-fern-examples"
        ][0] as Record<string, unknown>;

        expect(example["path-parameters"]).toEqual({
            voice_id: "JBFqnCBsd6RMkjVDRZzb",
            sample_id: "VW7YKqPnjY4h39yTbx2L"
        });
        expect(example.request).toEqual({ extra_field: "should remain" });
    });

    it("filters header parameters from request body using headerParameterNames", async () => {
        const enhancedExamples: EnhancedExampleRecord[] = [
            {
                endpoint: "/v1/text-to-speech",
                method: "POST",
                headerParameterNames: ["xi-api-key", "Authorization"],
                requestBody: {
                    "xi-api-key": "secret-key",
                    Authorization: "Bearer token",
                    text: "Hello world"
                }
            }
        ];

        await writeAiExamplesOverride({
            enhancedExamples,
            sourceFilePath,
            context
        });

        const outputPath = join(tempDir, "ai_examples_override.yml");
        const content = await readFile(outputPath, "utf-8");
        const parsed = yaml.load(content) as {
            paths: Record<string, Record<string, { "x-fern-examples": unknown[] }>>;
        };

        const example = parsed.paths["/v1/text-to-speech"]["post"]["x-fern-examples"][0] as Record<string, unknown>;

        expect(example.headers).toEqual({
            "xi-api-key": "secret-key",
            Authorization: "Bearer token"
        });
        expect(example.request).toEqual({ text: "Hello world" });
    });

    it("omits empty request body", async () => {
        const enhancedExamples: EnhancedExampleRecord[] = [
            {
                endpoint: "/v1/voices/{voice_id}",
                method: "GET",
                pathParameters: { voice_id: "" },
                requestBody: {
                    voice_id: "JBFqnCBsd6RMkjVDRZzb"
                }
            }
        ];

        await writeAiExamplesOverride({
            enhancedExamples,
            sourceFilePath,
            context
        });

        const outputPath = join(tempDir, "ai_examples_override.yml");
        const content = await readFile(outputPath, "utf-8");
        const parsed = yaml.load(content) as {
            paths: Record<string, Record<string, { "x-fern-examples": unknown[] }>>;
        };

        const example = parsed.paths["/v1/voices/{voice_id}"]["get"]["x-fern-examples"][0] as Record<string, unknown>;

        expect(example["path-parameters"]).toEqual({ voice_id: "JBFqnCBsd6RMkjVDRZzb" });
        expect(example.request).toBeUndefined();
    });

    it("omits empty response body", async () => {
        const enhancedExamples: EnhancedExampleRecord[] = [
            {
                endpoint: "/v1/voices/{voice_id}",
                method: "DELETE",
                pathParameters: { voice_id: "JBFqnCBsd6RMkjVDRZzb" },
                responseBody: {}
            }
        ];

        await writeAiExamplesOverride({
            enhancedExamples,
            sourceFilePath,
            context
        });

        const outputPath = join(tempDir, "ai_examples_override.yml");
        const content = await readFile(outputPath, "utf-8");
        const parsed = yaml.load(content) as {
            paths: Record<string, Record<string, { "x-fern-examples": unknown[] }>>;
        };

        const example = parsed.paths["/v1/voices/{voice_id}"]["delete"]["x-fern-examples"][0] as Record<
            string,
            unknown
        >;

        expect(example["path-parameters"]).toEqual({ voice_id: "JBFqnCBsd6RMkjVDRZzb" });
        expect(example.response).toBeUndefined();
    });

    it("real-world example: ElevenLabs forced alignment endpoint with FDR wrappers", async () => {
        const enhancedExamples: EnhancedExampleRecord[] = [
            {
                endpoint: "/v1/forced-alignment",
                method: "POST",
                headerParameterNames: ["xi-api-key"],
                requestBody: {
                    file: { type: "filename", value: "lecture_recording.wav" },
                    text: {
                        type: "json",
                        value: "Good morning everyone, welcome to the lecture on machine learning."
                    },
                    enabled_spooled_file: { type: "boolean" },
                    "xi-api-key": { type: "json", value: "your-api-key" }
                },
                responseBody: {
                    alignment: {
                        type: "json",
                        value: {
                            words: [
                                { word: "Good", start: 0.0, end: 0.3 },
                                { word: "morning", start: 0.3, end: 0.7 }
                            ]
                        }
                    }
                }
            }
        ];

        await writeAiExamplesOverride({
            enhancedExamples,
            sourceFilePath,
            context
        });

        const outputPath = join(tempDir, "ai_examples_override.yml");
        const content = await readFile(outputPath, "utf-8");
        const parsed = yaml.load(content) as {
            paths: Record<string, Record<string, { "x-fern-examples": unknown[] }>>;
        };

        const example = parsed.paths["/v1/forced-alignment"]["post"]["x-fern-examples"][0] as Record<string, unknown>;

        expect(example.headers).toEqual({ "xi-api-key": "your-api-key" });
        expect(example.request).toEqual({
            file: "lecture_recording.wav",
            text: "Good morning everyone, welcome to the lecture on machine learning."
        });
        expect(example.response).toEqual({
            body: {
                alignment: {
                    words: [
                        { word: "Good", start: 0.0, end: 0.3 },
                        { word: "morning", start: 0.3, end: 0.7 }
                    ]
                }
            }
        });
    });

    it("handles multiple endpoints in a single write", async () => {
        const enhancedExamples: EnhancedExampleRecord[] = [
            {
                endpoint: "/v1/voices",
                method: "GET",
                responseBody: { voices: [{ voice_id: "abc", name: "Test Voice" }] }
            },
            {
                endpoint: "/v1/voices/{voice_id}",
                method: "GET",
                pathParameters: { voice_id: "abc" },
                responseBody: { voice_id: "abc", name: "Test Voice" }
            },
            {
                endpoint: "/v1/text-to-speech/{voice_id}",
                method: "POST",
                pathParameters: { voice_id: "abc" },
                requestBody: { text: "Hello" },
                responseBody: { audio_url: "https://example.com/audio.mp3" }
            }
        ];

        await writeAiExamplesOverride({
            enhancedExamples,
            sourceFilePath,
            context
        });

        const outputPath = join(tempDir, "ai_examples_override.yml");
        const content = await readFile(outputPath, "utf-8");
        const parsed = yaml.load(content) as {
            paths: Record<string, Record<string, { "x-fern-examples": unknown[] }>>;
        };

        expect(Object.keys(parsed.paths)).toHaveLength(3);
        expect(parsed.paths["/v1/voices"]["get"]["x-fern-examples"]).toHaveLength(1);
        expect(parsed.paths["/v1/voices/{voice_id}"]["get"]["x-fern-examples"]).toHaveLength(1);
        expect(parsed.paths["/v1/text-to-speech/{voice_id}"]["post"]["x-fern-examples"]).toHaveLength(1);
    });
});
