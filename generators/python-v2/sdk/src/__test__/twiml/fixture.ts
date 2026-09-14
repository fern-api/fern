import { CaseConverter } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-fern/ir-sdk";

import { TwimlNames } from "../../twiml/TwimlNames.js";

const STRING: FernIr.TwimlType = FernIr.TwimlType.primitive("STRING");
const INTEGER: FernIr.TwimlType = FernIr.TwimlType.primitive("INTEGER");
const PHONE_NUMBER: FernIr.TwimlType = FernIr.TwimlType.primitive("PHONE_NUMBER");

function attribute(name: string, xmlName: string, type: FernIr.TwimlType): FernIr.TwimlAttribute {
    return { name, xmlName, type, visibility: "public", docs: undefined };
}

function tag(args: {
    id: string;
    name: string;
    xmlName: string;
    body?: FernIr.TwimlBody;
    attributes?: FernIr.TwimlAttribute[];
    children?: string[];
    docs?: string;
}): FernIr.TwimlTag {
    return {
        id: args.id,
        name: args.name,
        xmlName: args.xmlName,
        body: args.body,
        attributes: args.attributes ?? [],
        enums: {},
        children: args.children ?? [],
        visibility: "public",
        docs: args.docs
    };
}

/**
 * A voice namespace exercising the interesting cases: an optional body (`Say`), a required body
 * (`Redirect`), a Python keyword attribute (`for`), an attribute whose XML name is not the
 * lowerCamel form of its Python name (`xml:lang`), a lowercase SSML tag whose method name would
 * shadow a keyword (`break`), and recursion (`emphasis` inside `emphasis`).
 */
export const VOICE: FernIr.TwimlNamespace = {
    name: "voice",
    root: "voice/response",
    docs: undefined,
    tags: {
        "voice/response": tag({
            id: "voice/response",
            name: "voice_response",
            xmlName: "Response",
            docs: "<Response> TwiML for Voice",
            children: ["voice/say", "voice/redirect", "voice/prompt"]
        }),
        "voice/say": tag({
            id: "voice/say",
            name: "say",
            xmlName: "Say",
            docs: "<Say> TwiML Verb",
            body: { name: "message", type: STRING, required: false, docs: "Message to say" },
            attributes: [
                attribute("voice", "voice", STRING),
                attribute("loop", "loop", INTEGER),
                attribute("interpret_as", "interpret-as", STRING),
                attribute("voice_v2", "voiceV2", STRING)
            ],
            children: ["voice/ssml_break", "voice/ssml_emphasis", "voice/ssml_lang"]
        }),
        "voice/redirect": tag({
            id: "voice/redirect",
            name: "redirect",
            xmlName: "Redirect",
            body: { name: "url", type: FernIr.TwimlType.primitive("URL"), required: true, docs: undefined },
            attributes: [attribute("method", "method", FernIr.TwimlType.primitive("HTTP_METHOD"))]
        }),
        "voice/prompt": tag({
            id: "voice/prompt",
            name: "prompt",
            xmlName: "Prompt",
            attributes: [
                attribute("for", "for", FernIr.TwimlType.enum("for")),
                attribute("attempt", "attempt", FernIr.TwimlType.list(INTEGER)),
                attribute("caller_id", "callerId", FernIr.TwimlType.union({ members: [PHONE_NUMBER, STRING] }))
            ],
            children: ["voice/say"]
        }),
        "voice/ssml_break": tag({
            id: "voice/ssml_break",
            name: "ssml_break",
            xmlName: "break",
            attributes: [attribute("strength", "strength", STRING)]
        }),
        "voice/ssml_emphasis": tag({
            id: "voice/ssml_emphasis",
            name: "ssml_emphasis",
            xmlName: "emphasis",
            body: { name: "words", type: STRING, required: false, docs: undefined },
            attributes: [attribute("level", "level", STRING)],
            children: ["voice/ssml_break", "voice/ssml_emphasis"]
        }),
        "voice/ssml_lang": tag({
            id: "voice/ssml_lang",
            name: "ssml_lang",
            xmlName: "lang",
            body: { name: "words", type: STRING, required: false, docs: undefined },
            attributes: [attribute("xml_lang", "xml:lang", STRING)]
        })
    }
};

function text(value: string): FernIr.TwimlExampleContent {
    return FernIr.TwimlExampleContent.text(value);
}

function node(
    tag: string,
    attributes: FernIr.TwimlExampleAttribute[],
    content: FernIr.TwimlExampleContent[] = []
): FernIr.TwimlExampleContent {
    return FernIr.TwimlExampleContent.node({ tag, attributes, content });
}

export const EXAMPLES: FernIr.TwimlExample[] = [
    {
        id: "say-hello",
        name: "say-hello",
        docs: undefined,
        xml: '<Response><Say voice="woman" loop="2">Hello!</Say></Response>',
        root: {
            tag: "voice/response",
            attributes: [],
            content: [
                node(
                    "voice/say",
                    [
                        { name: "voice", value: FernIr.TwimlExampleValue.string("woman") },
                        { name: "loop", value: FernIr.TwimlExampleValue.integer(2) }
                    ],
                    [text("Hello!")]
                )
            ]
        }
    },
    {
        id: "prompt-and-redirect",
        name: "prompt-and-redirect",
        docs: undefined,
        xml: '<Response><Prompt for="payment-card-number" attempt="1 2"><Say>Card &amp; expiry</Say></Prompt><Redirect method="POST">https://example.com/next?a=1&amp;b=2</Redirect></Response>',
        root: {
            tag: "voice/response",
            attributes: [],
            content: [
                node(
                    "voice/prompt",
                    [
                        { name: "for", value: FernIr.TwimlExampleValue.enum("payment-card-number") },
                        {
                            name: "attempt",
                            value: FernIr.TwimlExampleValue.list({
                                items: [FernIr.TwimlExampleValue.integer(1), FernIr.TwimlExampleValue.integer(2)]
                            })
                        }
                    ],
                    [node("voice/say", [], [text("Card & expiry")])]
                ),
                node(
                    "voice/redirect",
                    [{ name: "method", value: FernIr.TwimlExampleValue.string("POST") }],
                    [text("https://example.com/next?a=1&b=2")]
                )
            ]
        }
    },
    {
        id: "ssml-mixed",
        name: "ssml-mixed",
        docs: undefined,
        xml: '<Response><Say>Hello <emphasis level="strong">world<break strength="x-weak"/>again</emphasis>, <lang xml:lang="fr-FR">au revoir</lang></Say></Response>',
        root: {
            tag: "voice/response",
            attributes: [],
            content: [
                node(
                    "voice/say",
                    [],
                    [
                        text("Hello "),
                        node(
                            "voice/ssml_emphasis",
                            [{ name: "level", value: FernIr.TwimlExampleValue.string("strong") }],
                            [
                                text("world"),
                                node("voice/ssml_break", [
                                    { name: "strength", value: FernIr.TwimlExampleValue.string("x-weak") }
                                ]),
                                text("again")
                            ]
                        ),
                        text(", "),
                        node(
                            "voice/ssml_lang",
                            [{ name: "xml_lang", value: FernIr.TwimlExampleValue.string("fr-FR") }],
                            [text("au revoir")]
                        )
                    ]
                )
            ]
        }
    }
];

export function createNames(): TwimlNames {
    return new TwimlNames(CaseConverter.fromLanguage("python", true), VOICE);
}
