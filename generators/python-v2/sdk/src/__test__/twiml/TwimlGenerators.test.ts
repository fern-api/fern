import { describe, expect, it } from "vitest";

import { pythonDocstring, pythonString, TwimlBuilderGenerator } from "../../twiml/TwimlBuilderGenerator.js";
import { lowerCamel } from "../../twiml/TwimlNames.js";
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
        expect(names.getAttributeNameOverrides(names.getTagOrThrow("voice/say"))).toEqual({
            interpret_as: "interpret-as"
        });
        expect(names.getAttributeNameOverrides(names.getTagOrThrow("voice/ssml_lang"))).toEqual({
            xml_lang: "xml:lang"
        });
    });

    it("drops internal attributes from the generated surface", () => {
        const redirect = names.getTagOrThrow("voice/redirect");
        expect(names.getPublicAttributes(redirect).map((attribute) => attribute.xmlName)).toEqual(["method"]);
    });

    it("always resolves every attribute keyword back to its exact XML name", () => {
        for (const tag of Object.values(VOICE.tags)) {
            const overrides = names.getAttributeNameOverrides(tag);
            for (const attribute of names.getPublicAttributes(tag)) {
                const pythonName = names.getAttributeName(attribute);
                expect(overrides[pythonName] ?? lowerCamel(pythonName)).toBe(attribute.xmlName);
            }
        }
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

describe("pythonString", () => {
    it("escapes every character that would break a double-quoted literal", () => {
        expect(pythonString('<Say voice="alice">a\\b</Say>\r\n\t')).toBe(
            '"<Say voice=\\"alice\\">a\\\\b</Say>\\r\\n\\t"'
        );
    });
});

describe("pythonDocstring", () => {
    it("escapes backslashes, embedded triple quotes and a trailing quote", () => {
        expect(pythonDocstring('Use """raw""" speech\\ "')).toBe('Use \\"\\"\\"raw\\"\\"\\" speech\\\\ \\"');
    });
});

describe("TwimlBuilderGenerator", () => {
    const module = new TwimlBuilderGenerator({
        namespace: VOICE,
        names: createNames(),
        packagePath: ["acme", "twiml"]
    })
        .generate()
        .toString();

    it("generates a module with a builder class per tag", () => {
        expect(module).toMatchSnapshot();
    });

    it("keeps internal attributes out of signatures, docstrings and forwarding", () => {
        expect(module).not.toContain("tracing");
    });

    it("keeps a required body required even when the tag nests children", () => {
        expect(module).toContain("def emphasis(\n        self,\n        words: str,\n        *,");
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
