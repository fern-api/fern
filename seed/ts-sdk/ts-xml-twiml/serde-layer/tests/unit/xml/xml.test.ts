import {
    parseXml,
    serializeXmlElement,
    XmlElement,
    XmlParseError,
    xmlAttribute,
    xmlBoolean,
    xmlChildren,
    xmlEnum,
    xmlExtraAttributes,
    xmlInteger,
    xmlScalar,
    xmlScalarList,
    xmlText,
    xmlUnknownChildren,
} from "../../../src/core/xml/index";

describe("serializeXmlElement", () => {
    it("renders attributes, text and children with escaping", () => {
        const xml = serializeXmlElement({
            name: "Say",
            attributes: [
                { name: "voice", value: "Polly.Joanna" },
                { name: "loop", value: 2 },
                { name: "skipped", value: undefined },
                { name: "events", value: ["a", "b"], separator: " " },
            ],
            text: 'Hello <world> & "friends"',
            children: [{ name: "Tag", value: ["x", "y"] }],
            additionalChildren: [new XmlElement({ name: "Extra", attributes: { k: "v" } })],
        });
        expect(xml).toBe(
            '<Say voice="Polly.Joanna" loop="2" events="a b">Hello &lt;world&gt; &amp; &quot;friends&quot;<Tag>x</Tag><Tag>y</Tag><Extra k="v" /></Say>',
        );
    });

    it("self-closes empty elements and supports namespaces, wrappers and declarations", () => {
        expect(serializeXmlElement({ name: "Hangup" })).toBe("<Hangup />");
        expect(
            serializeXmlElement({
                name: "Dial",
                namespace: "https://www.twilio.com/twiml",
                prefix: "tw",
                children: [{ name: "Numbers", value: [new XmlElement({ name: "Number", text: "+1" })], wrapped: true }],
            }),
        ).toBe('<tw:Dial xmlns:tw="https://www.twilio.com/twiml"><Numbers><Number>+1</Number></Numbers></tw:Dial>');
        expect(serializeXmlElement({ name: "Response", xmlDeclaration: true })).toBe(
            '<?xml version="1.0" encoding="UTF-8"?><Response />',
        );
    });
});

describe("parseXml", () => {
    it("parses attributes, text, entities, CDATA and nested children", () => {
        const node = parseXml(
            '<?xml version="1.0"?><!-- c --><Say voice="man" loop=\'2\'>Hi &amp; <![CDATA[<bye>]]><break time="1s"/> </Say>',
            "Say",
        );
        expect(node.attributes).toEqual({ voice: "man", loop: "2" });
        expect(xmlText(node)).toBe("Hi & <bye> ");
        expect(node.children.map((child) => child.name)).toEqual(["break"]);
        expect(xmlAttribute(node.children[0] as NonNullable<(typeof node.children)[0]>, "time")).toBe("1s");
    });

    it("keeps prefixes and validates the root local name", () => {
        const node = parseXml('<tw:Dial xmlns:tw="https://www.twilio.com/twiml">+1</tw:Dial>', "Dial");
        expect(node.name).toBe("tw:Dial");
        expect(() => parseXml("<Say />", "Dial")).toThrow(/expected <Dial> element but found <Say>/);
    });

    it("rejects malformed documents and DOCTYPEs", () => {
        expect(() => parseXml("<Say>")).toThrow(XmlParseError);
        expect(() => parseXml("<Say></Dial>")).toThrow(XmlParseError);
        expect(() => parseXml("<Say a=1 />")).toThrow(XmlParseError);
        expect(() => parseXml("<Say /><Say />")).toThrow(XmlParseError);
        expect(() => parseXml('<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><Say>&xxe;</Say>')).toThrow(
            /DOCTYPE/,
        );
    });
});

describe("readers", () => {
    it("converts scalars and lists and reports invalid values", () => {
        expect(xmlScalar("3", xmlInteger, "Say.loop")).toBe(3);
        expect(xmlScalar(undefined, xmlInteger, "Say.loop")).toBeUndefined();
        expect(() => xmlScalar("x", xmlInteger, "Say.loop")).toThrow(/Say.loop must be an integer/);
        expect(xmlScalar("true", xmlBoolean, "b")).toBe(true);
        expect(xmlScalarList("speech dtmf", " ", xmlEnum(["speech", "dtmf"] as const), "input")).toEqual([
            "speech",
            "dtmf",
        ]);
        expect(() => xmlScalar("loud", xmlEnum(["quiet"] as const), "strength")).toThrow(/must be one of "quiet"/);
    });

    it("reads typed children, wrapped lists, extra attributes and unknown children", () => {
        const node = parseXml(
            '<Dial foo="bar" xmlns:tw="x"><Numbers><Number>+1</Number><Number>+2</Number></Numbers><Brandnew k="v">t</Brandnew></Dial>',
        );
        expect(xmlChildren(node, { Number: (child) => child.text }, { wrapper: "Numbers" })).toEqual(["+1", "+2"]);
        expect(xmlChildren(node, { Number: (child) => child.text })).toBeUndefined();
        expect(xmlExtraAttributes(node, [])).toEqual({ foo: "bar" });
        const unknown = xmlUnknownChildren(node, ["Numbers"]);
        expect(unknown.map((child) => child.toXml())).toEqual(['<Brandnew k="v">t</Brandnew>']);
    });

    it("round-trips an XmlElement", () => {
        const xml = '<a b="1"><c>text</c><d /></a>';
        expect(XmlElement.fromXml(xml).toXml()).toBe(xml);
    });
});
