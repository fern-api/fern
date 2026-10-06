import { getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { ast, escapeForCSharpString } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

type ObjectProperty = FernIr.ObjectProperty;
type TypeDeclaration = FernIr.TypeDeclaration;
type TypeReference = FernIr.TypeReference;

const ADDITIONAL_ATTRIBUTES = "AdditionalAttributes";
const ADDITIONAL_CHILDREN = "AdditionalChildren";
const CONTENT = "Content";
const CONTENT_VARIABLE = "content";
const PARSE_CONTENT_CHILD = "ParseContentChild";
const ELEMENT_VARIABLE = "element";
const RESULT_VARIABLE = "result";
const CHILD_VARIABLE = "child";
const ITEM_VARIABLE = "item";

/** Members every xml-encoded record already exposes; child builder methods must not shadow them. */
const RESERVED_MEMBER_NAMES = [
    ADDITIONAL_ATTRIBUTES,
    ADDITIONAL_CHILDREN,
    CONTENT,
    PARSE_CONTENT_CHILD,
    "AdditionalProperties",
    "AddChild",
    "AddText",
    "Comment",
    "CommentAfter",
    "CommentBefore",
    "Equals",
    "FromXElement",
    "FromXml",
    "GetHashCode",
    "OnDeserialized",
    "OnSerializing",
    "ToString",
    "ToXElement",
    "ToXml"
];

interface GeneratedField {
    name: string;
    type: ast.Type;
}

interface XmlProperty {
    irProperty: ObjectProperty;
    field: GeneratedField;
    wireName: string;
    kind: FernIr.XmlPropertyKind;
    /** The item type, with optional/nullable/list/set/alias wrappers removed. */
    itemType: TypeReference;
    itemCsType: ast.Type;
    isList: boolean;
    isSet: boolean;
    isOptional: boolean;
    isNullable: boolean;
    wrapped: boolean;
    listSeparator: string | undefined;
    /** xml-encoded object types this element property can hold (empty for scalar elements). */
    childTypes: TypeDeclaration[];
    /** Whether the item type is an undiscriminated union (children are dispatched by element name). */
    isUnion: boolean;
}

/**
 * Adds XML serialization (`ToXElement`/`ToXml`), parsing (`FromXml`/`FromXElement`), fluent child
 * builder methods and unknown attribute/child preservation to an xml-encoded object record.
 */
export class XmlObjectGenerator {
    private readonly properties: XmlProperty[];
    private readonly xml: FernIr.XmlEncoding;

    constructor(
        private readonly context: ModelGeneratorContext,
        private readonly class_: ast.Class,
        properties: ObjectProperty[],
        fields: ast.Field[],
        xml: FernIr.XmlEncoding
    ) {
        this.xml = xml;
        this.properties = properties.map((property, index) => {
            const field = fields[index];
            if (field == null) {
                throw new Error(`Missing generated field for property ${getWireValue(property.name)}`);
            }
            return this.toXmlProperty(property, field);
        });
    }

    public generate(): void {
        this.class_.interfaceReferences.push(this.context.Types.IXmlNode);
        this.addAdditionalFields();
        this.addToXElement();
        this.addToXml();
        this.addToString();
        this.addFromXml();
        this.addFromXElement();
        this.addChildItemParsers();
        this.addContentChildParser();
        this.addChildBuilderMethods();
        this.addAddChild();
        this.addAddText();
        this.addCommentMethods();
    }

    /** Element properties holding xml-encoded child models, which live in the ordered content. */
    private get contentProperties(): XmlProperty[] {
        return this.properties.filter(
            (property) => property.kind === "ELEMENT" && property.childTypes.length > 0 && !this.isWrappedList(property)
        );
    }

    private isWrappedList(property: XmlProperty): boolean {
        return property.isList && property.wrapped;
    }

    private isScalarElement(property: XmlProperty): boolean {
        return property.kind === "ELEMENT" && property.childTypes.length === 0;
    }

    // ---------------------------------------------------------------------------------------------
    // Property analysis
    // ---------------------------------------------------------------------------------------------

    private toXmlProperty(property: ObjectProperty, field: GeneratedField): XmlProperty {
        const kind = property.xml?.kind ?? "ELEMENT";
        let current = property.valueType;
        let isOptional = false;
        let isNullable = false;
        let isList = false;
        let isSet = false;
        // Unwrap optional/nullable/list/set containers and aliases down to the item type.
        for (;;) {
            if (current.type === "container") {
                const container = current.container;
                if (container.type === "optional") {
                    isOptional = isOptional || !isList;
                    current = container.optional;
                    continue;
                }
                if (container.type === "nullable") {
                    isNullable = isNullable || !isList;
                    current = container.nullable;
                    continue;
                }
                if (container.type === "list" && !isList) {
                    isList = true;
                    current = container.list;
                    continue;
                }
                if (container.type === "set" && !isList) {
                    isList = true;
                    isSet = true;
                    current = container.set;
                    continue;
                }
                break;
            }
            if (current.type === "named") {
                const declaration = this.getTypeDeclaration(current.typeId);
                if (declaration.shape.type === "alias") {
                    current = declaration.shape.aliasOf;
                    continue;
                }
            }
            break;
        }
        const childTypes = kind === "ELEMENT" ? this.getXmlChildObjectTypes(current) : [];
        return {
            irProperty: property,
            field,
            wireName: property.xml?.name ?? getWireValue(property.name),
            kind,
            itemType: current,
            itemCsType: this.context.csharpTypeMapper.convert({ reference: current }),
            isList,
            isSet,
            isOptional,
            isNullable,
            wrapped: property.xml?.wrapped ?? false,
            listSeparator: property.xml?.listSeparator,
            childTypes,
            isUnion: this.isUndiscriminatedUnion(current)
        };
    }

    private getTypeDeclaration(typeId: FernIr.TypeId): TypeDeclaration {
        return this.context.model.dereferenceType(typeId).typeDeclaration;
    }

    private isUndiscriminatedUnion(typeReference: TypeReference): boolean {
        return (
            typeReference.type === "named" &&
            this.getTypeDeclaration(typeReference.typeId).shape.type === "undiscriminatedUnion"
        );
    }

    /** Follows aliases and undiscriminated unions to the xml-encoded object types a child element can be. */
    private getXmlChildObjectTypes(typeReference: TypeReference, seen = new Set<FernIr.TypeId>()): TypeDeclaration[] {
        if (typeReference.type !== "named" || seen.has(typeReference.typeId)) {
            return [];
        }
        seen.add(typeReference.typeId);
        const declaration = this.getTypeDeclaration(typeReference.typeId);
        const shape = declaration.shape;
        switch (shape.type) {
            case "object":
                if (declaration.encoding?.xml == null) {
                    throw new Error(
                        `Type ${declaration.name.typeId} is used as a child element of xml-encoded type ${this.xml.name} but has no xml encoding`
                    );
                }
                return [declaration];
            case "alias":
                return this.getXmlChildObjectTypes(shape.aliasOf, seen);
            case "undiscriminatedUnion":
                return shape.members.flatMap((member) => this.getXmlChildObjectTypes(member.type, seen));
            case "enum":
            case "union":
                return [];
            default:
                assertNever(shape);
        }
    }

    private getXmlName(declaration: TypeDeclaration): string {
        const xml = declaration.encoding?.xml;
        if (xml == null) {
            throw new Error(`Type ${declaration.name.typeId} is not xml-encoded`);
        }
        return xml.name;
    }

    /** `value` is required-and-present: absent input is an error rather than null/default. */
    private isRequiredValue(property: XmlProperty): boolean {
        return !property.isOptional && !property.isNullable && !property.isList;
    }

    // ---------------------------------------------------------------------------------------------
    // Code helpers
    // ---------------------------------------------------------------------------------------------

    private get csharp() {
        return this.context.csharp;
    }

    private get xmlUtils(): ast.ClassReference {
        return this.context.Types.XmlUtils;
    }

    private get xelement(): ast.ClassReference {
        return this.context.System.Xml.Linq.XElement;
    }

    private string(value: string): string {
        return `"${escapeForCSharpString(value)}"`;
    }

    private stringOrNull(value: string | undefined): string {
        return value == null ? "null" : this.string(value);
    }

    private stringArray(values: string[]): string {
        return `new string[] { ${values.map((value) => this.string(value)).join(", ")} }`;
    }

    /** Fully-qualified reference usable in expression position even when a same-named method exists. */
    private qualifiedTypeName(declaration: TypeDeclaration): string {
        const reference = this.context.csharpTypeMapper.convertToClassReference(declaration);
        return `global::${reference.namespace}.${reference.name}`;
    }

    private utils(writer: ast.Writer, method: string): void {
        writer.writeNode(this.xmlUtils);
        writer.write(`.${method}`);
    }

    private writeGeneric(writer: ast.Writer, type: ast.Type): void {
        writer.write("<");
        writer.writeNode(type);
        writer.write(">");
    }

    private itemParserName(property: XmlProperty): string {
        return `Parse${property.field.name}Item`;
    }

    // ---------------------------------------------------------------------------------------------
    // Fields
    // ---------------------------------------------------------------------------------------------

    private addAdditionalFields(): void {
        const jsonIgnore = this.csharp.annotation({
            reference: this.context.System.Text.Json.Serialization.JsonIgnore
        });
        const attributesType = this.context.System.Collections.Generic.Dictionary(
            this.context.Primitive.string,
            this.context.Primitive.string
        );
        this.class_.addField({
            name: ADDITIONAL_ATTRIBUTES,
            type: attributesType,
            access: ast.Access.Public,
            get: true,
            set: true,
            summary: "XML attributes that are not part of the typed model. They are written back by ToXml().",
            annotations: [jsonIgnore],
            initializer: this.csharp.codeblock("new()")
        });
        this.class_.addField({
            name: CONTENT,
            type: this.context.Collection.listType(this.context.Primitive.object),
            access: ast.Access.Public,
            get: true,
            set: true,
            summary:
                "Ordered content of the element: text segments (string), comments (XmlComment), typed child elements and child elements that are not part of the typed model (XmlElement), in the order they are written. Typed children assigned directly to their property are appended after it.",
            annotations: [jsonIgnore],
            initializer: this.csharp.codeblock("new()")
        });
        this.class_.addField({
            name: ADDITIONAL_CHILDREN,
            type: this.csharp.classReference({
                name: "IReadOnlyList",
                namespace: "System.Collections.Generic",
                generics: [this.context.Types.XmlElement]
            }),
            access: ast.Access.Public,
            get: true,
            summary:
                "Child elements that are not part of the typed model, derived from Content (a snapshot; add children through AddChild or Content).",
            annotations: [jsonIgnore],
            initializer: this.csharp.codeblock(`${CONTENT}.OfType<XmlElement>().ToList()`),
            useExpressionBody: true
        });
    }

    // ---------------------------------------------------------------------------------------------
    // Serialization
    // ---------------------------------------------------------------------------------------------

    private addToXElement(): void {
        this.class_.addMethod({
            name: "ToXElement",
            access: ast.Access.Public,
            return_: this.xelement,
            parameters: [],
            summary: "Renders this value as an XML element.",
            body: this.csharp.codeblock((writer) => {
                writer.write(`var ${ELEMENT_VARIABLE} = `);
                this.utils(writer, "CreateElement");
                writer.writeLine(
                    `(${this.string(this.xml.name)}, ${this.stringOrNull(this.xml.namespace)}, ${this.stringOrNull(this.xml.prefix)});`
                );
                for (const property of this.properties) {
                    this.writeSerializeProperty(writer, property);
                }
                this.writeSerializeContent(writer);
                this.utils(writer, "SetAttributes");
                writer.writeLine(`(${ELEMENT_VARIABLE}, ${ADDITIONAL_ATTRIBUTES});`);
                writer.writeLine(`return ${ELEMENT_VARIABLE};`);
            })
        });
    }

    private writeSerializeProperty(writer: ast.Writer, property: XmlProperty): void {
        const name = property.field.name;
        switch (property.kind) {
            case "ATTRIBUTE":
            case "TEXT": {
                const setter = property.kind === "ATTRIBUTE" ? "SetAttribute" : "SetText";
                const target =
                    property.kind === "ATTRIBUTE"
                        ? `${ELEMENT_VARIABLE}, ${this.string(property.wireName)}, `
                        : `${ELEMENT_VARIABLE}, `;
                this.utils(writer, setter);
                writer.write(`(${target}`);
                if (property.isList) {
                    this.utils(writer, "JoinValues");
                    writer.write(`(${name}, ${this.string(property.listSeparator ?? " ")})`);
                } else {
                    this.utils(writer, "ToXmlString");
                    writer.write(`(${name})`);
                }
                writer.writeLine(");");
                return;
            }
            case "ELEMENT": {
                // Scalar element properties are written in property order; child models and wrapped
                // lists are written through the ordered content (see writeSerializeContent).
                if (this.isScalarElement(property) && !this.isWrappedList(property)) {
                    this.writeSerializeScalarElement(writer, property);
                }
                return;
            }
            default:
                assertNever(property.kind);
        }
    }

    private writeSerializeScalarElement(writer: ast.Writer, property: XmlProperty): void {
        const name = property.field.name;
        if (!property.isList) {
            this.utils(writer, "AddChildValue");
            writer.write(`(${ELEMENT_VARIABLE}, ${this.string(property.wireName)}, `);
            this.utils(writer, "ToXmlString");
            writer.writeLine(`(${name}));`);
            return;
        }
        writer.writeLine(`if (${name} != null)`);
        writer.writeLine("{");
        writer.indent();
        writer.writeLine(`foreach (var ${ITEM_VARIABLE} in ${name})`);
        writer.writeLine("{");
        writer.indent();
        this.utils(writer, "AddChildValue");
        writer.write(`(${ELEMENT_VARIABLE}, ${this.string(property.wireName)}, `);
        this.utils(writer, "ToXmlString");
        writer.writeLine(`(${ITEM_VARIABLE}));`);
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
    }

    /**
     * `XmlUtils.AddContent(element, XmlUtils.OrderContent(Content, <child props>), <wrapped lists>)`:
     * walks the ordered content (typed children, raw elements, text) and deals wrapped-list items out
     * to their wrapper markers.
     */
    private writeSerializeContent(writer: ast.Writer): void {
        const wrapped = this.properties.filter((property) => this.isWrappedList(property));
        this.utils(writer, "AddContent");
        writer.write(`(${ELEMENT_VARIABLE}, `);
        this.utils(writer, "OrderContent");
        writer.write(`(${CONTENT}`);
        for (const property of this.contentProperties) {
            // Content holds the child models themselves; unwrap union items to match them by reference.
            writer.write(
                property.isUnion
                    ? `, ${property.field.name}?.Select(${ITEM_VARIABLE} => ${ITEM_VARIABLE}.Value)`
                    : `, ${property.field.name}`
            );
        }
        writer.write(")");
        if (wrapped.length > 0) {
            writer.writeLine(", new Dictionary<string, List<XElement>?>");
            writer.writeLine("{");
            writer.indent();
            for (const property of wrapped) {
                writer.write(`{ ${this.string(property.wireName)}, `);
                this.utils(writer, "RenderWrappedItems");
                writer.write(`(${property.field.name}, ${ITEM_VARIABLE} => `);
                if (this.isScalarElement(property)) {
                    this.utils(writer, "ChildValue");
                    writer.write(`(${this.string(property.wireName)}, `);
                    this.utils(writer, "ToXmlString");
                    writer.write(`(${ITEM_VARIABLE}))`);
                } else {
                    writer.write(this.childToXElement(property, ITEM_VARIABLE));
                }
                writer.writeLine(") },");
            }
            writer.dedent();
            writer.write("}");
        }
        writer.writeLine(");");
    }

    private childToXElement(property: XmlProperty, variable: string): string {
        if (!property.isUnion) {
            return `${variable}.ToXElement()`;
        }
        const utils = `global::${this.xmlUtils.namespace}.${this.xmlUtils.name}`;
        return `${utils}.ToXElement(${variable}.Value)`;
    }

    private addToXml(): void {
        this.class_.addMethod({
            name: "ToXml",
            access: ast.Access.Public,
            return_: this.context.Primitive.string,
            parameters: [],
            summary: "Serializes this value to an XML document, prefixed with the XML declaration.",
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock((writer) => {
                writer.write("ToXml(true)");
            })
        });
        this.class_.addMethod({
            name: "ToXml",
            access: ast.Access.Public,
            return_: this.context.Primitive.string,
            parameters: [
                this.csharp.parameter({
                    name: "xmlDeclaration",
                    type: this.context.Primitive.boolean,
                    docs: "Whether to prefix the output with the XML declaration."
                })
            ],
            summary: "Serializes this value to an XML element, optionally prefixed with the XML declaration.",
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock((writer) => {
                this.utils(writer, "Serialize");
                writer.write("(ToXElement(), xmlDeclaration)");
            })
        });
    }

    private addToString(): void {
        this.class_.addMethod({
            name: "ToString",
            access: ast.Access.Public,
            override: true,
            return_: this.context.Primitive.string,
            parameters: [],
            summary: "Returns the XML representation of this value.",
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock((writer) => {
                writer.write("ToXml()");
            })
        });
    }

    // ---------------------------------------------------------------------------------------------
    // Parsing
    // ---------------------------------------------------------------------------------------------

    private addFromXml(): void {
        this.class_.addMethod({
            name: "FromXml",
            access: ast.Access.Public,
            type: ast.MethodType.STATIC,
            return_: this.class_.reference,
            parameters: [this.csharp.parameter({ name: "xml", type: this.context.Primitive.string })],
            summary: `Parses a <c>&lt;${this.xml.name}&gt;</c> XML document. Throws <see cref="ArgumentException"/> if the XML is malformed or the root element does not match.`,
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock((writer) => {
                writer.write("FromXElement(");
                this.utils(writer, "ParseRoot");
                writer.write(`(xml, ${this.string(this.xml.name)}))`);
            })
        });
    }

    private addFromXElement(): void {
        const knownAttributes = this.properties
            .filter((property) => property.kind === "ATTRIBUTE")
            .map((property) => property.wireName);
        const scalarChildren: string[] = [];
        const wrappers: [string, string[]][] = [];
        for (const property of this.properties) {
            if (property.kind !== "ELEMENT") {
                continue;
            }
            const names = property.childTypes.length === 0 ? [property.wireName] : this.childNames(property);
            if (this.isWrappedList(property)) {
                wrappers.push([property.wireName, names]);
            } else if (this.isScalarElement(property)) {
                scalarChildren.push(...names);
            }
        }
        const hasTextProperty = this.properties.some((property) => property.kind === "TEXT");
        const hasContentChildren = this.contentProperties.length > 0;
        this.class_.addMethod({
            name: "FromXElement",
            access: ast.Access.Public,
            type: ast.MethodType.STATIC,
            return_: this.class_.reference,
            parameters: [this.csharp.parameter({ name: ELEMENT_VARIABLE, type: this.xelement })],
            summary: "Reads this value from an already-parsed XML element.",
            body: this.csharp.codeblock((writer) => {
                this.utils(writer, "RequireName");
                writer.writeLine(`(${ELEMENT_VARIABLE}, ${this.string(this.xml.name)});`);
                writer.write(`var ${CONTENT_VARIABLE} = `);
                this.utils(writer, "ReadContent");
                writer.write(`(${ELEMENT_VARIABLE}, ${hasContentChildren ? PARSE_CONTENT_CHILD : "null"}, `);
                writer.write(`${hasTextProperty ? "true" : "false"}, `);
                writer.write(scalarChildren.length > 0 ? this.stringArray(scalarChildren) : "null");
                writer.write(", ");
                if (wrappers.length > 0) {
                    writer.write("new Dictionary<string, string[]> { ");
                    writer.write(
                        wrappers
                            .map(([wrapper, names]) => `{ ${this.string(wrapper)}, ${this.stringArray(names)} }`)
                            .join(", ")
                    );
                    writer.write(" }");
                } else {
                    writer.write("null");
                }
                writer.writeLine(");");
                writer.write(`var ${RESULT_VARIABLE} = new `);
                writer.writeNode(this.class_.reference);
                writer.writeLine();
                writer.writeLine("{");
                writer.indent();
                for (const property of this.properties) {
                    writer.write(`${property.field.name} = `);
                    this.writeReadExpression(writer, property);
                    writer.writeLine(",");
                }
                writer.write(`${ADDITIONAL_ATTRIBUTES} = `);
                this.utils(writer, "GetAdditionalAttributes");
                writer.write(`(${ELEMENT_VARIABLE}`);
                for (const attribute of knownAttributes) {
                    writer.write(`, ${this.string(attribute)}`);
                }
                writer.writeLine("),");
                writer.writeLine(`${CONTENT} = ${CONTENT_VARIABLE},`);
                writer.dedent();
                writer.writeLine("};");
                writer.writeLine(`return ${RESULT_VARIABLE};`);
            })
        });
    }

    private childNames(property: XmlProperty): string[] {
        return property.childTypes.map((childType) => this.getXmlName(childType));
    }

    private writeReadExpression(writer: ast.Writer, property: XmlProperty): void {
        switch (property.kind) {
            case "ATTRIBUTE":
            case "TEXT": {
                this.writeReadScalar(writer, property, (w) => {
                    const required = this.isRequiredValue(property);
                    if (property.kind === "ATTRIBUTE") {
                        this.utils(w, required ? "RequireAttribute" : "GetAttribute");
                        w.write(`(${ELEMENT_VARIABLE}, ${this.string(property.wireName)})`);
                    } else {
                        this.utils(w, required ? "RequireLeadingText" : "GetLeadingText");
                        w.write(`(${ELEMENT_VARIABLE})`);
                    }
                });
                return;
            }
            case "ELEMENT": {
                this.writeReadElement(writer, property);
                return;
            }
            default:
                assertNever(property.kind);
        }
    }

    /** Parses a scalar (or separator-delimited list of scalars) from raw attribute/text content. */
    private writeReadScalar(writer: ast.Writer, property: XmlProperty, writeRaw: (writer: ast.Writer) => void): void {
        if (!property.isList) {
            this.utils(writer, "ParseValue");
            this.writeGeneric(writer, property.field.type);
            writer.write("(");
            writeRaw(writer);
            writer.write(")");
            return;
        }
        this.utils(writer, property.isSet ? "ParseSet" : "ParseList");
        this.writeGeneric(writer, property.itemCsType);
        writer.write("(");
        writeRaw(writer);
        writer.write(`, ${this.string(property.listSeparator ?? " ")})`);
        this.writeEmptyCollectionFallback(writer, property);
    }

    /** Required collections are never null on the record, so absent input becomes an empty collection. */
    private writeEmptyCollectionFallback(writer: ast.Writer, property: XmlProperty): void {
        if (property.isOptional || property.isNullable) {
            return;
        }
        writer.write(" ?? new ");
        writer.writeNode(
            property.isSet
                ? this.context.Collection.set(property.itemCsType)
                : this.context.Collection.listType(property.itemCsType)
        );
        writer.write("()");
    }

    private writeReadElement(writer: ast.Writer, property: XmlProperty): void {
        const isScalar = property.childTypes.length === 0;
        const source = this.isWrappedList(property)
            ? (w: ast.Writer) => {
                  this.utils(w, "GetWrapperItems");
                  w.write(`(${ELEMENT_VARIABLE}, ${this.string(property.wireName)})`);
              }
            : (w: ast.Writer) => w.write(`${ELEMENT_VARIABLE}.Elements()`);
        if (isScalar) {
            if (!property.isList) {
                this.writeReadScalar(writer, property, (w) => {
                    this.utils(w, this.isRequiredValue(property) ? "RequireChildText" : "GetChildText");
                    w.write(`(${ELEMENT_VARIABLE}, ${this.string(property.wireName)})`);
                });
                return;
            }
            this.utils(writer, property.isSet ? "ParseChildSet" : "ParseChildList");
            this.writeGeneric(writer, property.itemCsType);
            writer.write("(");
            source(writer);
            writer.write(`, ${this.string(property.wireName)})`);
            this.writeEmptyCollectionFallback(writer, property);
            return;
        }
        if (this.isWrappedList(property)) {
            const parser = property.isUnion
                ? this.itemParserName(property)
                : `${this.qualifiedTypeName(this.requireSingleChildType(property))}.FromXElement`;
            this.utils(writer, property.isSet ? "ParseChildrenSet" : "ParseChildren");
            writer.write("(");
            source(writer);
            writer.write(`, ${this.stringArray(this.childNames(property))}, ${parser})`);
            this.writeEmptyCollectionFallback(writer, property);
            return;
        }
        // Child models are taken from the ordered content so they keep their identity and position.
        const writeItems = (w: ast.Writer) => {
            this.utils(w, "ContentItems");
            if (property.isUnion) {
                w.write(
                    `(${CONTENT_VARIABLE}, ${this.itemMatcherName(property)}, ${this.itemConverterName(property)})`
                );
            } else {
                this.writeGeneric(w, property.itemCsType);
                w.write(`(${CONTENT_VARIABLE})`);
            }
        };
        if (property.isList) {
            if (property.isSet) {
                writer.write("new ");
                writer.writeNode(this.context.Collection.set(property.itemCsType));
                writer.write("(");
                writeItems(writer);
                writer.write(")");
            } else {
                writeItems(writer);
            }
            return;
        }
        if (property.isUnion) {
            this.utils(writer, "FirstOrNull");
            writer.write("(");
            writeItems(writer);
            writer.write(")");
        } else {
            writeItems(writer);
            writer.write(".FirstOrDefault()");
        }
        if (this.isRequiredValue(property)) {
            writer.write(" ?? throw ");
            this.utils(writer, "MissingChild");
            writer.write(`(${ELEMENT_VARIABLE}, ${this.stringArray(this.childNames(property))})`);
        }
    }

    private itemMatcherName(property: XmlProperty): string {
        return `Is${property.field.name}Item`;
    }

    private itemConverterName(property: XmlProperty): string {
        return `To${property.field.name}Item`;
    }

    /**
     * `private static object? ParseContentChild(XElement child)`: parses a child element into the
     * typed model named by its element name, or null for elements the model does not declare.
     */
    private addContentChildParser(): void {
        const childTypes = new Map<string, TypeDeclaration>();
        for (const property of this.contentProperties) {
            for (const childType of property.childTypes) {
                childTypes.set(this.getXmlName(childType), childType);
            }
        }
        if (childTypes.size === 0) {
            return;
        }
        this.class_.addMethod({
            name: PARSE_CONTENT_CHILD,
            access: ast.Access.Private,
            type: ast.MethodType.STATIC,
            return_: this.context.Primitive.object.asOptional(),
            parameters: [this.csharp.parameter({ name: CHILD_VARIABLE, type: this.xelement })],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`switch (${CHILD_VARIABLE}.Name.LocalName)`);
                writer.writeLine("{");
                writer.indent();
                for (const [xmlName, childType] of childTypes) {
                    writer.writeLine(`case ${this.string(xmlName)}:`);
                    writer.indent();
                    writer.writeLine(`return ${this.qualifiedTypeName(childType)}.FromXElement(${CHILD_VARIABLE});`);
                    writer.dedent();
                }
                writer.writeLine("default:");
                writer.indent();
                writer.writeLine("return null;");
                writer.dedent();
                writer.dedent();
                writer.writeLine("}");
            })
        });
    }

    private requireSingleChildType(property: XmlProperty): TypeDeclaration {
        const [childType] = property.childTypes;
        if (childType == null || property.childTypes.length !== 1) {
            throw new Error(`Expected exactly one xml child type for property ${property.wireName}`);
        }
        return childType;
    }

    /** `private static <ItemType> Parse<Prop>Item(XElement child)` dispatching on the child element name. */
    private addChildItemParsers(): void {
        for (const property of this.properties) {
            if (property.kind !== "ELEMENT" || !property.isUnion || property.childTypes.length === 0) {
                continue;
            }
            if (!this.isWrappedList(property)) {
                this.addContentItemMatcher(property);
                this.addContentItemConverter(property);
                continue;
            }
            this.class_.addMethod({
                name: this.itemParserName(property),
                access: ast.Access.Private,
                type: ast.MethodType.STATIC,
                return_: property.itemCsType,
                parameters: [this.csharp.parameter({ name: CHILD_VARIABLE, type: this.xelement })],
                body: this.csharp.codeblock((writer) => {
                    writer.writeLine(`switch (${CHILD_VARIABLE}.Name.LocalName)`);
                    writer.writeLine("{");
                    writer.indent();
                    for (const childType of property.childTypes) {
                        writer.writeLine(`case ${this.string(this.getXmlName(childType))}:`);
                        writer.indent();
                        writer.writeLine(
                            `return ${this.qualifiedTypeName(childType)}.FromXElement(${CHILD_VARIABLE});`
                        );
                        writer.dedent();
                    }
                    writer.writeLine("default:");
                    writer.indent();
                    writer.write("throw ");
                    this.utils(writer, "UnexpectedElement");
                    writer.writeLine(`(${CHILD_VARIABLE});`);
                    writer.dedent();
                    writer.dedent();
                    writer.writeLine("}");
                })
            });
        }
    }

    /** `private static bool Is<Prop>Item(object item)`: whether a content item belongs to the union property. */
    private addContentItemMatcher(property: XmlProperty): void {
        this.class_.addMethod({
            name: this.itemMatcherName(property),
            access: ast.Access.Private,
            type: ast.MethodType.STATIC,
            return_: this.context.Primitive.boolean,
            parameters: [this.csharp.parameter({ name: ITEM_VARIABLE, type: this.context.Primitive.object })],
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock((writer) => {
                writer.write(
                    property.childTypes
                        .map((childType) => `${ITEM_VARIABLE} is ${this.qualifiedTypeName(childType)}`)
                        .join(" || ")
                );
            })
        });
    }

    /** `private static <Union> To<Prop>Item(object item)`: wraps a matched content item in the union. */
    private addContentItemConverter(property: XmlProperty): void {
        this.class_.addMethod({
            name: this.itemConverterName(property),
            access: ast.Access.Private,
            type: ast.MethodType.STATIC,
            return_: property.itemCsType,
            parameters: [this.csharp.parameter({ name: ITEM_VARIABLE, type: this.context.Primitive.object })],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`switch (${ITEM_VARIABLE})`);
                writer.writeLine("{");
                writer.indent();
                for (const childType of property.childTypes) {
                    writer.writeLine(`case ${this.qualifiedTypeName(childType)} value:`);
                    writer.indent();
                    writer.writeLine("return value;");
                    writer.dedent();
                }
                writer.writeLine("default:");
                writer.indent();
                writer.writeLine(
                    `throw new ArgumentException($"Unexpected content item of type {${ITEM_VARIABLE}.GetType().Name}");`
                );
                writer.dedent();
                writer.dedent();
                writer.writeLine("}");
            })
        });
    }

    // ---------------------------------------------------------------------------------------------
    // Builders
    // ---------------------------------------------------------------------------------------------

    /**
     * For each child element type, a fluent method named after its XML element (e.g. `response.Say(...)`)
     * that appends (lists) or sets (single) the child and returns `this`. Names that collide with
     * existing members get an `Add` prefix (and a numeric suffix if still taken).
     */
    private addChildBuilderMethods(): void {
        const takenNames = new Set<string>([
            this.class_.reference.name,
            ...RESERVED_MEMBER_NAMES,
            ...this.properties.map((property) => property.field.name)
        ]);
        for (const property of this.properties) {
            if (property.kind !== "ELEMENT") {
                continue;
            }
            for (const childType of property.childTypes) {
                const name = this.pickBuilderName(this.getXmlName(childType), takenNames);
                this.addChildBuilderMethod(property, childType, name);
            }
        }
    }

    private pickBuilderName(xmlName: string, takenNames: Set<string>): string {
        const pascal = this.context.case.pascalSafe(xmlName);
        let name = pascal;
        if (takenNames.has(name)) {
            const prefixed = `Add${pascal}`;
            name = prefixed;
            for (let suffix = 2; takenNames.has(name); suffix++) {
                name = `${prefixed}${suffix}`;
            }
        }
        takenNames.add(name);
        return name;
    }

    /**
     * Doc block for a fluent child method: the summary, the child type's own description,
     * and a `<param>` entry for every documented parameter.
     */
    private childBuilderDoc({
        summary,
        childType,
        parameters
    }: {
        summary: string;
        childType: TypeDeclaration;
        parameters: { name: string; docs: string | undefined }[];
    }): (writer: ast.XmlDocWriter) => void {
        const childDocs = childType.docs?.trim();
        const documented = parameters.filter(
            (parameter): parameter is { name: string; docs: string } =>
                parameter.docs != null && parameter.docs.trim() !== ""
        );
        return (writer) => {
            writer.writeLine("<summary>");
            writer.writeLine(summary);
            if (childDocs != null && childDocs !== "") {
                writer.writeLine("<para>");
                writer.writeMultilineWithEscaping(childDocs);
                writer.writeLine("</para>");
            }
            writer.writeLine("</summary>");
            for (const parameter of documented) {
                writer.writePrefix();
                writer.write(`<param name="${parameter.name}">`);
                writer.writeWithEscaping(parameter.docs.trim().split(/\r?\n/).join(" "));
                writer.write("</param>");
                writer.writeNewLineIfLastLineNot();
            }
        };
    }

    private addChildBuilderMethod(property: XmlProperty, childType: TypeDeclaration, name: string): void {
        const childReference = this.context.csharpTypeMapper.convertToClassReference(childType);
        const parameterName = this.context.case.camelSafe(childReference.name);
        const xmlName = this.getXmlName(childType);
        this.class_.addMethod({
            name,
            access: ast.Access.Public,
            return_: this.class_.reference,
            parameters: [this.csharp.parameter({ name: parameterName, type: childReference })],
            doc: this.childBuilderDoc({
                summary: `Adds a <c>&lt;${xmlName}&gt;</c> child element after any content added so far and returns this instance for chaining.`,
                childType,
                parameters: [{ name: parameterName, docs: `The <c>&lt;${xmlName}&gt;</c> element to add.` }]
            }),
            body: this.csharp.codeblock((writer) => {
                writer.write(`${property.field.name} = `);
                if (property.isList) {
                    this.utils(writer, property.isSet ? "AppendToSet" : "Append");
                    this.writeGeneric(writer, property.itemCsType);
                    writer.writeLine(`(${property.field.name}, ${parameterName});`);
                } else {
                    writer.writeLine(`${parameterName};`);
                }
                if (!this.isWrappedList(property)) {
                    writer.writeLine(`${CONTENT}.Add(${parameterName});`);
                }
                writer.writeLine("return this;");
            })
        });

        const scalarProperties = this.getScalarBuilderProperties(childType);
        if (scalarProperties == null) {
            return;
        }
        const parameters = scalarProperties.map((scalar) =>
            this.csharp.parameter({
                name: this.context.case.camelSafe(scalar.field.name),
                type: this.isRequiredValue(scalar) ? scalar.field.type : this.asNullable(scalar.field.type),
                initializer: this.isRequiredValue(scalar) ? undefined : "null",
                docs: scalar.irProperty.docs
            })
        );
        this.class_.addMethod({
            name,
            access: ast.Access.Public,
            return_: this.class_.reference,
            parameters,
            doc: this.childBuilderDoc({
                summary: `Adds a <c>&lt;${xmlName}&gt;</c> child element built from the given values and returns this instance for chaining.`,
                childType,
                parameters: parameters.map((parameter) => ({ name: parameter.name, docs: parameter.docs }))
            }),
            body: this.csharp.codeblock((writer) => {
                writer.write(`return ${name}(new ${this.qualifiedTypeName(childType)}`);
                if (parameters.length === 0) {
                    writer.writeLine("());");
                    return;
                }
                writer.writeLine();
                writer.writeLine("{");
                writer.indent();
                scalarProperties.forEach((scalar, index) => {
                    const parameter = parameters[index];
                    if (parameter == null) {
                        throw new Error(`Missing parameter for ${scalar.field.name}`);
                    }
                    writer.write(`${scalar.field.name} = ${parameter.name}`);
                    if (scalar.isList && !scalar.isOptional && !scalar.isNullable) {
                        writer.write(" ?? new ");
                        writer.writeNode(
                            scalar.isSet
                                ? this.context.Collection.set(scalar.itemCsType)
                                : this.context.Collection.listType(scalar.itemCsType)
                        );
                        writer.write("()");
                    }
                    writer.writeLine(",");
                });
                writer.dedent();
                writer.writeLine("});");
            })
        });
    }

    private asNullable(type: ast.Type): ast.Type {
        return type.isOptional ? type : type.asOptional();
    }

    /**
     * The text/attribute properties of a child type, ordered required-first, for the convenience
     * overload (`response.Say("Hello", voice: "alice")`). Returns undefined when the child has a
     * required element property the overload could not populate.
     */
    private getScalarBuilderProperties(childType: TypeDeclaration): XmlProperty[] | undefined {
        if (childType.shape.type !== "object") {
            return undefined;
        }
        const childObject = childType.shape;
        const childXml = childType.encoding?.xml;
        if (childXml == null) {
            return undefined;
        }
        const childClass = this.context.csharpTypeMapper.convertToClassReference(childType);
        const childProperties = [...childObject.properties, ...(childObject.extendedProperties ?? [])];
        const scalars: XmlProperty[] = [];
        for (const property of childProperties) {
            const xmlProperty = this.toXmlProperty(property, {
                name: this.csharp.getPropertyName(childClass, property),
                type: this.context.csharpTypeMapper.convert({ reference: property.valueType })
            });
            if (xmlProperty.kind === "ELEMENT") {
                if (this.isRequiredValue(xmlProperty)) {
                    return undefined;
                }
                continue;
            }
            scalars.push(xmlProperty);
        }
        return [
            ...scalars.filter((scalar) => this.isRequiredValue(scalar)),
            ...scalars.filter((scalar) => !this.isRequiredValue(scalar))
        ];
    }

    private addAddChild(): void {
        this.class_.addMethod({
            name: "AddChild",
            access: ast.Access.Public,
            return_: this.class_.reference,
            parameters: [this.csharp.parameter({ name: CHILD_VARIABLE, type: this.context.Types.XmlElement })],
            summary:
                "Adds an arbitrary child element (for elements not covered by the typed model) after any content added so far and returns this instance for chaining.",
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`${CONTENT}.Add(${CHILD_VARIABLE});`);
                writer.writeLine("return this;");
            })
        });
    }

    private addAddText(): void {
        this.class_.addMethod({
            name: "AddText",
            access: ast.Access.Public,
            return_: this.class_.reference,
            parameters: [this.csharp.parameter({ name: "text", type: this.context.Primitive.string })],
            summary:
                "Appends a text segment after any content added so far, so text can be interleaved with child elements, and returns this instance for chaining.",
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`${CONTENT}.Add(text);`);
                writer.writeLine("return this;");
            })
        });
    }

    private addCommentMethods(): void {
        const methods: { name: string; factory: string | undefined; summary: string }[] = [
            {
                name: "Comment",
                factory: undefined,
                summary:
                    "Appends an XML comment (<!--text-->) inside this element after any content added so far and returns this instance for chaining."
            },
            {
                name: "CommentBefore",
                factory: "Before",
                summary:
                    "Adds an XML comment rendered immediately before this element (as a sibling in its parent, or before the root element) and returns this instance for chaining."
            },
            {
                name: "CommentAfter",
                factory: "After",
                summary:
                    "Adds an XML comment rendered immediately after this element (as a sibling in its parent, or after the root element) and returns this instance for chaining."
            }
        ];
        for (const method of methods) {
            this.class_.addMethod({
                name: method.name,
                access: ast.Access.Public,
                return_: this.class_.reference,
                parameters: [this.csharp.parameter({ name: "text", type: this.context.Primitive.string })],
                summary: method.summary,
                body: this.csharp.codeblock((writer) => {
                    writer.write(`${CONTENT}.Add(`);
                    if (method.factory == null) {
                        writer.write("new ");
                        writer.writeNode(this.context.Types.XmlComment);
                        writer.writeLine("(text));");
                    } else {
                        writer.writeNode(this.context.Types.XmlComment);
                        writer.writeLine(`.${method.factory}(text));`);
                    }
                    writer.writeLine("return this;");
                })
            });
        }
    }
}
