import { getBamlFiles } from "../../src/baml_client/inlinedbaml.js";

const promptContent = getBamlFiles()["diff_analyzer.baml"];

describe("AnalyzeSdkDiff few-shot examples", () => {
    it("prompt includes MAJOR example for removed export", () => {
        expect(promptContent).toContain("MAJOR: removed exported TypeScript function");
        expect(promptContent).toContain("Existing callers of getUser() will get a compile error");
    });

    it("prompt includes MINOR example for new optional parameter", () => {
        expect(promptContent).toContain("MINOR: new optional TypeScript parameter");
        expect(promptContent).toContain("new parameter is optional");
    });

    it("prompt includes PATCH example for import reorganization", () => {
        expect(promptContent).toContain("PATCH: Go import reorganization");
        expect(promptContent).toContain("Formatting change only, no functional difference");
    });

    it("prompt covers TypeScript language in examples", () => {
        expect(promptContent).toContain("client.ts");
    });

    it("prompt covers Python language in examples", () => {
        expect(promptContent).toContain("client.py");
    });

    it("prompt covers Java or Go language in examples", () => {
        const hasJava = promptContent.includes("UsersClient.java");
        const hasGo = promptContent.includes("client.go");
        expect(hasJava || hasGo).toBe(true);
    });

    it("prompt includes 'when in doubt' guidance after examples", () => {
        expect(promptContent).toContain("When in doubt between MINOR and PATCH");
        expect(promptContent).toContain("When in doubt between MAJOR and MINOR");

        // Verify guidance comes after examples
        const endExamplesIndex = promptContent.indexOf("--- End Examples ---");
        const guidanceIndex = promptContent.indexOf("When in doubt between MINOR and PATCH");
        expect(endExamplesIndex).toBeGreaterThan(-1);
        expect(guidanceIndex).toBeGreaterThan(endExamplesIndex);
    });
});
