import { FernIr } from "@fern-api/ir-sdk";
import { describe, expect, it } from "vitest";
import { convertFixture, errorMessages } from "./testUtils.js";

function originalName(name: FernIr.NameOrString): string {
    return typeof name === "string" ? name : name.originalName;
}

function wireValue(value: FernIr.NameAndWireValueOrString): string {
    return typeof value === "string" ? value : value.wireValue;
}

function nodeAt(content: FernIr.TwimlExampleContent | undefined): FernIr.TwimlExampleNode {
    if (content?.type !== "node") {
        throw new Error(`expected a node, got ${content?.type ?? "nothing"}`);
    }
    return content;
}

function attributeValue({
    node,
    name
}: {
    node: FernIr.TwimlExampleNode;
    name: string;
}): FernIr.TwimlExampleValue | undefined {
    return node.attributes.find((attribute) => originalName(attribute.name) === name)?.value;
}

describe("TwimlConverter", () => {
    it("converts the basic fixture into the twiml IR section", async () => {
        const { ir, errorCollector } = await convertFixture({ fixture: "basic" });

        expect(errorMessages(errorCollector)).toEqual([]);
        expect(ir.twiml).toBeDefined();
        await expect(JSON.stringify(ir.twiml, undefined, 2)).toMatchFileSnapshot("./__snapshots__/basic.json");
    });

    it("keeps the exact xml name alongside the normalized name", async () => {
        const { ir } = await convertFixture({ fixture: "basic", withExamples: false });
        const voice = ir.twiml?.namespaces.find((namespace) => originalName(namespace.name) === "voice");
        expect(voice?.root).toBe("voice");

        const root = voice?.tags["voice"];
        expect(root?.xmlName).toBe("Response");
        expect(root?.children).toEqual(["voice/say", "voice/dial", "voice/pause"]);

        const emphasis = voice?.tags["voice/ssml_emphasis"];
        expect(emphasis?.xmlName).toBe("emphasis");
        expect(emphasis?.children).toContain("voice/ssml_emphasis");
        expect(emphasis?.body?.required).toBe(true);

        const dial = voice?.tags["voice/dial"];
        const callerId = dial?.attributes.find((attribute) => originalName(attribute.name) === "caller_id");
        expect(callerId?.xmlName).toBe("callerId");
        expect(callerId?.type.type).toBe("union");
        const internal = dial?.attributes.find(
            (attribute) => originalName(attribute.name) === "recording_status_callback_event"
        );
        expect(internal?.visibility).toBe(FernIr.TwimlVisibility.Internal);
    });

    it("preserves ordered mixed text and child content in examples", async () => {
        const { ir } = await convertFixture({ fixture: "basic" });
        const example = ir.twiml?.examples.find((candidate) => originalName(candidate.name) === "ssml-mixed");
        const say = nodeAt(example?.root.content[0]);
        expect(say.content.map((content) => content.type)).toEqual(["text", "node", "text"]);
        const emphasis = nodeAt(say.content[1]);
        expect(emphasis.tag).toBe("voice/ssml_emphasis");
        expect(emphasis.content.map((content) => content.type)).toEqual(["text", "node", "text"]);
        expect(nodeAt(emphasis.content[1]).tag).toBe("voice/ssml_break");
    });

    it("types example attribute values from the tag definition", async () => {
        const { ir } = await convertFixture({ fixture: "basic" });
        const example = ir.twiml?.examples.find((candidate) => originalName(candidate.name) === "dial-number");
        const dial = nodeAt(example?.root.content[0]);

        expect(attributeValue({ node: dial, name: "caller_id" })).toMatchObject({
            type: "string",
            value: "+15551112222"
        });
        expect(attributeValue({ node: dial, name: "hangup_on_star" })).toMatchObject({ type: "boolean", value: true });

        const number = nodeAt(dial.content[0]);
        expect(attributeValue({ node: number, name: "byoc" })).toMatchObject({
            type: "string",
            value: "BY1234567890abcdef1234567890abcdef"
        });
        const events = attributeValue({ node: number, name: "status_callback_event" });
        if (events?.type !== "list") {
            throw new Error(`expected a list, got ${events?.type ?? "nothing"}`);
        }
        expect(events.items.map((item) => (item.type === "enum" ? wireValue(item.value) : item.type))).toEqual([
            "initiated",
            "ringing"
        ]);
    });

    it("reports invalid definitions without throwing", async () => {
        const { ir, errorCollector } = await convertFixture({ fixture: "invalid", withExamples: false });
        const messages = errorMessages(errorCollector);

        expect(messages).toEqual(
            expect.arrayContaining([
                expect.stringContaining("no root document messaging.json"),
                expect.stringContaining("voice/missing"),
                expect.stringContaining("enum 'nope' is not declared on this tag"),
                expect.stringContaining("unknown type 'int'")
            ])
        );
        expect(ir.twiml?.namespaces.map((namespace) => originalName(namespace.name))).toEqual(["voice"]);
    });
});

describe("TwimlConverter examples", () => {
    it("rejects examples that do not match the tag definitions", async () => {
        const { ir, errorCollector } = await convertFixture({ fixture: "basic", examplesDir: "invalid-examples" });
        const messages = errorMessages(errorCollector);

        expect(messages).toEqual(
            expect.arrayContaining([
                expect.stringContaining("'robot' is not a value of enum 'voice'"),
                expect.stringContaining("<Say> does not accept attribute 'volume'"),
                expect.stringContaining("'two' is not an integer"),
                expect.stringContaining("<Pause> does not accept text content"),
                expect.stringContaining("<Number> is not allowed inside <Response>"),
                expect.stringContaining("'' is not an integer"),
                expect.stringContaining("<emphasis> requires text content")
            ])
        );
        expect(ir.twiml?.examples).toEqual([]);
    });
});
