import {
    orderXmlContent,
    parseXml,
    replaceXmlContent,
    serializeXmlElement,
    XmlComment,
    XmlElement,
    XmlParseError,
    XmlSiblingComments,
    xmlAttribute,
    xmlBoolean,
    xmlBuildContent,
    xmlChildren,
    xmlContent,
    xmlContentElements,
    xmlEnum,
    xmlExtraAttributes,
    xmlInitialContent,
    xmlInteger,
    xmlLeadingText,
    xmlScalar,
    xmlScalarList,
    xmlText,
    xmlToSet,
    xmlUnknownChildren,
    xmlWrapperFragments,
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
                { name: "tags", value: new Set(["c", "d"]), separator: "," },
            ],
            text: 'Hello <world> & "friends"',
            children: [{ name: "Tag", value: new Set(["x", "y"]) }],
            additionalChildren: [new XmlElement({ name: "Extra", attributes: { k: "v" } })],
        });
        expect(xml).toBe(
            '<Say voice="Polly.Joanna" loop="2" events="a b" tags="c,d">Hello &lt;world&gt; &amp; &quot;friends&quot;<Tag>x</Tag><Tag>y</Tag><Extra k="v" /></Say>',
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

    it("decodes valid entity references and rejects malformed ones", () => {
        expect(xmlText(parseXml("<Say>&#65;&#x42;&lt;&gt;&apos;&quot;&#x1F600;</Say>"))).toBe("AB<>'\"\u{1F600}");
        expect(() => parseXml("<Say>fish & chips</Say>")).toThrow(XmlParseError);
        expect(() => parseXml("<Say>&amp</Say>")).toThrow(XmlParseError);
        expect(() => parseXml("<Say>&nbsp;</Say>")).toThrow(/unknown entity &nbsp;/);
        expect(() => parseXml("<Say>&#x110000;</Say>")).toThrow(/invalid character reference/);
        expect(() => parseXml("<Say>&#;</Say>")).toThrow(XmlParseError);
        expect(() => parseXml('<Say a="x & y" />')).toThrow(XmlParseError);
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
        const many = Array.from({ length: 12 }, (_, i) => `v${i}`);
        expect(() => xmlScalar("bogus", xmlEnum(many), "voice")).toThrow(
            /must be one of "v0", "v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", … \(2 more\) but was "bogus"$/,
        );
        expect(xmlToSet(xmlScalarList("a,b,a", ",", (item) => item, "tags"))).toEqual(new Set(["a", "b"]));
        expect(xmlToSet(undefined)).toBeUndefined();
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

    it("preserves unknown children inside wrappers without duplicating known ones", () => {
        const xml = '<Dial><Numbers x="1"><Number>+1</Number><Extension>x</Extension></Numbers><Other /></Dial>';
        const node = parseXml(xml, "Dial");
        const numbers = xmlChildren(node, { Number: (child) => child.text }, { wrapper: "Numbers" });
        const unknown = xmlUnknownChildren(node, ["Numbers"], { Numbers: ["Number"] });
        expect(numbers).toEqual(["+1"]);
        expect(unknown.map((element) => element.name)).toEqual(["Numbers", "Other"]);
        expect(unknown[0]?.children.map((element) => element.name)).toEqual(["Extension"]);
        expect(
            serializeXmlElement({
                name: "Dial",
                children: [
                    {
                        name: "Numbers",
                        wrapped: true,
                        value: numbers?.map((text) => new XmlElement({ name: "Number", text })),
                    },
                ],
                additionalChildren: unknown,
            }),
        ).toBe('<Dial><Numbers x="1"><Number>+1</Number><Extension>x</Extension></Numbers><Other /></Dial>');
        expect(
            xmlUnknownChildren(parseXml("<Dial><Numbers><Number>+1</Number></Numbers></Dial>"), ["Numbers"], {
                Numbers: ["Number"],
            }),
        ).toEqual([]);
    });

    it("round-trips an XmlElement", () => {
        const xml = '<a b="1"><c>text</c><d /></a>';
        expect(XmlElement.fromXml(xml).toXml()).toBe(xml);
    });
});

describe("ordered content", () => {
    class Say {
        constructor(public readonly text: string) {}
        toXml(): string {
            return `<Say>${this.text}</Say>`;
        }
    }

    it("parses text segments and children in document order", () => {
        const node = parseXml(
            "<Gather>Press a key, then <Say>one</Say> or <Custom/><Numbers><Number>+1</Number></Numbers></Gather>",
        );
        expect(xmlLeadingText(node)).toBe("Press a key, then ");
        const content = xmlContent(node, {
            skip: ["Numbers"],
            parse: (child) => (child.name === "Say" ? new Say(child.text ?? "") : undefined),
        });
        expect(content.map((item) => (typeof item === "string" ? item : item.toXml()))).toEqual([
            "Press a key, then ",
            "<Say>one</Say>",
            " or ",
            "<Custom />",
        ]);
        expect(xmlContentElements(content, (item): item is Say => item instanceof Say)?.map((say) => say.text)).toEqual(
            ["one"],
        );
        expect(xmlContent(node, { skipLeadingText: true, skip: ["Say", "Custom", "Numbers"] })).toEqual([" or "]);
        expect(xmlWrapperFragments(node, { Numbers: ["Number"] })).toEqual([]);
    });

    it("keeps wrapper elements as position markers and renders wrapped lists in place", () => {
        const node = parseXml(
            '<Dial><Custom/><Numbers priority="1"><Number>+1</Number><Extra/></Numbers><Other/></Dial>',
        );
        const content = xmlContent(node, { wrappers: { Numbers: ["Number"] } });
        expect(content.map((item) => (typeof item === "string" ? item : item.toXml()))).toEqual([
            "<Custom />",
            '<Numbers priority="1"><Extra /></Numbers>',
            "<Other />",
        ]);
        expect(
            serializeXmlElement({
                name: "Dial",
                children: [{ name: "Numbers", value: [new XmlElement({ name: "Number", text: "+1" })], wrapped: true }],
                content,
            }),
        ).toBe('<Dial><Custom /><Numbers priority="1"><Number>+1</Number><Extra /></Numbers><Other /></Dial>');
        expect(
            serializeXmlElement({
                name: "Dial",
                children: [{ name: "Numbers", value: [new XmlElement({ name: "Number", text: "+1" })], wrapped: true }],
                content: [new XmlElement({ name: "Custom" })],
            }),
        ).toBe("<Dial><Numbers><Number>+1</Number></Numbers><Custom /></Dial>");
    });

    it("round-trips mixed content inside undeclared elements", () => {
        const xml = "<Custom>Hi <b>there</b> world</Custom>";
        const element = XmlElement.fromXml(xml);
        expect(element.toXml()).toBe(xml);
        expect(element.text).toBe("Hi  world");
        expect(element.children.map((child) => child.name)).toEqual(["b"]);
        expect(new XmlElement({ name: "A", text: "t", children: [new XmlElement({ name: "B" })] }).toXml()).toBe(
            "<A>t<B /></A>",
        );
    });

    it("serializes content in order and reconciles it with typed children", () => {
        const a = new Say("a");
        const b = new Say("b");
        const custom = new XmlElement({ name: "Custom" });
        const ordered = orderXmlContent([a, custom, a, "tail"], [a, a, b]);
        expect(serializeXmlElement({ name: "Response", content: ordered })).toBe(
            "<Response><Say>a</Say><Custom /><Say>a</Say>tail<Say>b</Say></Response>",
        );
        expect(serializeXmlElement({ name: "Response", content: orderXmlContent([a, "x"], []) })).toBe(
            "<Response><Say>a</Say>x</Response>",
        );
        expect(replaceXmlContent([a, custom, a, "tail"], [a, a], [b, custom])).toEqual([custom, "tail", b]);
        expect(replaceXmlContent([a], undefined, [a, b])).toEqual([a, b]);
    });

    it("builds builders in content once and shares the instances with typed children", () => {
        const builder = { build: () => new Say("built"), toXml: () => "" };
        const built = xmlBuildContent(["Hi ", builder]);
        expect(built.content[0]).toBe("Hi ");
        expect(built.buildAll([builder])?.[0]).toBe(built.content[1]);
        expect(built.build(new Say("plain")).text).toBe("plain");
    });

    it("does not duplicate additional children already present in content", () => {
        const custom = new XmlElement({ name: "Custom" });
        const other = new XmlElement({ name: "Other" });
        expect(xmlInitialContent(["a", custom], [custom, other])).toEqual(["a", custom, other]);
        expect(xmlInitialContent(undefined, undefined)).toEqual([]);
    });
});

describe("comments", () => {
    class Say {
        constructor(public readonly text: string) {}
        toXml(): string {
            return `<Say>${this.text}</Say>`;
        }
    }

    it("keeps comment text from closing the comment early", () => {
        expect(new XmlComment("a -- b --> <Hangup/> -").toXml()).toBe("<!--a - - b - -> <Hangup/> - -->");
        expect(parseXml(`<Response>${new XmlComment("x -->").toXml()}</Response>`).content).toEqual([
            { comment: "x - ->" },
        ]);
    });

    it("keeps comments in the parsed content in document order and round-trips them", () => {
        const node = parseXml("<Response><!-- a comment --><Say>hi</Say><!--b-->tail</Response>");
        expect(node.content).toEqual([
            { comment: " a comment " },
            expect.objectContaining({ name: "Say" }),
            { comment: "b" },
            "tail",
        ]);
        const content = xmlContent(node, {
            parse: (child) => (child.name === "Say" ? new Say(child.text ?? "") : undefined),
        });
        expect(content[0]).toBeInstanceOf(XmlComment);
        expect(content.map((item) => (typeof item === "string" ? item : item.toXml()))).toEqual([
            "<!-- a comment -->",
            "<Say>hi</Say>",
            "<!--b-->",
            "tail",
        ]);
        expect(serializeXmlElement({ name: "Response", content })).toBe(
            "<Response><!-- a comment --><Say>hi</Say><!--b-->tail</Response>",
        );
        expect(XmlElement.fromXml("<Custom><!--c-->x</Custom>").toXml()).toBe("<Custom><!--c-->x</Custom>");
        expect(XmlElement.fromXml("<Custom><!--c-->x</Custom>").text).toBe("x");
    });

    it("ends the leading text at a comment", () => {
        const node = parseXml("<Say>Hi<!--c--> there</Say>");
        expect(xmlLeadingText(node)).toBe("Hi");
        expect(xmlContent(node, { skipLeadingText: true }).map((item) => String(item))).toEqual(["<!--c-->", " there"]);
    });

    it("rejects an unterminated comment", () => {
        expect(() => parseXml("<Response><!-- oops </Response>")).toThrow(XmlParseError);
    });

    it("places a builder's sibling comments around its built element in the parent's content", () => {
        const siblingComments = new XmlSiblingComments();
        siblingComments.before.push(new XmlComment("before"));
        siblingComments.after.push(new XmlComment("after"));
        const builder = { build: () => new Say("built"), toXml: () => "", siblingComments };
        const built = xmlBuildContent(["Hi ", builder, new XmlComment("inside")]);
        expect(built.content.map((item) => (typeof item === "string" ? item : item.toXml()))).toEqual([
            "Hi ",
            "<!--before-->",
            "<Say>built</Say>",
            "<!--after-->",
            "<!--inside-->",
        ]);
        expect(built.buildAll([builder])?.[0]).toBe(built.content[2]);
    });

    it("keeps a wrapped child builder's sibling comments around its element inside the wrapper", () => {
        const siblingComments = new XmlSiblingComments();
        siblingComments.before.push(new XmlComment("before"));
        siblingComments.after.push(new XmlComment("after"));
        const builder = {
            build: () => new XmlElement({ name: "Number", text: "1" }),
            toXml: () => "",
            siblingComments,
        };
        const built = xmlBuildContent([new XmlElement({ name: "Numbers" }), new XmlComment("inside")]);
        const numbers = built.buildAll([builder, new XmlElement({ name: "Number", text: "2" })]);
        const xml = serializeXmlElement({
            name: "Dial",
            children: [{ name: "Numbers", value: numbers, wrapped: true }],
            content: built.content,
        });
        expect(xml).toBe(
            "<Dial><Numbers><!--before--><Number>1</Number><!--after--><Number>2</Number></Numbers><!--inside--></Dial>",
        );
        const roundTrip =
            "<Dial><Numbers><Number>1</Number><Number>2</Number><!--trailing--></Numbers><!--inside--></Dial>";
        const parsed = parseXml(roundTrip);
        expect(
            serializeXmlElement({
                name: "Dial",
                children: [
                    {
                        name: "Numbers",
                        value: xmlChildren(
                            parsed,
                            { Number: (node) => XmlElement.fromXml(node) },
                            { wrapper: "Numbers" },
                        ),
                        wrapped: true,
                    },
                ],
                content: xmlContent(parsed, { wrappers: { Numbers: ["Number"] } }),
            }),
        ).toBe(roundTrip);
    });

    it("wraps a root element with its sibling comments, keeping the declaration first", () => {
        const siblingComments = new XmlSiblingComments();
        expect(siblingComments.wrap("<Response />")).toBe("<Response />");
        siblingComments.before.push(new XmlComment("b"));
        siblingComments.after.push(new XmlComment("a"));
        expect(siblingComments.wrap('<?xml version="1.0" encoding="UTF-8"?><Response />')).toBe(
            '<?xml version="1.0" encoding="UTF-8"?><!--b--><Response /><!--a-->',
        );
        expect(siblingComments.wrap("<Response />")).toBe("<!--b--><Response /><!--a-->");
    });
});
