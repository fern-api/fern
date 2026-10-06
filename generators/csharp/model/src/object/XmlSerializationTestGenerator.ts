import { getWireValue } from "@fern-api/base-generator";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, escapeForCSharpString } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { generateFields } from "../generateFields.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { XmlObjectGenerator, XmlProperty } from "./XmlObjectGenerator.js";

type TypeDeclaration = FernIr.TypeDeclaration;

/** A sample value for an attribute/text property: the XML string plus the C# expression it should parse to. */
interface SampleValue {
    xml: string;
    csharp: string;
}

const UNKNOWN_ENUM_VALUE = "bogus-value";
const SPECIAL_CHARACTERS = `a & b < c > d "q" 'r'`;

/**
 * Generates an NUnit test fixture per xml-encoded object type that exercises the generated
 * `FromXml`/`ToXml` round trip: attributes and text parse to the expected values, the serialized
 * form is stable, unknown attributes/children survive, special characters are escaped, unknown
 * enum values pass through, child order is preserved, and malformed/wrong-root/DOCTYPE input is rejected.
 */
export class XmlSerializationTestGenerator extends FileGenerator<CSharpFile, ModelGeneratorContext> {
    private readonly classBeingTested: ast.ClassReference;
    private readonly testClass: ast.TestClass;
    private readonly xmlGenerator: XmlObjectGenerator;
    private readonly xml: FernIr.XmlEncoding;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        objectDeclaration: FernIr.ObjectTypeDeclaration,
        xml: FernIr.XmlEncoding
    ) {
        super(context);
        this.xml = xml;
        this.classBeingTested = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration);
        this.testClass = this.csharp.testClass({
            name: `${this.classBeingTested.name}XmlTest`,
            origin: this.model.explicit(this.typeDeclaration, "XmlTest"),
            namespace: this.namespaces.test
        });
        // Analyze the properties the same way the model generator does, on a throwaway class.
        const scratch = this.csharp.class_({
            reference: this.classBeingTested,
            access: ast.Access.Public,
            type: ast.Class.ClassType.Record
        });
        const properties = [...(objectDeclaration.extendedProperties ?? []), ...objectDeclaration.properties];
        const fields = generateFields(scratch, {
            properties,
            className: this.classBeingTested.name,
            context: this.context
        });
        this.xmlGenerator = new XmlObjectGenerator(this.context, scratch, properties, fields, xml);
    }

    protected doGenerate(): CSharpFile {
        this.addRoundTripTest();
        this.addUnknownContentTest();
        this.addEscapingTest();
        this.addOpenEnumTest();
        this.addChildOrderTest();
        this.addRejectionTests();
        return new CSharpFile({
            clazz: this.testClass.getClass(),
            directory: this.getDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    private getDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Unit/Xml");
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.constants.folders.testFiles,
            this.getDirectory(),
            RelativeFilePath.of(`${this.testClass.name}.cs`)
        );
    }

    // ---------------------------------------------------------------------------------------------
    // Tests
    // ---------------------------------------------------------------------------------------------

    private addRoundTripTest(): void {
        const sampled = this.getSampledProperties();
        const document = this.buildSampleDocument(sampled);
        this.testClass.addTestMethod({
            name: "FromXml_ToXml_RoundTrips",
            isAsync: false,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`var xml = ${this.literal(document)};`);
                writer.writeLine(`var parsed = ${this.classBeingTested.name}.FromXml(xml);`);
                for (const { property, sample } of sampled) {
                    writer.writeLine(
                        `Assert.That(parsed.${property.field.name}, Is.EqualTo(${sample.csharp}), "${property.field.name}");`
                    );
                }
                writer.writeLine("var serialized = parsed.ToXml(false);");
                for (const { property, sample } of sampled) {
                    if (property.kind === "ATTRIBUTE") {
                        writer.writeLine(
                            `Assert.That(serialized, Does.Contain(${this.literal(`${property.wireName}="${sample.xml}"`)}));`
                        );
                    } else if (property.kind === "TEXT") {
                        writer.writeLine(`Assert.That(serialized, Does.Contain(${this.literal(`>${sample.xml}<`)}));`);
                    }
                }
                writer.writeLine(
                    `Assert.That(${this.classBeingTested.name}.FromXml(serialized).ToXml(false), Is.EqualTo(serialized), "re-serializing the parsed document is stable");`
                );
                writer.writeLine(`Assert.That(parsed.ToXml(), Does.StartWith("<?xml version=\\"1.0\\""));`);
                writer.writeLine("Assert.That(parsed.ToString(), Is.EqualTo(parsed.ToXml()));");
            })
        });
    }

    private addUnknownContentTest(): void {
        const document = this.document(` data-unknown="1"`, `<Unknown a="1">v</Unknown>`);
        this.testClass.addTestMethod({
            name: "FromXml_PreservesUnknownAttributesAndChildren",
            isAsync: false,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`var parsed = ${this.classBeingTested.name}.FromXml(${this.literal(document)});`);
                writer.writeLine(`Assert.That(parsed.AdditionalAttributes["data-unknown"], Is.EqualTo("1"));`);
                writer.writeLine("Assert.That(parsed.AdditionalChildren, Has.Count.EqualTo(1));");
                writer.writeLine(`Assert.That(parsed.AdditionalChildren[0].Name, Is.EqualTo("Unknown"));`);
                writer.writeLine("var serialized = parsed.ToXml(false);");
                writer.writeLine(`Assert.That(serialized, Does.Contain("data-unknown=\\"1\\""));`);
                writer.writeLine(`Assert.That(serialized, Does.Contain("<Unknown a=\\"1\\">v</Unknown>"));`);
                writer.writeLine(
                    `Assert.That(${this.classBeingTested.name}.FromXml(serialized).ToXml(false), Is.EqualTo(serialized));`
                );
            })
        });
    }

    private addEscapingTest(): void {
        const property = this.getProperties().find(
            (candidate) =>
                (candidate.kind === "ATTRIBUTE" || candidate.kind === "TEXT") &&
                !candidate.isList &&
                this.primitiveKind(candidate.itemType) === "STRING"
        );
        if (property == null) {
            return;
        }
        this.testClass.addTestMethod({
            name: "ToXml_EscapesSpecialCharacters",
            isAsync: false,
            body: this.csharp.codeblock((writer) => {
                const initializers = [
                    `${property.field.name} = ${this.literal(SPECIAL_CHARACTERS)}`,
                    ...this.requiredSamples(property).map(
                        ({ property: required, sample }) => `${required.field.name} = ${sample.csharp}`
                    )
                ];
                writer.writeLine(`var model = new ${this.classBeingTested.name} { ${initializers.join(", ")} };`);
                writer.writeLine("var serialized = model.ToXml(false);");
                writer.writeLine(`Assert.That(serialized, Does.Not.Contain("a & b"));`);
                writer.writeLine(`Assert.That(serialized, Does.Not.Contain("< c"));`);
                writer.writeLine(
                    `Assert.That(${this.classBeingTested.name}.FromXml(serialized).${property.field.name}, Is.EqualTo(${this.literal(SPECIAL_CHARACTERS)}));`
                );
            })
        });
    }

    private addOpenEnumTest(): void {
        const property = this.getProperties().find(
            (candidate) => candidate.kind === "ATTRIBUTE" && !candidate.isList && this.isEnum(candidate.itemType)
        );
        if (property == null) {
            return;
        }
        const document = this.document(` ${property.wireName}="${UNKNOWN_ENUM_VALUE}"`, "", property);
        this.testClass.addTestMethod({
            name: "FromXml_KeepsUnknownEnumValues",
            isAsync: false,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`var parsed = ${this.classBeingTested.name}.FromXml(${this.literal(document)});`);
                writer.writeLine(
                    `Assert.That(parsed.ToXml(false), Does.Contain(${this.literal(`${property.wireName}="${UNKNOWN_ENUM_VALUE}"`)}));`
                );
            })
        });
    }

    private addChildOrderTest(): void {
        const childNames = this.getContentChildNames();
        const textProperty = this.getProperties().find(
            (candidate) => candidate.kind === "TEXT" && this.primitiveKind(candidate.itemType) === "STRING"
        );
        const [first, second] = childNames;
        let body: string | undefined;
        if (first != null && second != null) {
            body = `<${first} /><${second} /><${first} />`;
        } else if (first != null && textProperty != null) {
            body = `a<${first} />b`;
        }
        if (body == null) {
            return;
        }
        const document = this.document("", body);
        this.testClass.addTestMethod({
            name: "FromXml_PreservesChildOrder",
            isAsync: false,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`var parsed = ${this.classBeingTested.name}.FromXml(${this.literal(document)});`);
                writer.writeLine(`Assert.That(parsed.ToXml(false), Does.Contain(${this.literal(body)}));`);
            })
        });
    }

    private addRejectionTests(): void {
        this.testClass.addTestMethod({
            name: "FromXml_RejectsWrongRootElement",
            isAsync: false,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(
                    `Assert.That(() => ${this.classBeingTested.name}.FromXml("<NotThe${this.rootName()} />"), Throws.ArgumentException);`
                );
            })
        });
        this.testClass.addTestMethod({
            name: "FromXml_RejectsMalformedXml",
            isAsync: false,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(
                    `Assert.That(() => ${this.classBeingTested.name}.FromXml("<${this.rootName()}><unclosed>"), Throws.ArgumentException);`
                );
            })
        });
        const doctype = `<!DOCTYPE ${this.rootName()} [<!ENTITY xxe "injected">]>${this.rootStartTag("")}&xxe;</${this.rootName()}>`;
        this.testClass.addTestMethod({
            name: "FromXml_RejectsDoctype",
            isAsync: false,
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(
                    `Assert.That(() => ${this.classBeingTested.name}.FromXml(${this.literal(doctype)}), Throws.ArgumentException);`
                );
            })
        });
    }

    // ---------------------------------------------------------------------------------------------
    // Sample document
    // ---------------------------------------------------------------------------------------------

    private getProperties(): readonly XmlProperty[] {
        return this.xmlGenerator.getProperties();
    }

    private getSampledProperties(): { property: XmlProperty; sample: SampleValue }[] {
        const sampled: { property: XmlProperty; sample: SampleValue }[] = [];
        for (const property of this.getProperties()) {
            if (property.kind !== "ATTRIBUTE" && property.kind !== "TEXT") {
                continue;
            }
            const sample = this.sampleValue(property);
            if (sample != null) {
                sampled.push({ property, sample });
            }
        }
        return sampled;
    }

    private buildSampleDocument(sampled: { property: XmlProperty; sample: SampleValue }[]): string {
        const attributes = sampled
            .filter(({ property }) => property.kind === "ATTRIBUTE")
            .map(({ property, sample }) => ` ${property.wireName}="${sample.xml}"`)
            .join("");
        const text = sampled.find(({ property }) => property.kind === "TEXT")?.sample.xml ?? "";
        const children = this.getProperties()
            .filter((property) => property.kind === "ELEMENT" && property.childTypes.length > 0)
            .map((property) => this.sampleChild(property))
            .join("");
        const body = `${text}${children}`;
        return body.length === 0
            ? this.rootStartTag(attributes, true)
            : `${this.rootStartTag(attributes)}${body}</${this.rootName()}>`;
    }

    private sampleChild(property: XmlProperty): string {
        const child = property.childTypes[0];
        if (child == null) {
            return "";
        }
        const element = this.emptyElement(child);
        if (this.xmlGenerator.isWrappedListProperty(property)) {
            return `<${property.wireName}>${element}</${property.wireName}>`;
        }
        return element;
    }

    private emptyElement(declaration: TypeDeclaration): string {
        const xml = declaration.encoding?.xml;
        if (xml == null) {
            return "";
        }
        if (xml.prefix != null && xml.namespace != null) {
            return `<${xml.prefix}:${xml.name} xmlns:${xml.prefix}="${xml.namespace}" />`;
        }
        if (xml.namespace != null) {
            return `<${xml.name} xmlns="${xml.namespace}" />`;
        }
        return `<${xml.name} />`;
    }

    /** Element names of non-namespaced, non-wrapped child types that live in the ordered content. */
    private getContentChildNames(): string[] {
        const names: string[] = [];
        for (const property of this.xmlGenerator.getContentProperties()) {
            for (const child of property.childTypes) {
                const xml = child.encoding?.xml;
                if (xml != null && xml.namespace == null && !names.includes(xml.name)) {
                    names.push(xml.name);
                }
            }
        }
        return names;
    }

    private rootName(): string {
        return this.xml.prefix != null ? `${this.xml.prefix}:${this.xml.name}` : this.xml.name;
    }

    private rootStartTag(attributes: string, selfClosing = false): string {
        let namespaceDeclaration = "";
        if (this.xml.namespace != null) {
            namespaceDeclaration =
                this.xml.prefix != null
                    ? ` xmlns:${this.xml.prefix}="${this.xml.namespace}"`
                    : ` xmlns="${this.xml.namespace}"`;
        }
        return `<${this.rootName()}${namespaceDeclaration}${attributes}${selfClosing ? " />" : ">"}`;
    }

    /** Required attributes/text (with sample values) so documents in the non-round-trip tests still parse. */
    private requiredSamples(except?: XmlProperty): { property: XmlProperty; sample: SampleValue }[] {
        return this.getProperties()
            .filter((property) => !property.isOptional && !property.isNullable && property !== except)
            .map((property) => ({ property, sample: this.sampleValue(property) }))
            .filter((entry): entry is { property: XmlProperty; sample: SampleValue } => entry.sample != null);
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
            return this.rootStartTag(`${requiredAttributes}${attributes}`, true);
        }
        return `${this.rootStartTag(`${requiredAttributes}${attributes}`)}${content}</${this.rootName()}>`;
    }

    private sampleValue(property: XmlProperty): SampleValue | undefined {
        const item = this.sampleItem(property);
        if (item == null) {
            return undefined;
        }
        if (!property.isList) {
            return item;
        }
        const second = this.sampleItem(property, 1);
        if (second == null) {
            return undefined;
        }
        const separator = property.listSeparator ?? " ";
        return {
            xml: `${item.xml}${separator}${second.xml}`,
            csharp: `new[] { ${item.csharp}, ${second.csharp} }`
        };
    }

    private sampleItem(property: XmlProperty, index = 0): SampleValue | undefined {
        const type = property.itemType;
        if (type.type === "named") {
            const declaration = this.context.model.dereferenceType(type.typeId).typeDeclaration;
            if (declaration.shape.type === "enum") {
                const value = declaration.shape.values[index] ?? declaration.shape.values[0];
                if (value == null) {
                    return undefined;
                }
                const wire = getWireValue(value.name);
                const enumClass = this.context.csharpTypeMapper.convertToClassReference(declaration);
                return { xml: wire, csharp: `new ${enumClass.name}(${this.literal(wire)})` };
            }
            return undefined;
        }
        if (type.type !== "primitive") {
            return undefined;
        }
        switch (type.primitive.v1) {
            case "STRING": {
                const value = `${property.kind === "TEXT" ? "text" : property.wireName}${index === 0 ? "" : `-${index + 1}`}`;
                return { xml: value, csharp: this.literal(value) };
            }
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64": {
                const value = `${index + 1}`;
                return { xml: value, csharp: value };
            }
            case "BOOLEAN":
                return index === 0 ? { xml: "true", csharp: "true" } : { xml: "false", csharp: "false" };
            case "DOUBLE":
            case "FLOAT": {
                const value = `${index + 1}.5`;
                return { xml: value, csharp: value };
            }
            case "DATE":
            case "DATE_TIME":
            case "UUID":
            case "BASE_64":
            case "BIG_INTEGER":
                return undefined;
            default:
                return undefined;
        }
    }

    private primitiveKind(type: FernIr.TypeReference): FernIr.PrimitiveTypeV1 | undefined {
        return type.type === "primitive" ? type.primitive.v1 : undefined;
    }

    private isEnum(type: FernIr.TypeReference): boolean {
        return (
            type.type === "named" &&
            this.context.model.dereferenceType(type.typeId).typeDeclaration.shape.type === "enum"
        );
    }

    private literal(value: string): string {
        return `"${escapeForCSharpString(value)}"`;
    }
}
