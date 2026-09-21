import { getOriginalName, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { php, SELF } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

type ScalarKind = "string" | "int" | "float" | "bool" | "date" | "dateTime";

type XmlValue =
    | { type: "scalar"; kind: ScalarKind }
    | { type: "literal"; literal: FernIr.Literal }
    | { type: "enum"; enum: php.ClassReference }
    | { type: "object" };

interface XmlProperty {
    name: FernIr.NameAndWireValueOrString;
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
const ELEMENT_VARIABLE = "$element";
const RESERVED_METHOD_NAMES = [
    "__construct",
    "__toString",
    "toJson",
    "jsonSerialize",
    "toXml",
    "toXmlElement",
    "fromXml",
    "fromXmlElement",
    "addChild",
    "getAdditionalAttributes",
    "setAdditionalAttributes",
    "setAdditionalAttribute",
    "getAdditionalChildren",
    "setAdditionalChildren"
];

/**
 * Adds the XML members (toXml/fromXml, fluent child builders, __toString) to an
 * object type that has an xml encoding.
 */
export class XmlObjectGenerator {
    private readonly xml: FernIr.XmlEncoding;
    private readonly properties: XmlProperty[];
    private readonly classReference: php.ClassReference;

    constructor(
        private readonly context: ModelGeneratorContext,
        private readonly typeDeclaration: FernIr.TypeDeclaration,
        private readonly objectDeclaration: FernIr.ObjectTypeDeclaration,
        xml: FernIr.XmlEncoding
    ) {
        this.xml = xml;
        this.classReference = this.context.phpTypeMapper.convertToClassReference(this.typeDeclaration.name);
        this.properties = [
            ...(this.objectDeclaration.extendedProperties ?? []),
            ...this.objectDeclaration.properties
        ].map((property) => this.analyzeProperty(property));
    }

    public addXmlMembers(clazz: php.DataClass): void {
        clazz.addMethod(this.getToXmlElementMethod());
        clazz.addMethod(this.getFromXmlMethod());
        clazz.addMethod(this.getFromXmlElementMethod());
        for (const method of this.getChildBuilderMethods()) {
            clazz.addMethod(method);
        }
        clazz.addMethod(this.getToStringMethod());
    }

    // ---------------------------------------------------------------------------------------------
    // Property analysis
    // ---------------------------------------------------------------------------------------------

    private analyzeProperty(property: FernIr.ObjectProperty): XmlProperty {
        let current = property.valueType;
        let isList = false;
        let isOptional = false;
        for (;;) {
            if (current.type === "container") {
                const container = current.container;
                if (container.type === "optional") {
                    isOptional = isOptional || !isList;
                    current = container.optional;
                    continue;
                }
                if (container.type === "nullable") {
                    isOptional = isOptional || !isList;
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
            name: property.name,
            fieldName: this.context.getPropertyName(property.name),
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
                        enum: this.context.phpTypeMapper.convertToClassReference(declaration.name)
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
                return "int";
            case "FLOAT":
            case "DOUBLE":
                return "float";
            case "BOOLEAN":
                return "bool";
            case "DATE":
                return "date";
            case "DATE_TIME":
            case "DATE_TIME_RFC_2822":
                return "dateTime";
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

    private getChildClassReference(declaration: FernIr.TypeDeclaration): php.ClassReference {
        return this.context.phpTypeMapper.convertToClassReference(declaration.name);
    }

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
                const children = this.collectChildTypeIds(property.valueType, new Set());
                if (children.has(this.typeDeclaration.name.typeId)) {
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
    // Serialization
    // ---------------------------------------------------------------------------------------------

    private getToXmlElementMethod(): php.Method {
        return php.method({
            name: "toXmlElement",
            access: "public",
            parameters: [],
            return_: php.Type.reference(this.context.getXmlElementClassReference()),
            docs: `Renders this ${this.classReference.name} as a generic XML element tree.`,
            body: php.codeblock((writer) => {
                writer.write(`${ELEMENT_VARIABLE} = new `);
                writer.writeNode(this.context.getXmlElementClassReference());
                writer.write(`(${this.phpString(this.xml.name)}`);
                if (this.xml.namespace != null) {
                    writer.write(`, namespace: ${this.phpString(this.xml.namespace)}`);
                }
                if (this.xml.prefix != null) {
                    writer.write(`, prefix: ${this.phpString(this.xml.prefix)}`);
                }
                writer.writeLine(");");
                for (const property of this.properties) {
                    this.writeSerializeProperty(writer, property);
                }
                writer.writeNode(this.context.getXmlUtilsClassReference());
                writer.write(
                    `::addAdditional(${ELEMENT_VARIABLE}, $this->getAdditionalAttributes(), $this->getAdditionalChildren()`
                );
                const wrapperNames = this.getWrapperNames();
                if (wrapperNames.length > 0) {
                    writer.write(`, ${this.phpStringList(wrapperNames)}`);
                }
                writer.writeLine(");");
                writer.writeLine(`return ${ELEMENT_VARIABLE};`);
            })
        });
    }

    private writeSerializeProperty(writer: php.Writer, property: XmlProperty): void {
        const field = `$this->${property.fieldName}`;
        const wire = this.phpString(property.wireName);
        const utils = this.context.getXmlUtilsClassReference();
        const scalarValue = (expression: string): string => this.toXmlStringExpression(property, expression);
        const listValue = (): php.CodeBlock =>
            php.codeblock((w) => {
                w.writeNode(utils);
                w.write(
                    `::${this.isDate(property) ? "joinDateValues" : "joinValues"}(${field}, ${this.phpString(property.listSeparator)})`
                );
            });
        switch (property.kind) {
            case "ATTRIBUTE":
                writer.write(`${ELEMENT_VARIABLE}->setAttribute(${wire}, `);
                if (property.isList) {
                    writer.writeNode(listValue());
                } else if (this.isDate(property)) {
                    writer.writeNode(utils);
                    writer.write(`::toXmlDateString(${field})`);
                } else {
                    writer.write(field);
                }
                writer.writeLine(");");
                return;
            case "TEXT":
                writer.write(`${ELEMENT_VARIABLE}->text = `);
                if (property.isList) {
                    writer.writeNode(listValue());
                } else {
                    writer.write(scalarValue(field));
                }
                writer.writeLine(";");
                return;
            case "ELEMENT":
                this.writeSerializeElement(writer, property);
                return;
            default:
                assertNever(property.kind);
        }
    }

    private writeSerializeElement(writer: php.Writer, property: XmlProperty): void {
        const field = `$this->${property.fieldName}`;
        const wire = this.phpString(property.wireName);
        const utils = this.context.getXmlUtilsClassReference();
        const isObject = property.value.type === "object";
        if (!property.isList) {
            if (isObject) {
                if (property.isOptional) {
                    writer.writeLine(`if (${field} !== null) {`);
                    writer.indent();
                    writer.writeLine(`${ELEMENT_VARIABLE}->addChild(${field});`);
                    writer.dedent();
                    writer.writeLine("}");
                } else {
                    writer.writeLine(`${ELEMENT_VARIABLE}->addChild(${field});`);
                }
                return;
            }
            writer.writeNode(utils);
            writer.writeLine(
                `::addChildValue(${ELEMENT_VARIABLE}, ${wire}, ${this.toXmlStringExpression(property, field)});`
            );
            return;
        }
        let parent = ELEMENT_VARIABLE;
        if (property.wrapped) {
            parent = `$${property.fieldName}Wrapper`;
            writer.writeLine(`if (${field} !== null) {`);
            writer.indent();
            writer.write(`${parent} = `);
            writer.writeNode(utils);
            writer.writeLine(`::addWrapper(${ELEMENT_VARIABLE}, ${wire});`);
            writer.writeLine(`foreach (${field} as $item) {`);
        } else {
            writer.writeLine(`foreach (${field}${property.isOptional ? " ?? []" : ""} as $item) {`);
        }
        writer.indent();
        if (isObject) {
            writer.writeLine(`${parent}->addChild($item);`);
        } else {
            writer.writeNode(utils);
            writer.writeLine(`::addChildValue(${parent}, ${wire}, ${this.toXmlStringExpression(property, "$item")});`);
        }
        writer.dedent();
        writer.writeLine("}");
        if (property.wrapped) {
            writer.dedent();
            writer.writeLine("}");
        }
    }

    private toXmlStringExpression(property: XmlProperty, expression: string): string {
        const utils = this.context.getXmlUtilsClassReference().name;
        return this.isDate(property)
            ? `${utils}::toXmlDateString(${expression})`
            : `${utils}::toXmlString(${expression})`;
    }

    private isDate(property: XmlProperty): boolean {
        return property.value.type === "scalar" && property.value.kind === "date";
    }

    private getWrapperNames(): string[] {
        return this.properties
            .filter((property) => property.kind === "ELEMENT" && property.isList && property.wrapped)
            .map((property) => property.wireName);
    }

    // ---------------------------------------------------------------------------------------------
    // Parsing
    // ---------------------------------------------------------------------------------------------

    private getFromXmlMethod(): php.Method {
        return php.method({
            name: "fromXml",
            access: "public",
            static_: true,
            parameters: [php.parameter({ name: "xml", type: php.Type.string() })],
            return_: SELF,
            throws: [php.classReference({ name: "InvalidArgumentException", namespace: "" })],
            docs: `Parses an XML document whose root element is <${this.xml.name}>.`,
            body: php.codeblock((writer) => {
                writer.write("return self::fromXmlElement(");
                writer.writeNode(this.context.getXmlUtilsClassReference());
                writer.write(`::parseRoot($xml, ${this.phpString(this.xml.name)}`);
                if (this.xml.namespace != null) {
                    writer.write(`, ${this.phpString(this.xml.namespace)}`);
                }
                writer.writeLine("));");
            })
        });
    }

    private getFromXmlElementMethod(): php.Method {
        return php.method({
            name: "fromXmlElement",
            access: "public",
            static_: true,
            parameters: [
                php.parameter({
                    name: "element",
                    type: php.Type.reference(this.context.getXmlElementClassReference())
                })
            ],
            return_: SELF,
            throws: [php.classReference({ name: "InvalidArgumentException", namespace: "" })],
            docs: `Reads a ${this.classReference.name} from an already-parsed <${this.xml.name}> element.`,
            body: php.codeblock((writer) => {
                const utils = this.context.getXmlUtilsClassReference();
                writer.writeNode(utils);
                writer.write(`::requireName(${ELEMENT_VARIABLE}, ${this.phpString(this.xml.name)}`);
                if (this.xml.namespace != null) {
                    writer.write(`, ${this.phpString(this.xml.namespace)}`);
                }
                writer.writeLine(");");
                writer.writeLine("$result = new self([");
                writer.indent();
                for (const property of this.properties) {
                    writer.write(`${this.phpString(property.fieldName)} => `);
                    this.writeParseProperty(writer, property);
                    writer.writeLine(",");
                }
                writer.dedent();
                writer.writeLine("]);");
                writer.write("$result->setAdditionalAttributes(");
                writer.writeNode(utils);
                writer.writeLine(
                    `::additionalAttributes(${ELEMENT_VARIABLE}, ${this.phpStringList(this.getKnownAttributeNames())}));`
                );
                writer.write("$result->setAdditionalChildren(");
                writer.writeNode(utils);
                writer.write(
                    `::additionalChildren(${ELEMENT_VARIABLE}, ${this.phpStringList(this.getKnownChildNames())}`
                );
                const wrappers = this.getWrapperItemNames();
                if (wrappers.size > 0) {
                    writer.write(", [");
                    writer.write(
                        [...wrappers.entries()]
                            .map(([wrapper, items]) => `${this.phpString(wrapper)} => ${this.phpStringList(items)}`)
                            .join(", ")
                    );
                    writer.write("]");
                }
                writer.writeLine("));");
                writer.writeLine("return $result;");
            })
        });
    }

    private writeParseProperty(writer: php.Writer, property: XmlProperty): void {
        const utils = this.context.getXmlUtilsClassReference();
        const wire = this.phpString(property.wireName);
        const parser = this.getScalarParser(property);
        const value = property.value;
        // Enum-typed values go through dedicated helpers so PHPStan keeps the enum's literal
        // union (template inference through a callable generalizes it to string).
        const writeScalar = (rawOptional: string, rawRequired: string): void => {
            if (property.isList) {
                this.writeList(writer, property, () => {
                    writer.writeNode(utils);
                    writer.write(`::parseList(${rawOptional}, ${this.phpString(property.listSeparator)}, `);
                    writer.writeNode(parser);
                    writer.write(")");
                });
                if (!property.isOptional) {
                    writer.write(" ?? []");
                }
                return;
            }
            if (value.type === "enum") {
                writer.writeNode(utils);
                writer.write(`::parseEnum(${property.isOptional ? rawOptional : rawRequired}, `);
                writer.writeNode(value.enum);
                writer.write(`::class)${property.isOptional ? "?" : ""}->value`);
                return;
            }
            if (value.type === "literal") {
                writer.writeNode(utils);
                writer.write(
                    `::${this.getLiteralParserName(value.literal)}(${property.isOptional ? rawOptional : rawRequired}, ${this.getLiteralExpression(value.literal)})`
                );
                return;
            }
            const isPlainString = value.type === "scalar" && value.kind === "string";
            if (property.isOptional) {
                if (isPlainString) {
                    writer.write(rawOptional);
                    return;
                }
                writer.writeNode(utils);
                writer.write(`::mapOptional(${rawOptional}, `);
                writer.writeNode(parser);
                writer.write(")");
                return;
            }
            if (isPlainString) {
                writer.write(rawRequired);
                return;
            }
            writer.writeNode(utils);
            writer.write(`::${this.getScalarParserName(value)}(${rawRequired})`);
        };
        switch (property.kind) {
            case "ATTRIBUTE":
                writeScalar(
                    `${ELEMENT_VARIABLE}->getAttribute(${wire})`,
                    `${utils.name}::requireAttribute(${ELEMENT_VARIABLE}, ${wire})`
                );
                return;
            case "TEXT":
                writeScalar(
                    `${utils.name}::getText(${ELEMENT_VARIABLE})`,
                    `${utils.name}::requireText(${ELEMENT_VARIABLE})`
                );
                return;
            case "ELEMENT":
                if (property.value.type !== "object") {
                    if (property.isList) {
                        this.writeList(writer, property, () => {
                            writer.writeNode(utils);
                            writer.write(`::parseChildValues(${this.getParseParent(property)}, ${wire}, `);
                            writer.writeNode(parser);
                            writer.write(")");
                        });
                        return;
                    }
                    writeScalar(
                        `${utils.name}::getChildText(${ELEMENT_VARIABLE}, ${wire})`,
                        `${utils.name}::requireChildText(${ELEMENT_VARIABLE}, ${wire})`
                    );
                    return;
                }
                writer.writeNode(utils);
                if (property.isList) {
                    writer.write(`::parseChildren(${this.getParseParent(property)}, `);
                } else {
                    writer.write(`::${property.isOptional ? "parseChild" : "requireChild"}(${ELEMENT_VARIABLE}, `);
                }
                writer.writeNode(this.getChildParsers(property.childTypes));
                writer.write(")");
                return;
            default:
                assertNever(property.kind);
        }
    }

    private getParseParent(property: XmlProperty): string {
        if (!property.wrapped) {
            return ELEMENT_VARIABLE;
        }
        const wire = this.phpString(property.wireName);
        return property.isOptional
            ? `${ELEMENT_VARIABLE}->getChild(${wire})`
            : `${this.context.getXmlUtilsClassReference().name}::requireWrapper(${ELEMENT_VARIABLE}, ${wire})`;
    }

    private getChildParsers(childTypes: FernIr.TypeDeclaration[]): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.write("[");
            childTypes.forEach((childType, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                writer.write(`${this.phpString(this.getChildXmlName(childType))} => `);
                writer.writeNode(this.getChildClassReference(childType));
                writer.write("::fromXmlElement(...)");
            });
            writer.write("]");
        });
    }

    /**
     * Writes a list-of-strings expression, wrapping it in `enumValues(...)` for enum items.
     */
    private writeList(writer: php.Writer, property: XmlProperty, writeStringList: () => void): void {
        const value = property.value;
        if (value.type !== "enum") {
            writeStringList();
            return;
        }
        writer.writeNode(this.context.getXmlUtilsClassReference());
        writer.write("::enumValues(");
        writeStringList();
        writer.write(", ");
        writer.writeNode(value.enum);
        writer.write("::class)");
    }

    /**
     * First-class callable parsing one raw string; enum items are validated by `enumValues`.
     */
    private getScalarParser(property: XmlProperty): php.CodeBlock {
        const value = property.value;
        return php.codeblock((writer) => {
            if (value.type === "literal") {
                writer.write("fn (string $raw) => ");
                writer.writeNode(this.context.getXmlUtilsClassReference());
                writer.write(
                    `::${this.getLiteralParserName(value.literal)}($raw, ${this.getLiteralExpression(value.literal)})`
                );
                return;
            }
            writer.writeNode(this.context.getXmlUtilsClassReference());
            writer.write(`::${this.getScalarParserName(value)}(...)`);
        });
    }

    private getLiteralParserName(literal: FernIr.Literal): string {
        return literal.type === "boolean" ? "parseBoolLiteral" : "parseLiteral";
    }

    private getLiteralExpression(literal: FernIr.Literal): string {
        switch (literal.type) {
            case "string":
                return this.phpString(literal.string);
            case "boolean":
                return literal.boolean ? "true" : "false";
            default:
                assertNever(literal);
        }
    }

    private getScalarParserName(value: XmlValue): string {
        if (value.type !== "scalar") {
            return "parseString";
        }
        switch (value.kind) {
            case "string":
                return "parseString";
            case "int":
                return "parseInt";
            case "float":
                return "parseFloat";
            case "bool":
                return "parseBool";
            case "date":
                return "parseDate";
            case "dateTime":
                return "parseDateTime";
            default:
                assertNever(value.kind);
        }
    }

    private getKnownAttributeNames(): string[] {
        return this.properties.filter((property) => property.kind === "ATTRIBUTE").map((property) => property.wireName);
    }

    private getKnownChildNames(): string[] {
        const names = new Set<string>();
        for (const property of this.properties) {
            if (property.kind !== "ELEMENT") {
                continue;
            }
            if (property.isList && property.wrapped) {
                continue;
            }
            if (property.value.type === "object") {
                for (const childType of property.childTypes) {
                    names.add(this.getChildXmlName(childType));
                }
            } else {
                names.add(property.wireName);
            }
        }
        return [...names];
    }

    private getWrapperItemNames(): Map<string, string[]> {
        const wrappers = new Map<string, string[]>();
        for (const property of this.properties) {
            if (property.kind !== "ELEMENT" || !property.isList || !property.wrapped) {
                continue;
            }
            const items =
                property.value.type === "object"
                    ? property.childTypes.map((childType) => this.getChildXmlName(childType))
                    : [property.wireName];
            wrappers.set(property.wireName, [...(wrappers.get(property.wireName) ?? []), ...items]);
        }
        return wrappers;
    }

    // ---------------------------------------------------------------------------------------------
    // Fluent child builders
    // ---------------------------------------------------------------------------------------------

    private getChildBuilderMethods(): php.Method[] {
        const taken = new Set<string>(RESERVED_METHOD_NAMES);
        for (const property of this.properties) {
            taken.add(property.fieldName);
            taken.add(this.context.getPropertyGetterName(property.name));
            taken.add(this.context.getPropertySetterName(property.name));
        }
        const methods: php.Method[] = [];
        const seenChildTypes = new Set<FernIr.TypeId>();
        for (const property of this.properties) {
            if (property.kind !== "ELEMENT" || property.value.type !== "object") {
                continue;
            }
            for (const childType of property.childTypes) {
                if (seenChildTypes.has(childType.name.typeId)) {
                    continue;
                }
                seenChildTypes.add(childType.name.typeId);
                methods.push(this.getChildBuilderMethod(property, childType, taken));
            }
        }
        return methods;
    }

    private pickBuilderName(xmlName: string, taken: Set<string>): string {
        const camel = this.context.case.camelUnsafe(xmlName);
        let name = camel;
        if (taken.has(name)) {
            const prefixed = `add${this.context.case.pascalUnsafe(xmlName)}`;
            name = prefixed;
            for (let suffix = 2; taken.has(name); suffix++) {
                name = `${prefixed}${suffix}`;
            }
        }
        taken.add(name);
        return name;
    }

    private getChildBuilderMethod(
        property: XmlProperty,
        childType: FernIr.TypeDeclaration,
        taken: Set<string>
    ): php.Method {
        const childXmlName = this.getChildXmlName(childType);
        const childClass = this.getChildClassReference(childType);
        const childShape = childType.shape;
        if (childShape.type !== "object") {
            throw new Error(`Expected xml child type ${childType.name.typeId} to be an object`);
        }
        const childProperties = [...(childShape.extendedProperties ?? []), ...childShape.properties];
        const textProperty = childProperties.find((child) => child.xml?.kind === FernIr.XmlPropertyKind.Text);
        const textFieldName = textProperty != null ? this.context.getPropertyName(textProperty.name) : undefined;
        const textIsOptional = textProperty != null && this.isOptionalTypeReference(textProperty.valueType);
        const attributeEntries = childProperties
            .filter((child) => child !== textProperty)
            .map((child) => {
                const type = this.context.phpTypeMapper.convert({ reference: child.valueType });
                return {
                    key: this.context.getPropertyName(child.name),
                    valueType: type,
                    optional: type.isOptional()
                };
            });
        const allAttributesOptional = attributeEntries.every((entry) => entry.optional);
        const attributesType = php.Type.typeDict(attributeEntries, { multiline: true });

        const parameters: php.Parameter[] = [];
        const childParamName = textFieldName ?? "child";
        if (textProperty != null) {
            const textType = php.Type.union([
                php.Type.reference(childClass),
                ...(textIsOptional ? [php.Type.optional(php.Type.string())] : [php.Type.string()])
            ]);
            parameters.push(
                php.parameter({
                    name: childParamName,
                    type: textType,
                    initializer: textIsOptional ? php.codeblock("null") : undefined,
                    docs: `The <${childXmlName}> to add, or its text content.`
                })
            );
            parameters.push(
                php.parameter({
                    name: "attributes",
                    type: allAttributesOptional ? attributesType : php.Type.optional(attributesType),
                    initializer: php.codeblock(allAttributesOptional ? "[]" : "null"),
                    docs: `Properties of the new <${childXmlName}> (ignored when a ${childClass.name} is given).`
                })
            );
        } else {
            parameters.push(
                php.parameter({
                    name: childParamName,
                    type: php.Type.union([php.Type.reference(childClass), attributesType]),
                    initializer: allAttributesOptional ? php.codeblock("[]") : undefined,
                    docs: `The <${childXmlName}> to add, or the properties to construct it with.`
                })
            );
        }

        const field = `$this->${property.fieldName}`;
        return php.method({
            name: this.pickBuilderName(childXmlName, taken),
            access: "public",
            parameters,
            return_: php.Type.reference(childClass),
            docs: `Adds a <${childXmlName}> child element and returns it (for nesting further children).`,
            body: php.codeblock((writer) => {
                const constructorArgs =
                    textProperty != null
                        ? `[...$attributes, ${this.phpString(textFieldName ?? "")} => $${childParamName}]`
                        : `$${childParamName}`;
                if (textProperty != null && !allAttributesOptional) {
                    writer.write(`if ($${childParamName} instanceof `);
                    writer.writeNode(childClass);
                    writer.writeLine(") {");
                    writer.indent();
                    writer.writeLine(`$${childParamName}Element = $${childParamName};`);
                    writer.dedent();
                    writer.writeLine("} else {");
                    writer.indent();
                    writer.writeLine("if ($attributes === null) {");
                    writer.indent();
                    writer.writeLine(
                        `throw new \\InvalidArgumentException(${this.phpString(`Attributes are required to construct a new <${childXmlName}>`)});`
                    );
                    writer.dedent();
                    writer.writeLine("}");
                    writer.write(`$${childParamName}Element = new `);
                    writer.writeNode(childClass);
                    writer.writeLine(`(${constructorArgs});`);
                    writer.dedent();
                    writer.writeLine("}");
                } else {
                    writer.write(`$${childParamName}Element = $${childParamName} instanceof `);
                    writer.writeNode(childClass);
                    writer.write(` ? $${childParamName} : new `);
                    writer.writeNode(childClass);
                    writer.writeLine(`(${constructorArgs});`);
                }
                if (property.isList) {
                    if (property.isOptional) {
                        writer.writeLine(`${field} = [...(${field} ?? []), $${childParamName}Element];`);
                    } else {
                        writer.writeLine(`${field}[] = $${childParamName}Element;`);
                    }
                } else {
                    writer.writeLine(`${field} = $${childParamName}Element;`);
                }
                writer.writeLine(`return $${childParamName}Element;`);
            })
        });
    }

    private isOptionalTypeReference(typeReference: FernIr.TypeReference): boolean {
        return this.context.phpTypeMapper.convert({ reference: typeReference }).isOptional();
    }

    // ---------------------------------------------------------------------------------------------
    // Misc
    // ---------------------------------------------------------------------------------------------

    private getToStringMethod(): php.Method {
        return php.method({
            name: "__toString",
            access: "public",
            parameters: [],
            return_: php.Type.string(),
            body: php.codeblock((writer) => {
                writer.writeLine(`return $this->toXml(${this.isRootType() ? "xmlDeclaration: true" : ""});`);
            })
        });
    }

    private phpString(value: string): string {
        return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
    }

    private phpStringList(values: string[]): string {
        return `[${values.map((value) => this.phpString(value)).join(", ")}]`;
    }
}
