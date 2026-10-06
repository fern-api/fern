import { File, getWireValue } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

const SPECIAL_CHARACTERS = `a & b < c > d "q" 'r'`;

interface Sample {
    xml: string;
    ruby: string;
}

interface XmlProperty {
    xml: FernIr.XmlPropertyEncoding;
    kind: FernIr.XmlPropertyKind;
    fieldName: string;
    wireName: string;
    itemType: FernIr.TypeReference;
    isList: boolean;
    isRequired: boolean;
}

/**
 * Emits one Minitest spec per xml-encoded object type (e.g. every TwiML verb) covering the
 * from_xml/to_xml round trip, unknown content, escaping, child order and rejected documents.
 */
export class XmlTestGenerator {
    private readonly className: string;
    private readonly properties: XmlProperty[];

    constructor(
        private readonly context: ModelGeneratorContext,
        private readonly typeDeclaration: FernIr.TypeDeclaration,
        objectDeclaration: FernIr.ObjectTypeDeclaration,
        private readonly xml: FernIr.XmlEncoding
    ) {
        const reference = context.getClassReferenceForTypeId(typeDeclaration.name.typeId);
        this.className = [...reference.modules, reference.name].join("::");
        this.properties = [...(objectDeclaration.extendedProperties ?? []), ...objectDeclaration.properties]
            .filter((property) => property.xml != null)
            .map((property) => this.describe(property));
    }

    public generate(): File {
        const blocks = [
            this.roundTripTest(),
            this.toStringTest(),
            this.unknownContentTest(),
            this.escapingTest(),
            this.childOrderTest(),
            ...this.rejectionTests()
        ].filter((block): block is string => block != null);
        const contents = [
            "# frozen_string_literal: true",
            "",
            'require "test_helper"',
            "",
            `describe ${this.className} do`,
            this.separateAssertions(blocks.join("\n\n")),
            "end",
            ""
        ].join("\n");
        const fileName = this.context.caseConverter.snakeSafe(this.typeDeclaration.name.name);
        return new File(`test_${fileName}.rb`, RelativeFilePath.of("test/unit/xml"), contents);
    }

    /** Blank line between setup statements and the assertions that follow them (Minitest/EmptyLineBeforeAssertionMethods). */
    private separateAssertions(body: string): string {
        const isAssertion = (line: string) => /^\s*(assert|refute)/.test(line);
        const lines: string[] = [];
        for (const line of body.split("\n")) {
            const previous = lines[lines.length - 1];
            if (
                isAssertion(line) &&
                previous != null &&
                previous.trim() !== "" &&
                !isAssertion(previous) &&
                !previous.endsWith(" do")
            ) {
                lines.push("");
            }
            lines.push(line);
        }
        return lines.join("\n");
    }

    private describe(property: FernIr.ObjectProperty): XmlProperty {
        if (property.xml == null) {
            throw new Error("expected xml metadata");
        }
        const itemType = unwrapListItemType(property.valueType);
        return {
            xml: property.xml,
            kind: property.xml.kind,
            fieldName: this.context.caseConverter.snakeSafe(property.name),
            wireName: property.xml.name ?? getWireValue(property.name),
            itemType: itemType ?? property.valueType,
            isList: itemType != null,
            isRequired: !isOptionalType(property.valueType)
        };
    }

    // Tests ---------------------------------------------------------------------------------------

    private roundTripTest(): string {
        const sampled = this.properties
            .map((property) => ({ property, sample: this.sampleValue(property) }))
            .filter((entry): entry is { property: XmlProperty; sample: Sample } => entry.sample != null);
        const lines = [
            `  it "round-trips from_xml and to_xml" do`,
            ...this.parseDocument(this.sampleDocument(sampled))
        ];
        if (sampled.length > 0) {
            const expected = this.rubyArray(sampled.map(({ sample }) => sample.ruby));
            const actual = sampled.map(({ property }) => `parsed.${property.fieldName}`).join(", ");
            lines.push(`    assert_equal ${expected}, [${actual}]`);
        }
        lines.push(
            `    serialized = parsed.to_xml(xml_declaration: false)`,
            `    assert_equal serialized, ${this.className}.from_xml(serialized).to_xml(xml_declaration: false)`,
            `    assert parsed.to_xml.start_with?("<?xml version=\\"1.0\\"")`,
            `  end`
        );
        return lines.join("\n");
    }

    private toStringTest(): string {
        return [
            `  it "returns the XML document from to_s" do`,
            `    parsed = ${this.className}.from_xml(${this.rubyString(this.document(""))})`,
            `    assert_equal parsed.to_xml, parsed.to_s`,
            `  end`
        ].join("\n");
    }

    private unknownContentTest(): string {
        const document = this.document(' dataUnknown="1"', '<Unknown a="1">v</Unknown>');
        return [
            `  it "preserves unknown attributes and children" do`,
            `    parsed = ${this.className}.from_xml(${this.rubyString(document)})`,
            `    serialized = parsed.to_xml(xml_declaration: false)`,
            `    assert_equal "1", parsed.additional_attributes["dataUnknown"]`,
            `    assert_includes serialized, ${this.rubyString('<Unknown a="1">v</Unknown>')}`,
            `    assert_equal serialized, ${this.className}.from_xml(serialized).to_xml(xml_declaration: false)`,
            `  end`
        ].join("\n");
    }

    private escapingTest(): string | undefined {
        const property = this.properties.find(
            (property) =>
                (property.kind === "ATTRIBUTE" || property.kind === "TEXT") &&
                !property.isList &&
                primitiveKind(property.itemType) === "string"
        );
        if (property == null) {
            return undefined;
        }
        return [
            `  it "escapes special characters" do`,
            `    model = ${this.className}.new(${this.constructorArguments(property)})`,
            `    serialized = model.to_xml(xml_declaration: false)`,
            `    refute_includes serialized, "a & b"`,
            `    refute_includes serialized, "< c"`,
            `    assert_equal ${this.rubyString(SPECIAL_CHARACTERS)}, ${this.className}.from_xml(serialized).${property.fieldName}`,
            `  end`
        ].join("\n");
    }

    private childOrderTest(): string | undefined {
        const names = this.contentChildNames();
        const hasText = this.properties.some(
            (property) => property.kind === "TEXT" && primitiveKind(property.itemType) === "string"
        );
        let body: string | undefined;
        if (names.length >= 2) {
            body = `<${names[0]}/><${names[1]}/><${names[0]}/>`;
        } else if (names.length === 1 && hasText) {
            body = `a<${names[0]}/>b`;
        }
        if (body == null) {
            return undefined;
        }
        const document = this.document("", body);
        return [
            `  it "preserves child order" do`,
            `    parsed = ${this.className}.from_xml(${this.rubyString(document)})`,
            `    assert_includes parsed.to_xml(xml_declaration: false), ${this.rubyString(body)}`,
            `  end`
        ].join("\n");
    }

    private rejectionTests(): string[] {
        const root = this.rootName();
        const doctype = `<!DOCTYPE ${root} [<!ENTITY xxe "injected">]>${this.startTag("")}&xxe;</${root}>`;
        const rejects = (title: string, document: string): string =>
            [
                `  it "${title}" do`,
                `    assert_raises(ArgumentError) { ${this.className}.from_xml(${this.rubyString(document)}) }`,
                `  end`
            ].join("\n");
        return [
            rejects("rejects a wrong root element", `<NotThe${root}/>`),
            rejects("rejects malformed XML", `<${root}><unclosed>`),
            rejects("rejects a DOCTYPE declaration", doctype)
        ];
    }

    /** `%w[...]` when every element is a plain word literal (Style/WordArray), otherwise a regular array literal. */
    private rubyArray(elements: string[]): string {
        if (elements.length > 0 && elements.every((element) => /^"[\w.-]+"$/.test(element))) {
            return `%w[${elements.map((element) => element.slice(1, -1)).join(" ")}]`;
        }
        return `[${elements.join(", ")}]`;
    }

    private constructorArguments(special: XmlProperty): string {
        return [
            `${special.fieldName}: ${this.rubyString(SPECIAL_CHARACTERS)}`,
            ...this.requiredSamples(special).map(({ property, sample }) => `${property.fieldName}: ${sample.ruby}`)
        ].join(", ");
    }

    // Sample document -----------------------------------------------------------------------------

    /** Required attributes/text (with sample values) so documents in the non-round-trip tests still parse. */
    private requiredSamples(except?: XmlProperty): { property: XmlProperty; sample: Sample }[] {
        return this.properties
            .filter((property) => property.isRequired && property !== except)
            .map((property) => ({ property, sample: this.sampleValue(property) }))
            .filter((entry): entry is { property: XmlProperty; sample: Sample } => entry.sample != null);
    }

    private document(attributes: string, body = "", except?: XmlProperty): string {
        const required = this.requiredSamples(except);
        const requiredAttributes = required
            .filter(({ property }) => property.kind === "ATTRIBUTE")
            .map(({ property, sample }) => ` ${property.wireName}="${sample.xml}"`)
            .join("");
        const requiredText = required.find(({ property }) => property.kind === "TEXT")?.sample.xml ?? "";
        const content = `${requiredText}${body}`;
        if (content.length === 0) {
            return this.startTag(`${requiredAttributes}${attributes}`, true);
        }
        return `${this.startTag(`${requiredAttributes}${attributes}`)}${content}</${this.rootName()}>`;
    }

    private sampleDocument(sampled: { property: XmlProperty; sample: Sample }[]): string {
        const attributes = sampled
            .filter(({ property }) => property.kind === "ATTRIBUTE")
            .map(({ property, sample }) => ` ${property.wireName}="${sample.xml}"`)
            .join("");
        const text = sampled.find(({ property }) => property.kind === "TEXT")?.sample.xml ?? "";
        const children = this.properties
            .filter((property) => property.kind === "ELEMENT")
            .map((property) => this.sampleChild(property))
            .join("");
        const body = `${text}${children}`;
        if (body.length === 0) {
            return this.startTag(attributes, true);
        }
        return `${this.startTag(attributes)}${body}</${this.rootName()}>`;
    }

    private sampleChild(property: XmlProperty): string {
        const children = this.xmlObjectDeclarations(property.itemType);
        const first = children[0];
        if (first == null) {
            return "";
        }
        const element = emptyElement(first);
        if (property.xml.wrapped && property.isList) {
            return `<${property.wireName}>${element}</${property.wireName}>`;
        }
        return element;
    }

    /** Element names of non-namespaced child types that live in the ordered content (not wrapped). */
    private contentChildNames(): string[] {
        const names: string[] = [];
        for (const property of this.properties) {
            if (property.kind !== "ELEMENT" || (property.xml.wrapped && property.isList)) {
                continue;
            }
            for (const child of this.xmlObjectDeclarations(property.itemType)) {
                const xml = child.encoding?.xml;
                if (xml != null && xml.namespace == null && !names.includes(xml.name)) {
                    names.push(xml.name);
                }
            }
        }
        return names;
    }

    /** The xml-encoded object types reachable from a child element's type (directly or via an undiscriminated union). */
    private xmlObjectDeclarations(typeReference: FernIr.TypeReference): FernIr.TypeDeclaration[] {
        if (typeReference.type !== "named") {
            return [];
        }
        const declaration = this.context.getTypeDeclarationOrThrow(typeReference.typeId);
        switch (declaration.shape.type) {
            case "object":
                return declaration.encoding?.xml != null ? [declaration] : [];
            case "alias":
                return this.xmlObjectDeclarations(declaration.shape.aliasOf);
            case "undiscriminatedUnion":
                return declaration.shape.members.flatMap((member) => this.xmlObjectDeclarations(member.type));
            default:
                return [];
        }
    }

    private enumValues(typeReference: FernIr.TypeReference): string[] | undefined {
        if (typeReference.type !== "named") {
            return undefined;
        }
        const shape = this.context.getTypeDeclarationOrThrow(typeReference.typeId).shape;
        if (shape.type !== "enum") {
            return undefined;
        }
        return shape.values.map((value) => getWireValue(value.name));
    }

    private rootName(): string {
        return this.xml.prefix != null ? `${this.xml.prefix}:${this.xml.name}` : this.xml.name;
    }

    private startTag(attributes: string, selfClosing = false): string {
        let namespace = "";
        if (this.xml.namespace != null) {
            namespace =
                this.xml.prefix != null
                    ? ` xmlns:${this.xml.prefix}="${this.xml.namespace}"`
                    : ` xmlns="${this.xml.namespace}"`;
        }
        return `<${this.rootName()}${namespace}${attributes}${selfClosing ? "/>" : ">"}`;
    }

    private sampleValue(property: XmlProperty): Sample | undefined {
        if (property.kind !== "ATTRIBUTE" && property.kind !== "TEXT") {
            return undefined;
        }
        const first = this.sampleItem(property, 0);
        if (first == null) {
            return undefined;
        }
        if (!property.isList) {
            return first;
        }
        const second = this.sampleItem(property, 1);
        if (second == null) {
            return undefined;
        }
        const separator = property.xml.listSeparator ?? " ";
        const isWord = (sample: Sample) => sample.ruby.startsWith('"') && /^[\w.-]+$/.test(sample.xml);
        const ruby =
            isWord(first) && isWord(second) ? `%w[${first.xml} ${second.xml}]` : `[${first.ruby}, ${second.ruby}]`;
        return { xml: `${first.xml}${separator}${second.xml}`, ruby };
    }

    private sampleItem(property: XmlProperty, index: number): Sample | undefined {
        const enumValues = this.enumValues(property.itemType);
        if (enumValues != null) {
            const value = enumValues[index] ?? enumValues[0];
            return value == null ? undefined : { xml: value, ruby: this.rubyString(value) };
        }
        switch (primitiveKind(property.itemType)) {
            case "string": {
                const base = property.kind === "TEXT" ? "text" : property.wireName;
                const value = index === 0 ? base : `${base}-${index + 1}`;
                return { xml: value, ruby: this.rubyString(value) };
            }
            case "integer":
                return { xml: `${index + 1}`, ruby: `${index + 1}` };
            case "boolean":
                return index === 0 ? { xml: "true", ruby: "true" } : { xml: "false", ruby: "false" };
            case "double":
                return { xml: `${index + 1}.5`, ruby: `${index + 1}.5` };
            default:
                return undefined;
        }
    }

    private rubyString(value: string): string {
        return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/#\{/g, "\\#{")}"`;
    }

    /** Long documents (e.g. a verb with hundreds of attributes) read better as a heredoc. */
    private parseDocument(document: string): string[] {
        if (document.length <= 80) {
            return [`    parsed = ${this.className}.from_xml(${this.rubyString(document)})`];
        }
        return [
            `    xml = <<~XML.chomp`,
            `      ${document}`,
            `    XML`,
            `    parsed = ${this.className}.from_xml(xml)`
        ];
    }
}

function isOptionalType(typeReference: FernIr.TypeReference): boolean {
    return (
        typeReference.type === "container" &&
        (typeReference.container.type === "optional" || typeReference.container.type === "nullable")
    );
}

function unwrapListItemType(typeReference: FernIr.TypeReference): FernIr.TypeReference | undefined {
    if (typeReference.type !== "container") {
        return undefined;
    }
    switch (typeReference.container.type) {
        case "list":
            return typeReference.container.list;
        case "optional":
            return unwrapListItemType(typeReference.container.optional);
        case "nullable":
            return unwrapListItemType(typeReference.container.nullable);
        default:
            return undefined;
    }
}

/** Coarse primitive classification used to pick sample values; undefined for unsupported primitives. */
function primitiveKind(typeReference: FernIr.TypeReference): "string" | "integer" | "double" | "boolean" | undefined {
    if (typeReference.type !== "primitive") {
        return undefined;
    }
    switch (typeReference.primitive.v1) {
        case "STRING":
            return "string";
        case "INTEGER":
        case "LONG":
        case "UINT":
        case "UINT_64":
            return "integer";
        case "DOUBLE":
        case "FLOAT":
            return "double";
        case "BOOLEAN":
            return "boolean";
        default:
            return undefined;
    }
}

function emptyElement(declaration: FernIr.TypeDeclaration): string {
    const xml = declaration.encoding?.xml;
    if (xml == null) {
        return "";
    }
    if (xml.prefix != null && xml.namespace != null) {
        return `<${xml.prefix}:${xml.name} xmlns:${xml.prefix}="${xml.namespace}"/>`;
    }
    if (xml.namespace != null) {
        return `<${xml.name} xmlns="${xml.namespace}"/>`;
    }
    return `<${xml.name}/>`;
}
