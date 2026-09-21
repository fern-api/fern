import { getOriginalName, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    getPropertyKey,
    getTextOfTsNode,
    getXmlChildObjectTypes,
    getXmlEncoding,
    getXmlPropertyKind,
    getXmlValueShape,
    maybeAddDocsStructure,
    TypeReferenceNode,
    XmlExport
} from "@fern-typescript/commons";
import { BaseContext } from "@fern-typescript/contexts";
import {
    ClassDeclarationStructure,
    InterfaceDeclarationStructure,
    MethodDeclarationStructure,
    OptionalKind,
    ParameterDeclarationStructure,
    PropertyDeclarationStructure,
    PropertySignatureStructure,
    Scope,
    StatementStructures,
    StructureKind,
    ts
} from "ts-morph";

export declare namespace XmlObjectGenerator {
    export interface Init<Context extends BaseContext> {
        typeName: string;
        docs: string | undefined;
        shape: FernIr.ObjectTypeDeclaration;
        xml: FernIr.XmlEncoding;
        isXmlRoot: boolean;
        useBigInt: boolean;
        includeSerdeLayer: boolean;
        noOptionalProperties: boolean;
        getPropertyKey: (property: FernIr.ObjectProperty) => string;
        getTypeForObjectProperty: (context: Context, property: FernIr.ObjectProperty) => TypeReferenceNode;
    }
}

const ADDITIONAL_ATTRIBUTES = "additionalAttributes";
const ADDITIONAL_CHILDREN = "additionalChildren";
const FIELDS_INTERFACE = "Fields";
const BUILDER_CLASS = "Builder";
const RESERVED_BUILDER_METHODS = ["build", "toXml", "toString", "attribute", "addChild", "fromXml"];

interface XmlProperty {
    key: string;
    irProperty: FernIr.ObjectProperty;
    kind: FernIr.XmlPropertyKind;
    /** The attribute or element name on the wire. */
    wireName: string;
    /** Whether list items are nested under a wrapper element named `wireName`. */
    wrapped: boolean;
    isOptional: boolean;
    isNullable: boolean;
    isList: boolean;
    itemType: FernIr.TypeReference;
    /** Type node of the property value (without `undefined`). */
    valueType: ts.TypeNode;
    /** Type node of a single item (element type for lists, otherwise the value type). */
    itemTypeNode: ts.TypeNode;
    /** XML-encoded object types this element property may hold (empty for scalar values). */
    childTypes: FernIr.TypeDeclaration[];
}

type XmlScalarReader = Extract<
    XmlExport,
    "xmlString" | "xmlInteger" | "xmlNumber" | "xmlBoolean" | "xmlBigInt" | "xmlDate"
>;

/**
 * Generates the runtime companion of an xml-encoded object type: a class carrying the
 * declared properties with `toXml()` / `fromXml()`, and a nested fluent `Builder`.
 */
export class XmlObjectGenerator<Context extends BaseContext> {
    private readonly typeName: string;
    private readonly docs: string | undefined;
    private readonly shape: FernIr.ObjectTypeDeclaration;
    private readonly xml: FernIr.XmlEncoding;
    private readonly isXmlRoot: boolean;
    private readonly useBigInt: boolean;
    private readonly includeSerdeLayer: boolean;
    private readonly noOptionalProperties: boolean;
    private readonly getPropertyKey: (property: FernIr.ObjectProperty) => string;
    private readonly getTypeForObjectProperty: (context: Context, property: FernIr.ObjectProperty) => TypeReferenceNode;

    constructor(init: XmlObjectGenerator.Init<Context>) {
        this.typeName = init.typeName;
        this.docs = init.docs;
        this.shape = init.shape;
        this.xml = init.xml;
        this.isXmlRoot = init.isXmlRoot;
        this.useBigInt = init.useBigInt;
        this.includeSerdeLayer = init.includeSerdeLayer;
        this.noOptionalProperties = init.noOptionalProperties;
        this.getPropertyKey = init.getPropertyKey;
        this.getTypeForObjectProperty = init.getTypeForObjectProperty;
    }

    public generateClass(context: Context): ClassDeclarationStructure {
        const properties = this.getXmlProperties(context);
        const classNode: ClassDeclarationStructure = {
            kind: StructureKind.Class,
            name: this.typeName,
            isExported: true,
            implements: [this.xmlType(context, "XmlSerializable")],
            properties: [
                ...properties.map((property) => this.generateClassProperty(property)),
                {
                    kind: StructureKind.Property,
                    name: ADDITIONAL_ATTRIBUTES,
                    type: "Record<string, string>",
                    docs: [{ description: "Attributes not declared in the API definition." }]
                },
                {
                    kind: StructureKind.Property,
                    name: ADDITIONAL_CHILDREN,
                    type: `${this.xmlType(context, "XmlElement")}[]`,
                    docs: [{ description: "Child elements not declared in the API definition." }]
                }
            ],
            ctors: [
                {
                    parameters: [this.fieldsParameter(properties)],
                    statements: [
                        ...properties.map((property) => `this.${property.key} = fields.${property.key};`),
                        `this.${ADDITIONAL_ATTRIBUTES} = fields.${ADDITIONAL_ATTRIBUTES} ?? {};`,
                        `this.${ADDITIONAL_CHILDREN} = fields.${ADDITIONAL_CHILDREN} ?? [];`
                    ]
                }
            ],
            methods: [
                {
                    name: "builder",
                    isStatic: true,
                    parameters: [this.fieldsParameter(properties)],
                    returnType: `${this.typeName}.${BUILDER_CLASS}`,
                    statements: [`return new ${this.typeName}.${BUILDER_CLASS}(fields);`]
                },
                {
                    name: "fromXml",
                    isStatic: true,
                    docs: [{ description: `Parses a \`<${this.xml.name}>\` element.` }],
                    parameters: [{ name: "xml", type: `string | ${this.xmlType(context, "XmlNode")}` }],
                    returnType: this.typeName,
                    statements: this.generateFromXmlStatements(context, properties)
                },
                {
                    name: "toXml",
                    returnType: "string",
                    statements: [`return ${this.generateSerializeExpression(context, properties)};`]
                },
                {
                    name: "toString",
                    returnType: "string",
                    statements: ["return this.toXml();"]
                }
            ]
        };
        maybeAddDocsStructure(classNode, this.docs);
        return classNode;
    }

    public generateModuleStatements(context: Context): StatementStructures[] {
        const properties = this.getXmlProperties(context);
        return [this.generateFieldsInterface(context, properties), this.generateBuilderClass(context, properties)];
    }

    private declaredType(property: XmlProperty): string {
        return getTextOfTsNode(
            property.isOptional && this.noOptionalProperties
                ? ts.factory.createUnionTypeNode([
                      property.valueType,
                      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                  ])
                : property.valueType
        );
    }

    private generateClassProperty(property: XmlProperty): PropertyDeclarationStructure {
        const node: PropertyDeclarationStructure = {
            kind: StructureKind.Property,
            name: getPropertyKey(property.key),
            type: this.declaredType(property),
            hasQuestionToken: property.isOptional && !this.noOptionalProperties
        };
        maybeAddDocsStructure(node, property.irProperty.docs);
        return node;
    }

    private generateFieldsInterface(context: Context, properties: XmlProperty[]): InterfaceDeclarationStructure {
        const fieldProperties: PropertySignatureStructure[] = properties.map((property) => {
            const node: PropertySignatureStructure = {
                kind: StructureKind.PropertySignature,
                name: getPropertyKey(property.key),
                type: this.declaredType(property),
                hasQuestionToken: property.isOptional && !this.noOptionalProperties
            };
            maybeAddDocsStructure(node, property.irProperty.docs);
            return node;
        });
        return {
            kind: StructureKind.Interface,
            name: FIELDS_INTERFACE,
            isExported: true,
            properties: [
                ...fieldProperties,
                {
                    kind: StructureKind.PropertySignature,
                    name: ADDITIONAL_ATTRIBUTES,
                    type: "Record<string, string>",
                    hasQuestionToken: true
                },
                {
                    kind: StructureKind.PropertySignature,
                    name: ADDITIONAL_CHILDREN,
                    type: `${this.xmlType(context, "XmlElement")}[]`,
                    hasQuestionToken: true
                }
            ]
        };
    }

    private generateBuilderClass(context: Context, properties: XmlProperty[]): ClassDeclarationStructure {
        const elementProperties = properties.filter((property) => property.childTypes.length > 0);
        const elementKeys = new Set(elementProperties.map((property) => property.key));
        const fieldsType = `${this.typeName}.${FIELDS_INTERFACE}`;
        const builderType = `${this.typeName}.${BUILDER_CLASS}`;

        const elementsShape = `{ ${elementProperties
            .map((property) => `${getPropertyKey(property.key)}?: ${this.builderValueType(context, property)}`)
            .join("; ")} }`;

        const constructorStatements: string[] = [];
        if (elementProperties.length > 0) {
            constructorStatements.push(
                `const { ${elementProperties.map((property) => getPropertyKey(property.key)).join(", ")}, ...rest } = fields;`,
                "this.fields = rest;",
                `this.elements = { ${elementProperties
                    .map((property) => {
                        const key = getPropertyKey(property.key);
                        return isSetTypeNode(property.valueType)
                            ? `${key}: ${key} == null ? ${key} : Array.from(${key})`
                            : key;
                    })
                    .join(", ")} };`
            );
        } else {
            constructorStatements.push("this.fields = { ...fields };");
        }

        const methods: OptionalKind<MethodDeclarationStructure>[] = [
            {
                name: "fromXml",
                isStatic: true,
                docs: [{ description: `Parses a \`<${this.xml.name}>\` element into a builder.` }],
                parameters: [{ name: "xml", type: `string | ${this.xmlType(context, "XmlNode")}` }],
                returnType: builderType,
                statements: [`return new ${builderType}(${this.typeName}.fromXml(xml));`]
            }
        ];

        const takenNames = new Set<string>(RESERVED_BUILDER_METHODS);
        for (const property of properties) {
            const key = getPropertyKey(property.key);
            const target = elementKeys.has(property.key) ? "elements" : "fields";
            const setterName = takenNames.has(property.key) ? `set${context.case.pascalSafe(property.key)}` : key;
            takenNames.add(property.key);
            takenNames.add(setterName);
            methods.push({
                name: setterName,
                parameters: [
                    {
                        name: property.key,
                        type: `${elementKeys.has(property.key) ? this.builderValueType(context, property) : getTextOfTsNode(property.valueType)}${property.isOptional ? " | undefined" : ""}`
                    }
                ],
                returnType: "this",
                statements: [`this.${target}.${key} = ${property.key};`, "return this;"]
            });
        }

        for (const property of elementProperties) {
            for (const childType of property.childTypes) {
                methods.push(this.generateChildBuilderMethod(context, property, childType, takenNames));
            }
        }

        const requiredKeys = properties.filter((property) => !property.isOptional && !elementKeys.has(property.key));
        const buildStatements: string[] = [];
        if (requiredKeys.length > 0) {
            buildStatements.push(
                `const { ${requiredKeys.map((property) => getPropertyKey(property.key)).join(", ")} } = this.fields;`
            );
            for (const property of requiredKeys) {
                buildStatements.push(
                    `if (${getPropertyKey(property.key)} === undefined) { throw new Error("${this.typeName}.${property.key} is required"); }`
                );
            }
        }
        const builtElements = elementProperties.map((property) => {
            const key = getPropertyKey(property.key);
            const built = `${this.xmlRef(context, "xmlBuildAll")}(this.elements.${key})`;
            const value = property.isList
                ? isSetTypeNode(property.valueType)
                    ? `${this.xmlRef(context, "xmlToSet")}(${built})`
                    : built
                : `this.elements.${key} == null ? this.elements.${key} : ${this.xmlRef(context, "xmlBuild")}(this.elements.${key})`;
            return `${key}: ${this.requireValue(context, property, value, `"${this.typeName}.${property.key}"`)}`;
        });
        buildStatements.push(
            `return new ${this.typeName}({ ...this.fields, ${[
                ...requiredKeys.map((property) => getPropertyKey(property.key)),
                ...builtElements
            ].join(", ")} });`
        );

        methods.push(
            {
                name: "attribute",
                docs: [{ description: "Sets an attribute that is not declared in the API definition." }],
                parameters: [
                    { name: "name", type: "string" },
                    { name: "value", type: "string" }
                ],
                returnType: "this",
                statements: [
                    `this.fields.${ADDITIONAL_ATTRIBUTES} = { ...this.fields.${ADDITIONAL_ATTRIBUTES}, [name]: value };`,
                    "return this;"
                ]
            },
            {
                name: "addChild",
                docs: [{ description: "Appends a child element that is not declared in the API definition." }],
                parameters: [{ name: "child", type: this.xmlType(context, "XmlElement") }],
                returnType: "this",
                statements: [
                    `this.fields.${ADDITIONAL_CHILDREN} = [...(this.fields.${ADDITIONAL_CHILDREN} ?? []), child];`,
                    "return this;"
                ]
            },
            { name: "build", returnType: this.typeName, statements: buildStatements },
            { name: "toXml", returnType: "string", statements: ["return this.build().toXml();"] },
            { name: "toString", returnType: "string", statements: ["return this.toXml();"] }
        );

        const classProperties: PropertyDeclarationStructure[] = [
            {
                kind: StructureKind.Property,
                name: "fields",
                scope: Scope.Private,
                isReadonly: true,
                type: `Partial<${fieldsType}>`
            }
        ];
        if (elementProperties.length > 0) {
            classProperties.push({
                kind: StructureKind.Property,
                name: "elements",
                scope: Scope.Private,
                isReadonly: true,
                type: elementsShape
            });
        }

        return {
            kind: StructureKind.Class,
            name: BUILDER_CLASS,
            isExported: true,
            implements: [`${this.xmlType(context, "XmlBuilder")}<${this.typeName}>`],
            properties: classProperties,
            ctors: [
                {
                    parameters: [{ name: "fields", type: `Partial<${fieldsType}>`, initializer: "{}" }],
                    statements: constructorStatements
                }
            ],
            methods
        };
    }

    private generateChildBuilderMethod(
        context: Context,
        property: XmlProperty,
        childType: FernIr.TypeDeclaration,
        takenNames: Set<string>
    ): OptionalKind<MethodDeclarationStructure> {
        const childXml = getXmlEncoding(childType);
        if (childXml == null) {
            throw new Error(`Type ${childType.name.typeId} is not xml-encoded`);
        }
        const { safeName, unsafeName } = context.case.camel(childXml.name);
        let name = unsafeName;
        if (safeName !== unsafeName || takenNames.has(name)) {
            const prefixed = `add${context.case.pascalSafe(childXml.name)}`;
            name = prefixed;
            for (let suffix = 2; takenNames.has(name); suffix++) {
                name = `${prefixed}${suffix}`;
            }
        }
        takenNames.add(name);

        const childRef = getTextOfTsNode(context.type.getReferenceToNamedType(childType.name).getExpression());
        const key = getPropertyKey(property.key);
        const append = property.isList
            ? `this.elements.${key} = [...(this.elements.${key} ?? []), builder];`
            : `this.elements.${key} = builder;`;
        return {
            name,
            docs: [
                {
                    description: `Adds a \`<${childXml.name}>\` child${property.isList ? "" : " (replacing any existing one)"} and returns its builder.`
                }
            ],
            parameters: [{ name: "fields", type: `Partial<${childRef}.${FIELDS_INTERFACE}>`, hasQuestionToken: true }],
            returnType: `${childRef}.${BUILDER_CLASS}`,
            statements: [`const builder = new ${childRef}.${BUILDER_CLASS}(fields);`, append, "return builder;"]
        };
    }

    private builderValueType(context: Context, property: XmlProperty): string {
        const item = getTextOfTsNode(property.itemTypeNode);
        const itemOrBuilder = `${item} | ${this.xmlType(context, "XmlBuilder")}<${item}>`;
        const value = property.isList ? `(${itemOrBuilder})[]` : itemOrBuilder;
        return property.isNullable ? `${value} | null` : value;
    }

    private fieldsParameter(properties: XmlProperty[]): OptionalKind<ParameterDeclarationStructure> {
        const hasRequired = properties.some((property) => !property.isOptional);
        return {
            name: "fields",
            type: `${this.typeName}.${FIELDS_INTERFACE}`,
            initializer: hasRequired ? undefined : "{}"
        };
    }

    private generateFromXmlStatements(context: Context, properties: XmlProperty[]): string[] {
        const attributeNames = properties
            .filter((property) => property.kind === "ATTRIBUTE")
            .map((property) => JSON.stringify(property.wireName));
        const childNames = properties
            .filter((property) => property.kind === "ELEMENT")
            .flatMap((property) => this.getElementNames(property).map((name) => JSON.stringify(name)));
        const wrappers = properties
            .filter((property) => property.kind === "ELEMENT" && property.wrapped && property.childTypes.length > 0)
            .map(
                (property) =>
                    `${JSON.stringify(property.wireName)}: [${property.childTypes
                        .map((childType) => JSON.stringify(this.getChildElementName(childType)))
                        .join(", ")}]`
            );
        const assignments = properties.map(
            (property) => `${getPropertyKey(property.key)}: ${this.generateReadExpression(context, property)}`
        );
        return [
            `const node = ${this.xmlRef(context, "parseXml")}(xml, ${JSON.stringify(this.xml.name)});`,
            `return new ${this.typeName}({`,
            ...assignments.map((assignment) => `    ${assignment},`),
            `    ${ADDITIONAL_ATTRIBUTES}: ${this.xmlRef(context, "xmlExtraAttributes")}(node, [${attributeNames.join(", ")}]),`,
            `    ${ADDITIONAL_CHILDREN}: ${this.xmlRef(context, "xmlUnknownChildren")}(node, [${childNames.join(", ")}]${
                wrappers.length > 0 ? `, { ${wrappers.join(", ")} }` : ""
            }),`,
            "});"
        ];
    }

    /** The element names (wrapper or child tags) an element property reads from the parent. */
    private getElementNames(property: XmlProperty): string[] {
        if (property.wrapped || property.childTypes.length === 0) {
            return [property.wireName];
        }
        return property.childTypes.map((childType) => this.getChildElementName(childType));
    }

    private getChildElementName(childType: FernIr.TypeDeclaration): string {
        return getXmlEncoding(childType)?.name ?? getOriginalName(childType.name.name);
    }

    private generateReadExpression(context: Context, property: XmlProperty): string {
        const location = JSON.stringify(`${this.xml.name}.${property.wireName}`);
        const expression = this.generateValueReadExpression(context, property, location);
        return this.requireValue(context, property, expression, location);
    }

    /**
     * Required values throw when absent; required-but-nullable values read as `null` when absent
     * since XML has no other null representation.
     */
    private requireValue(context: Context, property: XmlProperty, expression: string, location: string): string {
        if (property.isOptional) {
            return expression;
        }
        if (property.isNullable) {
            return `(${expression}) ?? null`;
        }
        return `${this.xmlRef(context, "xmlRequired")}(${expression}, ${location})`;
    }

    private generateValueReadExpression(context: Context, property: XmlProperty, location: string): string {
        const separator = property.irProperty.xml?.listSeparator;
        switch (property.kind) {
            case "ATTRIBUTE":
            case "TEXT": {
                const raw =
                    property.kind === "ATTRIBUTE"
                        ? `${this.xmlRef(context, "xmlAttribute")}(node, ${JSON.stringify(property.wireName)})`
                        : `${this.xmlRef(context, "xmlText")}(node)`;
                const parser = this.getScalarParser(context, property.itemType);
                if (!property.isList) {
                    return `${this.xmlRef(context, "xmlScalar")}(${raw}, ${parser}, ${location})`;
                }
                const list = `${this.xmlRef(context, "xmlScalarList")}(${raw}, ${JSON.stringify(separator)}, ${parser}, ${location})`;
                return isSetTypeNode(property.valueType) ? `${this.xmlRef(context, "xmlToSet")}(${list})` : list;
            }
            case "ELEMENT": {
                const itemType = getTextOfTsNode(property.itemTypeNode);
                const parsers =
                    property.childTypes.length === 0
                        ? `{ ${JSON.stringify(property.wireName)}: ${this.xmlRef(context, "xmlScalarChild")}(${this.getScalarParser(context, property.itemType)}, ${location}) }`
                        : `{ ${property.childTypes
                              .map((childType) => {
                                  const ref = getTextOfTsNode(
                                      context.type.getReferenceToNamedType(childType.name).getExpression()
                                  );
                                  return `${JSON.stringify(this.getChildElementName(childType))}: (child) => ${ref}.fromXml(child)`;
                              })
                              .join(", ")} }`;
                if (property.isList) {
                    const wrapper = property.wrapped ? `, { wrapper: ${JSON.stringify(property.wireName)} }` : "";
                    const list = `${this.xmlRef(context, "xmlChildren")}<${itemType}>(node, ${parsers}${wrapper})`;
                    return isSetTypeNode(property.valueType) ? `${this.xmlRef(context, "xmlToSet")}(${list})` : list;
                }
                return `${this.xmlRef(context, "xmlChild")}<${itemType}>(node, ${parsers})`;
            }
            default:
                assertNever(property.kind);
        }
    }

    private getScalarParser(context: Context, itemType: FernIr.TypeReference): string {
        switch (itemType.type) {
            case "primitive":
                return this.xmlRef(context, this.getPrimitiveReader(itemType.primitive.v1));
            case "named": {
                const declaration = context.type.getTypeDeclaration(itemType);
                switch (declaration.shape.type) {
                    case "enum":
                        return `${this.xmlRef(context, "xmlEnum")}([${declaration.shape.values
                            .map((value) => JSON.stringify(getWireValue(value.name)))
                            .join(", ")}])`;
                    case "alias":
                        return this.getScalarParser(context, declaration.shape.aliasOf);
                    case "object":
                    case "union":
                    case "undiscriminatedUnion":
                        throw new Error(
                            `Cannot read ${getOriginalName(declaration.name.name)} from xml text in ${this.typeName}`
                        );
                    default:
                        assertNever(declaration.shape);
                }
                break;
            }
            case "container":
            case "unknown":
                throw new Error(`Unsupported xml scalar type ${itemType.type} in ${this.typeName}`);
            default:
                assertNever(itemType);
        }
    }

    private getPrimitiveReader(primitive: FernIr.PrimitiveTypeV1): XmlScalarReader {
        switch (primitive) {
            case "BOOLEAN":
                return "xmlBoolean";
            case "INTEGER":
            case "UINT":
            case "UINT_64":
                return "xmlInteger";
            case "DOUBLE":
            case "FLOAT":
                return "xmlNumber";
            case "LONG":
                return this.useBigInt && this.includeSerdeLayer ? "xmlBigInt" : "xmlInteger";
            case "BIG_INTEGER":
                if (this.useBigInt) {
                    return this.includeSerdeLayer ? "xmlBigInt" : "xmlInteger";
                }
                return "xmlString";
            case "DATE_TIME":
            case "DATE_TIME_RFC_2822":
                return this.includeSerdeLayer ? "xmlDate" : "xmlString";
            case "STRING":
            case "UUID":
            case "DATE":
            case "BASE_64":
                return "xmlString";
            default:
                assertNever(primitive);
        }
    }

    private generateSerializeExpression(context: Context, properties: XmlProperty[]): string {
        const attributes = properties
            .filter((property) => property.kind === "ATTRIBUTE")
            .map((property) => {
                const separator = property.irProperty.xml?.listSeparator;
                return `{ name: ${JSON.stringify(property.wireName)}, value: this.${getPropertyKey(property.key)}${
                    separator != null ? `, separator: ${JSON.stringify(separator)}` : ""
                } }`;
            });
        const text = properties.find((property) => property.kind === "TEXT");
        const children = properties
            .filter((property) => property.kind === "ELEMENT")
            .map(
                (property) =>
                    `{ name: ${JSON.stringify(property.wireName)}, value: this.${getPropertyKey(property.key)}${
                        property.wrapped ? ", wrapped: true" : ""
                    } }`
            );
        const args: string[] = [`name: ${JSON.stringify(this.xml.name)}`];
        if (this.xml.namespace != null) {
            args.push(`namespace: ${JSON.stringify(this.xml.namespace)}`);
        }
        if (this.xml.prefix != null) {
            args.push(`prefix: ${JSON.stringify(this.xml.prefix)}`);
        }
        args.push(
            `attributes: [${[...attributes, `...${this.xmlRef(context, "extraXmlAttributes")}(this.${ADDITIONAL_ATTRIBUTES})`].join(", ")}]`
        );
        if (text != null) {
            args.push(`text: this.${getPropertyKey(text.key)}`);
            const separator = text.irProperty.xml?.listSeparator;
            if (separator != null) {
                args.push(`textSeparator: ${JSON.stringify(separator)}`);
            }
        }
        args.push(`children: [${children.join(", ")}]`);
        args.push(`${ADDITIONAL_CHILDREN}: this.${ADDITIONAL_CHILDREN}`);
        if (this.isXmlRoot) {
            args.push("xmlDeclaration: true");
        }
        return `${this.xmlRef(context, "serializeXmlElement")}({ ${args.join(", ")} })`;
    }

    private getXmlProperties(context: Context): XmlProperty[] {
        const getTypeDeclaration = (name: FernIr.DeclaredTypeName) => context.type.getTypeDeclaration(name);
        return [...this.shape.properties, ...(this.shape.extendedProperties ?? [])].map((irProperty) => {
            const typeNode = this.getTypeForObjectProperty(context, irProperty);
            const valueShape = getXmlValueShape(irProperty.valueType, getTypeDeclaration);
            const kind = getXmlPropertyKind(irProperty);
            const childTypes =
                kind === "ELEMENT" ? getXmlChildObjectTypes(irProperty.valueType, getTypeDeclaration) : [];
            return {
                key: this.getPropertyKey(irProperty),
                irProperty,
                kind,
                wireName: irProperty.xml?.name ?? getWireValue(irProperty.name),
                wrapped: irProperty.xml?.wrapped ?? false,
                isOptional: valueShape.isOptional,
                isNullable: valueShape.isNullable,
                isList: valueShape.isList,
                itemType: valueShape.itemType,
                valueType: typeNode.typeNodeWithoutUndefined,
                itemTypeNode: unwrapItemTypeNode(typeNode.typeNodeWithoutUndefined),
                childTypes
            };
        });
    }

    private xmlRef(context: Context, name: XmlExport): string {
        return getTextOfTsNode(context.coreUtilities.xml.getReferenceToExport(name).getExpression());
    }

    private xmlType(context: Context, name: XmlExport): string {
        return getTextOfTsNode(context.coreUtilities.xml.getReferenceToExport(name).getTypeNode());
    }
}

/** Strips `T[]`, `Array<T>`, `Set<T>` and `| undefined | null` wrappers to get the element type node. */
function isSetTypeNode(node: ts.TypeNode): boolean {
    return ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName) && node.typeName.text === "Set";
}

function unwrapItemTypeNode(node: ts.TypeNode): ts.TypeNode {
    if (ts.isArrayTypeNode(node)) {
        return unwrapItemTypeNode(node.elementType);
    }
    if (ts.isParenthesizedTypeNode(node)) {
        return unwrapItemTypeNode(node.type);
    }
    if (ts.isUnionTypeNode(node)) {
        const members = node.types.filter(
            (member) =>
                !(
                    member.kind === ts.SyntaxKind.UndefinedKeyword ||
                    (ts.isLiteralTypeNode(member) && member.literal.kind === ts.SyntaxKind.NullKeyword)
                )
        );
        if (members.length === 1 && members[0] != null) {
            return unwrapItemTypeNode(members[0]);
        }
        return node;
    }
    if (
        ts.isTypeReferenceNode(node) &&
        ts.isIdentifier(node.typeName) &&
        (node.typeName.text === "Array" || node.typeName.text === "Set") &&
        node.typeArguments?.length === 1 &&
        node.typeArguments[0] != null
    ) {
        return unwrapItemTypeNode(node.typeArguments[0]);
    }
    return node;
}
