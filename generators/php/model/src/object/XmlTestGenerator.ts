import { File, getWireValue } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

const SPECIAL_CHARACTERS = `a & b < c > d "q" 'r'`;

interface Sample {
    xml: string;
    php: string;
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
 * Emits one PHPUnit test case per xml-encoded object type (e.g. every TwiML verb) covering the
 * fromXml/toXml round trip, unknown content, escaping, child order and rejected documents.
 */
export class XmlTestGenerator {
    private readonly className: string;
    private readonly classNamespace: string;
    private readonly properties: XmlProperty[];

    constructor(
        private readonly context: ModelGeneratorContext,
        typeDeclaration: FernIr.TypeDeclaration,
        objectDeclaration: FernIr.ObjectTypeDeclaration,
        private readonly xml: FernIr.XmlEncoding
    ) {
        const reference = context.phpTypeMapper.convertToClassReference(typeDeclaration.name);
        this.className = reference.name;
        this.classNamespace = reference.namespace;
        this.properties = [...(objectDeclaration.extendedProperties ?? []), ...objectDeclaration.properties]
            .filter((property) => property.xml != null)
            .map((property) => this.describe(property));
    }

    public generate(): File {
        const methods = [
            this.roundTripTest(),
            this.unknownContentTest(),
            this.escapingTest(),
            this.childOrderTest(),
            ...this.rejectionTests()
        ].filter((block): block is string => block != null);
        const contents = [
            "<?php",
            "",
            `namespace ${this.context.getTestsNamespace()}\\Xml;`,
            "",
            "use InvalidArgumentException;",
            "use PHPUnit\\Framework\\TestCase;",
            `use ${this.classNamespace}\\${this.className};`,
            "",
            `class ${this.className}XmlTest extends TestCase`,
            "{",
            methods.join("\n\n"),
            "}",
            ""
        ].join("\n");
        return new File(`${this.className}XmlTest.php`, RelativeFilePath.of("tests/Xml"), contents);
    }

    private describe(property: FernIr.ObjectProperty): XmlProperty {
        if (property.xml == null) {
            throw new Error("expected xml metadata");
        }
        const itemType = unwrapListItemType(property.valueType);
        return {
            xml: property.xml,
            kind: property.xml.kind,
            fieldName: this.context.getPropertyName(property.name),
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
            `    public function testFromXmlToXmlRoundTrips(): void`,
            `    {`,
            `        $parsed = ${this.className}::fromXml(${this.phpString(this.sampleDocument(sampled))});`
        ];
        for (const { property, sample } of sampled) {
            lines.push(`        $this->assertSame(${sample.php}, $parsed->${property.fieldName});`);
        }
        lines.push(`        $serialized = $parsed->toXml(false);`);
        for (const { property, sample } of sampled) {
            if (property.kind === "ATTRIBUTE") {
                lines.push(
                    `        $this->assertStringContainsString(${this.phpString(`${property.wireName}="${sample.xml}"`)}, $serialized);`
                );
            } else if (property.kind === "TEXT") {
                lines.push(
                    `        $this->assertStringContainsString(${this.phpString(`>${sample.xml}<`)}, $serialized);`
                );
            }
        }
        lines.push(
            `        $this->assertSame($serialized, ${this.className}::fromXml($serialized)->toXml(false));`,
            `        $this->assertStringStartsWith('<?xml version="1.0"', $parsed->toXml());`,
            `        $this->assertSame($parsed->toXml(), (string) $parsed);`,
            `    }`
        );
        return lines.join("\n");
    }

    private unknownContentTest(): string {
        const document = this.document(' dataUnknown="1"', '<Unknown a="1">v</Unknown>');
        return [
            `    public function testFromXmlPreservesUnknownAttributesAndChildren(): void`,
            `    {`,
            `        $parsed = ${this.className}::fromXml(${this.phpString(document)});`,
            `        $serialized = $parsed->toXml(false);`,
            `        $this->assertStringContainsString('dataUnknown="1"', $serialized);`,
            `        $this->assertStringContainsString('<Unknown a="1">v</Unknown>', $serialized);`,
            `        $this->assertSame($serialized, ${this.className}::fromXml($serialized)->toXml(false));`,
            `    }`
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
            `    public function testToXmlEscapesSpecialCharacters(): void`,
            `    {`,
            `        $model = new ${this.className}([${this.constructorArguments(property)}]);`,
            `        $serialized = $model->toXml(false);`,
            `        $this->assertStringNotContainsString('a & b', $serialized);`,
            `        $this->assertStringNotContainsString('< c', $serialized);`,
            `        $this->assertSame(${this.phpString(SPECIAL_CHARACTERS)}, ${this.className}::fromXml($serialized)->${property.fieldName});`,
            `    }`
        ].join("\n");
    }

    private childOrderTest(): string | undefined {
        const [first, second] = this.contentChildDeclarations();
        const hasText = this.properties.some(
            (property) => property.kind === "TEXT" && primitiveKind(property.itemType) === "string"
        );
        let body: string | undefined;
        if (first != null && second != null) {
            body = `${this.sampleElement(first)}${this.sampleElement(second)}${this.sampleElement(first)}`;
        } else if (first != null && hasText) {
            body = `a${this.sampleElement(first)}b`;
        }
        if (body == null) {
            return undefined;
        }
        const document = this.document("", body);
        return [
            `    public function testFromXmlPreservesChildOrder(): void`,
            `    {`,
            `        $parsed = ${this.className}::fromXml(${this.phpString(document)});`,
            `        $this->assertStringContainsString(${this.phpString(body)}, $parsed->toXml(false));`,
            `    }`
        ].join("\n");
    }

    private rejectionTests(): string[] {
        const root = this.rootName();
        const doctype = `<!DOCTYPE ${root} [<!ENTITY xxe "injected">]>${this.startTag("")}&xxe;</${root}>`;
        const rejects = (name: string, document: string): string =>
            [
                `    public function testFromXml${name}(): void`,
                `    {`,
                `        $this->expectException(InvalidArgumentException::class);`,
                `        ${this.className}::fromXml(${this.phpString(document)});`,
                `    }`
            ].join("\n");
        return [
            rejects("RejectsWrongRootElement", `<NotThe${root}/>`),
            rejects("RejectsMalformedXml", `${this.startTag("")}<unclosed>`),
            rejects("RejectsDoctype", doctype)
        ];
    }

    private constructorArguments(special: XmlProperty): string {
        return [
            `'${special.fieldName}' => ${this.phpString(SPECIAL_CHARACTERS)}`,
            ...this.requiredSamples(special).map(({ property, sample }) => `'${property.fieldName}' => ${sample.php}`)
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
        const element = this.sampleElement(first);
        if (property.xml.wrapped && property.isList) {
            return `<${property.wireName}>${element}</${property.wireName}>`;
        }
        return element;
    }

    /** A child element carrying sample values for its own required attributes/text, so it parses. */
    private sampleElement(declaration: FernIr.TypeDeclaration): string {
        const xml = declaration.encoding?.xml;
        if (xml == null) {
            return "";
        }
        const required =
            declaration.shape.type === "object"
                ? [...(declaration.shape.extendedProperties ?? []), ...declaration.shape.properties]
                      .filter((property) => property.xml != null)
                      .map((property) => this.describe(property))
                      .filter((property) => property.isRequired)
                      .map((property) => ({ property, sample: this.sampleValue(property) }))
                      .filter((entry): entry is { property: XmlProperty; sample: Sample } => entry.sample != null)
                : [];
        const attributes = required
            .filter(({ property }) => property.kind === "ATTRIBUTE")
            .map(({ property, sample }) => ` ${property.wireName}="${sample.xml}"`)
            .join("");
        const text = required.find(({ property }) => property.kind === "TEXT")?.sample.xml;
        const name = xml.prefix != null ? `${xml.prefix}:${xml.name}` : xml.name;
        let namespaceDeclaration = "";
        if (xml.namespace != null) {
            namespaceDeclaration =
                xml.prefix != null ? ` xmlns:${xml.prefix}="${xml.namespace}"` : ` xmlns="${xml.namespace}"`;
        }
        if (text == null) {
            return `<${name}${namespaceDeclaration}${attributes}/>`;
        }
        return `<${name}${namespaceDeclaration}${attributes}>${text}</${name}>`;
    }

    /** Element names of non-namespaced child types that live in the ordered content (not wrapped). */
    private contentChildDeclarations(): FernIr.TypeDeclaration[] {
        const declarations: FernIr.TypeDeclaration[] = [];
        const names: string[] = [];
        for (const property of this.properties) {
            if (property.kind !== "ELEMENT" || (property.xml.wrapped && property.isList)) {
                continue;
            }
            for (const child of this.xmlObjectDeclarations(property.itemType)) {
                const xml = child.encoding?.xml;
                if (xml != null && xml.namespace == null && !names.includes(xml.name)) {
                    names.push(xml.name);
                    declarations.push(child);
                }
            }
        }
        return declarations;
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
        return { xml: `${first.xml}${separator}${second.xml}`, php: `[${first.php}, ${second.php}]` };
    }

    private sampleItem(property: XmlProperty, index: number): Sample | undefined {
        const enumValues = this.enumValues(property.itemType);
        if (enumValues != null) {
            const value = enumValues[index] ?? enumValues[0];
            return value == null ? undefined : { xml: value, php: this.phpString(value) };
        }
        switch (primitiveKind(property.itemType)) {
            case "string": {
                const base = property.kind === "TEXT" ? "text" : property.wireName;
                const value = index === 0 ? base : `${base}-${index + 1}`;
                return { xml: value, php: this.phpString(value) };
            }
            case "integer":
                return { xml: `${index + 1}`, php: `${index + 1}` };
            case "boolean":
                return index === 0 ? { xml: "true", php: "true" } : { xml: "false", php: "false" };
            case "double":
                return { xml: `${index + 1}.5`, php: `${index + 1}.5` };
            default:
                return undefined;
        }
    }

    /** Single-quoted PHP literal: no interpolation, so only `\\` and `'` need escaping. */
    private phpString(value: string): string {
        return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
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
