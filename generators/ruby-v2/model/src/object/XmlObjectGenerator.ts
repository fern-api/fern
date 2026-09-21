import { getOriginalName, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

type ScalarKind = "string" | "integer" | "float" | "boolean";

type XmlValue =
    | { type: "scalar"; kind: ScalarKind }
    | { type: "literal"; literal: FernIr.Literal }
    | { type: "enum"; enum: ruby.ClassReference }
    | { type: "object" };

interface XmlProperty {
    fieldName: string;
    wireName: string;
    kind: FernIr.XmlPropertyKind;
    isList: boolean;
    isOptional: boolean;
    wrapped: boolean;
    listSeparator: string;
    value: XmlValue;
    childTypes: FernIr.TypeDeclaration[];
}

const DEFAULT_LIST_SEPARATOR = " ";

/** Instance methods provided by Model / Xml::Serializable that a child builder must not shadow. */
const RESERVED_METHOD_NAMES = new Set([
    "initialize",
    "to_h",
    "to_s",
    "to_xml",
    "to_xml_element",
    "add_child",
    "additional_attributes",
    "additional_children",
    "inspect",
    "hash",
    "class",
    "send",
    "public_send",
    "method",
    "methods",
    "object_id",
    "freeze",
    "dup",
    "clone",
    "tap",
    "then",
    "display",
    "extend",
    "instance_variables"
]);

/**
 * Emits the XML mapping declarations and fluent child builders for an object type that has an xml
 * encoding. Serialization/parsing itself lives in the `Internal::Xml::Serializable` runtime mixin.
 */
export class XmlObjectGenerator {
    private readonly xml: FernIr.XmlEncoding;
    private readonly properties: XmlProperty[];

    constructor(
        private readonly context: ModelGeneratorContext,
        private readonly typeDeclaration: FernIr.TypeDeclaration,
        private readonly objectDeclaration: FernIr.ObjectTypeDeclaration,
        xml: FernIr.XmlEncoding
    ) {
        this.xml = xml;
        this.properties = [
            ...(objectDeclaration.extendedProperties ?? []),
            ...(objectDeclaration.properties ?? [])
        ].map((property) => this.analyzeProperty(property));
    }

    public generateStatements(): ruby.AstNode[] {
        return [this.getIncludeStatement(), this.getMappingStatements(), ...this.getChildBuilderMethods()];
    }

    private getIncludeStatement(): ruby.AstNode {
        return ruby.codeblock((writer) => {
            writer.write("include ");
            this.context.getXmlSerializableReference().write(writer);
        });
    }

    // ---------------------------------------------------------------------------------------------
    // Property analysis
    // ---------------------------------------------------------------------------------------------

    private analyzeProperty(property: FernIr.ObjectProperty): XmlProperty {
        let current = property.valueType;
        let isOptional = false;
        let isList = false;
        // Unwrap optional/nullable/list/set wrappers (and aliases to them) down to the item type.
        for (;;) {
            if (current.type === "container") {
                const container = current.container;
                if (container.type === "optional") {
                    isOptional = true;
                    current = container.optional;
                    continue;
                }
                if (container.type === "nullable") {
                    isOptional = true;
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
                    current = container.set;
                    continue;
                }
                break;
            }
            if (current.type === "named") {
                const declaration = this.context.getTypeDeclarationOrThrow(current.typeId);
                if (declaration.shape.type === "alias") {
                    current = declaration.shape.aliasOf;
                    continue;
                }
            }
            break;
        }
        const childTypes = this.getXmlChildObjectTypes(current);
        return {
            fieldName: this.context.caseConverter.snakeSafe(property.name),
            wireName: property.xml?.name ?? getWireValue(property.name),
            kind: property.xml?.kind ?? FernIr.XmlPropertyKind.Element,
            isList,
            isOptional,
            wrapped: property.xml?.wrapped ?? false,
            listSeparator: property.xml?.listSeparator || DEFAULT_LIST_SEPARATOR,
            value: childTypes.length > 0 ? { type: "object" } : this.getXmlValue(current),
            childTypes
        };
    }

    private getXmlValue(typeReference: FernIr.TypeReference): XmlValue {
        switch (typeReference.type) {
            case "primitive":
                return { type: "scalar", kind: this.getScalarKind(typeReference.primitive.v1) };
            case "named": {
                const declaration = this.context.getTypeDeclarationOrThrow(typeReference.typeId);
                if (declaration.shape.type === "enum") {
                    return {
                        type: "enum",
                        enum: this.context.typeMapper.convertToClassReference(declaration.name, {
                            fullyQualified: true
                        })
                    };
                }
                return { type: "scalar", kind: "string" };
            }
            case "container":
                if (typeReference.container.type === "literal") {
                    return { type: "literal", literal: typeReference.container.literal };
                }
                throw new Error(
                    `Property of xml-encoded type ${this.xml.name} has a ${typeReference.container.type} value, which has no XML representation`
                );
            case "unknown":
                return { type: "scalar", kind: "string" };
            default:
                assertNever(typeReference);
        }
    }

    private getScalarKind(primitive: FernIr.PrimitiveTypeV1): ScalarKind {
        switch (primitive) {
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
                return "integer";
            case "FLOAT":
            case "DOUBLE":
                return "float";
            case "BOOLEAN":
                return "boolean";
            case "DATE":
            case "DATE_TIME":
            case "DATE_TIME_RFC_2822":
            case "STRING":
            case "UUID":
            case "BASE_64":
            case "BIG_INTEGER":
                return "string";
            default:
                assertNever(primitive);
        }
    }

    private getXmlChildObjectTypes(
        typeReference: FernIr.TypeReference,
        seen = new Set<FernIr.TypeId>()
    ): FernIr.TypeDeclaration[] {
        if (typeReference.type !== "named" || seen.has(typeReference.typeId)) {
            return [];
        }
        seen.add(typeReference.typeId);
        const declaration = this.context.getTypeDeclarationOrThrow(typeReference.typeId);
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

    private getChildXmlName(declaration: FernIr.TypeDeclaration): string {
        return declaration.encoding?.xml?.name ?? getOriginalName(declaration.name.name);
    }

    private getChildClassReference(declaration: FernIr.TypeDeclaration): ruby.ClassReference {
        return this.context.typeMapper.convertToClassReference(declaration.name, { fullyQualified: true });
    }

    /** A root element is one that no other xml-encoded type lists as a child. */
    private isRootType(): boolean {
        for (const declaration of Object.values(this.context.ir.types)) {
            if (declaration.encoding?.xml == null || declaration.shape.type !== "object") {
                continue;
            }
            const properties = [...(declaration.shape.extendedProperties ?? []), ...declaration.shape.properties];
            for (const property of properties) {
                if (property.xml != null && property.xml.kind !== FernIr.XmlPropertyKind.Element) {
                    continue;
                }
                if (this.collectChildTypeIds(property.valueType, new Set()).has(this.typeDeclaration.name.typeId)) {
                    return false;
                }
            }
        }
        return true;
    }

    private collectChildTypeIds(typeReference: FernIr.TypeReference, seen: Set<FernIr.TypeId>): Set<FernIr.TypeId> {
        if (typeReference.type === "container") {
            const container = typeReference.container;
            switch (container.type) {
                case "optional":
                    return this.collectChildTypeIds(container.optional, seen);
                case "nullable":
                    return this.collectChildTypeIds(container.nullable, seen);
                case "list":
                    return this.collectChildTypeIds(container.list, seen);
                case "set":
                    return this.collectChildTypeIds(container.set, seen);
                case "map":
                case "literal":
                    return seen;
                default:
                    assertNever(container);
            }
        }
        if (typeReference.type !== "named" || seen.has(typeReference.typeId)) {
            return seen;
        }
        seen.add(typeReference.typeId);
        const declaration = this.context.getTypeDeclarationOrThrow(typeReference.typeId);
        if (declaration.shape.type === "alias") {
            return this.collectChildTypeIds(declaration.shape.aliasOf, seen);
        }
        if (declaration.shape.type === "undiscriminatedUnion") {
            for (const member of declaration.shape.members) {
                this.collectChildTypeIds(member.type, seen);
            }
        }
        return seen;
    }

    // ---------------------------------------------------------------------------------------------
    // Mapping declarations
    // ---------------------------------------------------------------------------------------------

    private getMappingStatements(): ruby.AstNode {
        return ruby.codeblock((writer) => {
            writer.write(`xml_element ${this.rubyString(this.xml.name)}`);
            if (this.xml.namespace != null) {
                writer.write(`, namespace: ${this.rubyString(this.xml.namespace)}`);
            }
            if (this.xml.prefix != null) {
                writer.write(`, prefix: ${this.rubyString(this.xml.prefix)}`);
            }
            if (this.isRootType()) {
                writer.write(", root: true");
            }
            writer.newLine();
            for (const property of this.properties) {
                this.writeMapping(writer, property);
                writer.newLine();
            }
        });
    }

    private writeMapping(writer: ruby.Writer, property: XmlProperty): void {
        const options: string[] = [];
        switch (property.kind) {
            case FernIr.XmlPropertyKind.Attribute:
                writer.write(`xml_attribute :${property.fieldName}, ${this.rubyString(property.wireName)}, `);
                this.writeValueType(writer, property);
                if (property.isList) {
                    options.push("list: true");
                    if (property.listSeparator !== DEFAULT_LIST_SEPARATOR) {
                        options.push(`separator: ${this.rubyString(property.listSeparator)}`);
                    }
                }
                break;
            case FernIr.XmlPropertyKind.Text:
                writer.write(`xml_text :${property.fieldName}, `);
                this.writeValueType(writer, property);
                if (property.isList) {
                    options.push("list: true");
                    if (property.listSeparator !== DEFAULT_LIST_SEPARATOR) {
                        options.push(`separator: ${this.rubyString(property.listSeparator)}`);
                    }
                }
                break;
            case FernIr.XmlPropertyKind.Element:
                writer.write(`xml_child :${property.fieldName}, `);
                this.writeValueType(writer, property);
                if (property.value.type !== "object" || property.wrapped) {
                    options.push(`name: ${this.rubyString(property.wireName)}`);
                }
                if (property.isList) {
                    options.push("list: true");
                }
                if (property.wrapped) {
                    options.push("wrapped: true");
                }
                break;
            default:
                assertNever(property.kind);
        }
        if (!property.isOptional) {
            options.push("optional: false");
        }
        if (options.length > 0) {
            writer.write(`, ${options.join(", ")}`);
        }
    }

    private writeValueType(writer: ruby.Writer, property: XmlProperty): void {
        const value = property.value;
        switch (value.type) {
            case "scalar":
                switch (value.kind) {
                    case "string":
                        writer.write("String");
                        return;
                    case "integer":
                        writer.write("Integer");
                        return;
                    case "float":
                        writer.write("Float");
                        return;
                    case "boolean":
                        writer.write("Internal::Types::Boolean");
                        return;
                    default:
                        assertNever(value.kind);
                }
                return;
            case "literal":
                writer.write("Internal::Xml::Literal.new(");
                writer.write(this.rubyLiteral(value.literal));
                writer.write(")");
                return;
            case "enum":
                writer.write("-> { ");
                value.enum.write(writer);
                writer.write(" }");
                return;
            case "object": {
                const references = property.childTypes.map((declaration) => this.getChildClassReference(declaration));
                writer.write("-> { ");
                if (references.length === 1 && references[0] != null) {
                    references[0].write(writer);
                } else {
                    writer.write("[");
                    references.forEach((reference, index) => {
                        if (index > 0) {
                            writer.write(", ");
                        }
                        reference.write(writer);
                    });
                    writer.write("]");
                }
                writer.write(" }");
                return;
            }
            default:
                assertNever(value);
        }
    }

    // ---------------------------------------------------------------------------------------------
    // Child builders
    // ---------------------------------------------------------------------------------------------

    private getChildBuilderMethods(): ruby.AstNode[] {
        const methods: ruby.AstNode[] = [];
        const usedNames = new Set<string>([
            ...this.properties.map((property) => property.fieldName),
            ...RESERVED_METHOD_NAMES
        ]);
        for (const property of this.properties) {
            if (property.kind !== FernIr.XmlPropertyKind.Element || property.value.type !== "object") {
                continue;
            }
            for (const childType of property.childTypes) {
                const xmlName = this.getChildXmlName(childType);
                let methodName = this.context.caseConverter.snakeSafe(xmlName);
                if (usedNames.has(methodName)) {
                    methodName = `add_${this.context.caseConverter.snakeUnsafe(xmlName)}`;
                }
                if (usedNames.has(methodName)) {
                    continue;
                }
                usedNames.add(methodName);
                methods.push(this.getChildBuilderMethod({ property, childType, methodName, xmlName }));
            }
        }
        return methods;
    }

    private getChildBuilderMethod({
        property,
        childType,
        methodName,
        xmlName
    }: {
        property: XmlProperty;
        childType: FernIr.TypeDeclaration;
        methodName: string;
        xmlName: string;
    }): ruby.AstNode {
        const childClass = this.getChildClassReference(childType);
        const textProperty =
            childType.shape.type === "object"
                ? [...(childType.shape.extendedProperties ?? []), ...childType.shape.properties].find(
                      (childProperty) => childProperty.xml?.kind === FernIr.XmlPropertyKind.Text
                  )
                : undefined;
        const textField = textProperty != null ? this.context.caseConverter.snakeSafe(textProperty.name) : undefined;

        return ruby.codeblock((writer) => {
            const docs = [
                `Appends a <${xmlName}> child element and returns it. Pass an existing ${childClass.name} to append it as-is.`,
                "",
                ...(textField != null
                    ? [`@param ${textField} [String, ${childClass.name}, nil] the text content`]
                    : []),
                `@param attributes [Hash] attribute values keyed by field name; unknown keys become extra attributes`,
                `@return [${childClass.name}]`
            ];
            ruby.comment({ docs: docs.join("\n") }).write(writer);
            const params = textField != null ? `${textField} = nil, **attributes` : "**attributes";
            writer.writeLine(`def ${methodName}(${params})`);
            writer.indent();
            if (textField != null) {
                writer.write(`child = ${textField}.is_a?(`);
                childClass.write(writer);
                writer.write(`) ? ${textField} : `);
                childClass.write(writer);
                writer.writeLine(`.new(**attributes, ${textField}: ${textField})`);
            } else {
                writer.write("child = ");
                childClass.write(writer);
                writer.writeLine(".new(**attributes)");
            }
            if (property.isList) {
                writer.writeLine(`self.${property.fieldName} = [*${property.fieldName}, child]`);
            } else {
                writer.writeLine(`self.${property.fieldName} = child`);
            }
            writer.writeLine("child");
            writer.dedent();
            writer.write("end");
        });
    }

    private rubyString(value: string): string {
        return JSON.stringify(value);
    }

    private rubyLiteral(literal: FernIr.Literal): string {
        switch (literal.type) {
            case "string":
                return this.rubyString(literal.string);
            case "boolean":
                return literal.boolean ? "true" : "false";
            default:
                assertNever(literal);
        }
    }
}
