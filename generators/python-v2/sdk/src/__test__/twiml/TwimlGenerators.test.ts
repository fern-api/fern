import { describe, expect, it } from "vitest";

import { TwimlBuilderGenerator } from "../../twiml/TwimlBuilderGenerator.js";
import { TwimlSnippetGenerator } from "../../twiml/TwimlSnippetGenerator.js";
import { createNames, EXAMPLES, VOICE } from "./fixture.js";

describe("TwimlNames", () => {
    const names = createNames();

    it("derives module, class, method and attribute names", () => {
        expect(names.getModuleName()).toBe("voice_response");
        expect(names.getClassName(names.getTagOrThrow("voice/ssml_break"))).toBe("SsmlBreak");
        expect(names.getChildMethodName(names.getTagOrThrow("voice/ssml_break"))).toBe("break_");
        expect(names.getChildMethodName(names.getTagOrThrow("voice/say"))).toBe("say");
        const prompt = names.getTagOrThrow("voice/prompt");
        expect(prompt.attributes.map((attribute) => names.getAttributeName(attribute))).toEqual([
            "for_",
            "attempt",
            "caller_id"
        ]);
    });

    it("only overrides attribute names the runtime cannot derive by lowerCamel-casing", () => {
        expect(names.getAttributeNameOverrides(names.getTagOrThrow("voice/prompt"))).toEqual({});
        expect(names.getAttributeNameOverrides(names.getTagOrThrow("voice/ssml_lang"))).toEqual({
            xml_lang: "xml:lang"
        });
    });

    it("collapses unions whose members map to the same Python type", () => {
        const prompt = names.getTagOrThrow("voice/prompt");
        expect(prompt.attributes.map((attribute) => names.getPythonType(attribute.type).toString())).toEqual([
            "str",
            "List[int]",
            "str"
        ]);
    });
});

describe("TwimlBuilderGenerator", () => {
    it("generates a module with a builder class per tag", () => {
        const generator = new TwimlBuilderGenerator({
            namespace: VOICE,
            names: createNames(),
            packagePath: ["acme", "twiml"]
        });
        expect(generator.generate().toString()).toMatchSnapshot();
    });
});

describe("TwimlSnippetGenerator", () => {
    const generator = new TwimlSnippetGenerator({ names: createNames() });

    it("uses the fluent child method for leaf children", () => {
        const example = EXAMPLES.find((candidate) => candidate.id === "say-hello");
        expect(example).toBeDefined();
        if (example == null) {
            return;
        }
        expect(generator.generate(example)).toEqual({
            imports: ["VoiceResponse"],
            rootVariable: "response",
            statements: ["response = VoiceResponse()", 'response.say("Hello!", voice="woman", loop=2)']
        });
    });

    it("builds nested children standalone and appends them", () => {
        const example = EXAMPLES.find((candidate) => candidate.id === "prompt-and-redirect");
        expect(example).toBeDefined();
        if (example == null) {
            return;
        }
        expect(generator.generate(example)).toEqual({
            imports: ["Prompt", "VoiceResponse"],
            rootVariable: "response",
            statements: [
                "response = VoiceResponse()",
                'prompt = Prompt(for_="payment-card-number", attempt=[1, 2])',
                'prompt.say("Card & expiry")',
                "response.append(prompt)",
                'response.redirect("https://example.com/next?a=1&b=2", method="POST")'
            ]
        });
    });

    it("preserves ordered mixed text and node content", () => {
        const example = EXAMPLES.find((candidate) => candidate.id === "ssml-mixed");
        expect(example).toBeDefined();
        if (example == null) {
            return;
        }
        expect(generator.generate(example).statements).toEqual([
            "response = VoiceResponse()",
            'say = Say("Hello ")',
            'ssml_emphasis = SsmlEmphasis("world", level="strong")',
            'ssml_emphasis.break_(strength="x-weak")',
            'ssml_emphasis.add_text("again")',
            "say.append(ssml_emphasis)",
            'say.add_text(", ")',
            'say.lang("au revoir", xml_lang="fr-FR")',
            "response.append(say)"
        ]);
    });
});
