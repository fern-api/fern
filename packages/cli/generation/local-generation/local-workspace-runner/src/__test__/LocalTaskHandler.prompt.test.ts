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

    it("prompt includes conditional language-specific breaking change rules", () => {
        // Conditional blocks for each language
        expect(diffAnalyzerBaml).toContain('{% if language == "typescript" %}');
        expect(diffAnalyzerBaml).toContain('{% elif language == "python" %}');
        expect(diffAnalyzerBaml).toContain('{% elif language == "java" %}');
        expect(diffAnalyzerBaml).toContain('{% elif language == "go" %}');
        expect(diffAnalyzerBaml).toContain('{% elif language == "ruby" %}');
        expect(diffAnalyzerBaml).toContain('{% elif language == "csharp" %}');
        expect(diffAnalyzerBaml).toContain('{% elif language == "php" %}');
        expect(diffAnalyzerBaml).toContain('{% elif language == "swift" %}');
        expect(diffAnalyzerBaml).toContain('{% elif language == "rust" %}');
        expect(diffAnalyzerBaml).toContain('{% elif language == "kotlin" %}');
        expect(diffAnalyzerBaml).toContain("{% else %}");
        expect(diffAnalyzerBaml).toContain("{% endif %}");
    });

    it("each language block has MAJOR, MINOR, and PATCH sections", () => {
        // Each conditional language block should have all three severity sections
        expect(diffAnalyzerBaml).toContain("MAJOR (breaking):");
        expect(diffAnalyzerBaml).toContain("MINOR (backward-compatible additions):");
        expect(diffAnalyzerBaml).toContain("PATCH (no API surface change):");
    });

    it("rules cover SDK-specific patterns like version headers and RequestOptions", () => {
        expect(diffAnalyzerBaml).toContain("Updating SDK version headers");
        expect(diffAnalyzerBaml).toContain("RequestOptions");
        expect(diffAnalyzerBaml).toContain("retry logic");
    });

    it("typescript rules cover type narrowing, discriminated unions, and generics", () => {
        expect(diffAnalyzerBaml).toContain(
            "Making a response field optional is MAJOR (type changes from T to T | undefined"
        );
        expect(diffAnalyzerBaml).toContain("discriminated union");
        expect(diffAnalyzerBaml).toContain("generic type parameter constraint");
        expect(diffAnalyzerBaml).toContain("Narrowing a parameter type");
    });

    it("python rules cover duck typing, keyword args, and Pydantic models", () => {
        expect(diffAnalyzerBaml).toContain(
            "Making a response field optional is usually MINOR (Python uses None propagation"
        );
        expect(diffAnalyzerBaml).toContain("keyword arguments");
        expect(diffAnalyzerBaml).toContain("Pydantic models");
    });

    it("java rules cover Optional unwrapping, builders, and checked exceptions", () => {
        expect(diffAnalyzerBaml).toContain("Optional unwrapping");
        expect(diffAnalyzerBaml).toContain("builder method");
        expect(diffAnalyzerBaml).toContain("checked exceptions");
    });

    it("go rules cover pointer types, interfaces, and functional options", () => {
        expect(diffAnalyzerBaml).toContain("Making a response field a pointer type");
        expect(diffAnalyzerBaml).toContain("Go has no overloading");
        expect(diffAnalyzerBaml).toContain("functional options pattern");
    });

    it("rust rules cover Option<T>, #[non_exhaustive], and trait implementations", () => {
        expect(diffAnalyzerBaml).toContain("Making a response field optional (T to Option<T>)");
        expect(diffAnalyzerBaml).toContain("#[non_exhaustive]");
        expect(diffAnalyzerBaml).toContain("trait implementation");
    });

    it("prompt includes fallback rules for unknown languages", () => {
        expect(diffAnalyzerBaml).toContain("Making a response field optional is MAJOR in statically-typed languages");
    });
});
