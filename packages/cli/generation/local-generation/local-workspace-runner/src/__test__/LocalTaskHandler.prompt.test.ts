import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read the BAML source file directly for prompt verification
const diffAnalyzerBamlPath = resolve(__dirname, "../../../../../../cli/ai/baml_src/diff_analyzer.baml");
const diffAnalyzerBaml = readFileSync(diffAnalyzerBamlPath, "utf-8");

// Read LocalTaskHandler.ts source for call-site verification
const localTaskHandlerPath = resolve(__dirname, "../LocalTaskHandler.ts");
const localTaskHandlerSource = readFileSync(localTaskHandlerPath, "utf-8");

describe("LocalTaskHandler prompt - previous_version parameter", () => {
    it("AnalyzeSdkDiff BAML function signature accepts diff, language, and previous_version", () => {
        expect(diffAnalyzerBaml).toContain("function AnalyzeSdkDiff(");
        expect(diffAnalyzerBaml).toContain('diff: string @description("The git diff to analyze")');
        expect(diffAnalyzerBaml).toContain(
            "language: string @description(\"The SDK programming language, e.g. 'typescript', 'python', 'java'\")"
        );
        expect(diffAnalyzerBaml).toContain(
            "previous_version: string @description(\"The current published version before this change, e.g. '1.2.3'\")"
        );
    });

    it("prompt includes Previous version template variable", () => {
        expect(diffAnalyzerBaml).toContain("Previous version: {{previous_version}}");
    });

    it("prompt includes SDK language template variable", () => {
        expect(diffAnalyzerBaml).toContain("SDK language: {{language}}");
    });

    it("prompt includes guidance for previous_version context usage", () => {
        // Verify the guideline about not including previous_version literally
        expect(diffAnalyzerBaml).toContain("The previous version is provided for context only. Do not include it");
    });

    it("passes '0.0.0' as previous_version when no previous version exists", () => {
        // When previousVersion is undefined (new repo), "0.0.0" should be passed
        expect(localTaskHandlerSource).toContain('previousVersion ?? "0.0.0"');
    });

    it("passes generatorLanguage to AnalyzeSdkDiff with 'unknown' fallback", () => {
        expect(localTaskHandlerSource).toContain('this.generatorLanguage ?? "unknown"');
    });

    it("LocalTaskHandler Init interface includes generatorLanguage field", () => {
        expect(localTaskHandlerSource).toContain("generatorLanguage: string | undefined;");
    });
});
