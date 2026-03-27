import { Volume } from "memfs/lib/volume";
import { beforeEach, describe, expect, it } from "vitest";
import { writeTemplateFilesToVolume } from "../writeTemplateFiles.js";

describe("writeTemplateFilesToVolume", () => {
    let volume: InstanceType<typeof Volume>;

    beforeEach(() => {
        volume = new Volume();
    });

    it("renders a template file and removes the original", () => {
        volume.mkdirSync("/src/core/fetcher", { recursive: true });
        volume.writeFileSync(
            "/src/core/fetcher/getFetchFn.template.ts",
            'export async function getFetchFn(): Promise<any> {\n    <% if (it.fetchSupport === "native") { %>return fetch;<% } else { %>return (await import("node-fetch")).default;<% } %>\n}\n'
        );

        writeTemplateFilesToVolume(volume, { fetchSupport: "native" });

        // Rendered file should exist
        expect(volume.existsSync("/src/core/fetcher/getFetchFn.ts")).toBe(true);
        const content = volume.readFileSync("/src/core/fetcher/getFetchFn.ts", "utf-8").toString();
        expect(content).toContain("return fetch;");
        expect(content).not.toContain("<%");
        expect(content).not.toContain("%>");

        // Template file should be removed
        expect(volume.existsSync("/src/core/fetcher/getFetchFn.template.ts")).toBe(false);
    });

    it("renders template with different variable values", () => {
        volume.mkdirSync("/src/core/fetcher", { recursive: true });
        volume.writeFileSync(
            "/src/core/fetcher/getFetchFn.template.ts",
            '<% if (it.fetchSupport === "native") { %>NATIVE<% } else { %>NODE_FETCH<% } %>'
        );

        writeTemplateFilesToVolume(volume, { fetchSupport: "node-fetch" });

        const content = volume.readFileSync("/src/core/fetcher/getFetchFn.ts", "utf-8").toString();
        expect(content).toContain("NODE_FETCH");
        expect(content).not.toContain("NATIVE");
    });

    it("processes multiple template files", () => {
        volume.mkdirSync("/src/core/fetcher", { recursive: true });
        volume.writeFileSync(
            "/src/core/fetcher/getFetchFn.template.ts",
            "export const fetch = <%= it.fetchSupport %>;"
        );
        volume.writeFileSync(
            "/src/core/fetcher/getResponseBody.template.ts",
            "export const stream = <%= it.streamType %>;"
        );

        writeTemplateFilesToVolume(volume, { fetchSupport: '"native"', streamType: '"web"' });

        expect(volume.existsSync("/src/core/fetcher/getFetchFn.ts")).toBe(true);
        expect(volume.existsSync("/src/core/fetcher/getResponseBody.ts")).toBe(true);
        expect(volume.existsSync("/src/core/fetcher/getFetchFn.template.ts")).toBe(false);
        expect(volume.existsSync("/src/core/fetcher/getResponseBody.template.ts")).toBe(false);
    });

    it("does nothing when no template files exist", () => {
        volume.mkdirSync("/src/core/fetcher", { recursive: true });
        volume.writeFileSync("/src/core/fetcher/Fetcher.ts", "export class Fetcher {}\n");

        writeTemplateFilesToVolume(volume, {});

        // Existing file should be untouched
        const content = volume.readFileSync("/src/core/fetcher/Fetcher.ts", "utf-8").toString();
        expect(content).toBe("export class Fetcher {}\n");
    });

    it("only processes files with .template. in the name", () => {
        volume.mkdirSync("/src", { recursive: true });
        volume.writeFileSync("/src/regular.ts", "export const x = 1;\n");
        volume.writeFileSync("/src/template.ts", "export const y = 2;\n");
        volume.writeFileSync("/src/myFile.template.ts", "export const z = <%= it.value %>;");

        writeTemplateFilesToVolume(volume, { value: "42" });

        // Only the .template. file should be processed
        expect(volume.readFileSync("/src/regular.ts", "utf-8").toString()).toBe("export const x = 1;\n");
        expect(volume.readFileSync("/src/template.ts", "utf-8").toString()).toBe("export const y = 2;\n");
        expect(volume.existsSync("/src/myFile.ts")).toBe(true);
        expect(volume.readFileSync("/src/myFile.ts", "utf-8").toString()).toBe("export const z = 42;");
        expect(volume.existsSync("/src/myFile.template.ts")).toBe(false);
    });

    it("handles nested directory structures", () => {
        volume.mkdirSync("/src/core/fetcher/internal", { recursive: true });
        volume.writeFileSync("/src/core/fetcher/internal/helper.template.ts", "export const x = <%= it.val %>;");

        writeTemplateFilesToVolume(volume, { val: "true" });

        expect(volume.existsSync("/src/core/fetcher/internal/helper.ts")).toBe(true);
        expect(volume.readFileSync("/src/core/fetcher/internal/helper.ts", "utf-8").toString()).toBe(
            "export const x = true;"
        );
        expect(volume.existsSync("/src/core/fetcher/internal/helper.template.ts")).toBe(false);
    });
});
