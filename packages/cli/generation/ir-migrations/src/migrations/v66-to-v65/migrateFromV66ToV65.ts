import { constructFullCasingsGenerator, type FullCasingsGenerator } from "@fern-api/casings-generator";
import { generatorsYml } from "@fern-api/configuration";
import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import { IrMigrationContext } from "../../IrMigrationContext.js";
import { IrSerialization } from "../../ir-serialization/index.js";
import { IrVersions } from "../../ir-versions/index.js";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration.js";

export const V66_TO_V65_MIGRATION: IrMigration<
    IrVersions.V66.ir.IntermediateRepresentation,
    IrVersions.V65.ir.IntermediateRepresentation
> = {
    laterVersion: "v66",
    earlierVersion: "v65",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "3.61.0-rc.0",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "3.61.0-rc.0",
        [GeneratorName.TYPESCRIPT]: "3.61.0-rc.0",
        [GeneratorName.TYPESCRIPT_SDK]: "3.61.0-rc.0",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.20.0-rc.0",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: "0.9.0-rc.0",
        [GeneratorName.CSHARP_SDK]: "2.57.0-rc.0",
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: "0.1.0-rc.0",
        [GeneratorName.PHP_SDK]: "2.3.2-rc.0",
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V65.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        }),
    migrateBackwards: (
        v66: IrVersions.V66.ir.IntermediateRepresentation,
        _context: IrMigrationContext
    ): IrVersions.V65.ir.IntermediateRepresentation => {
        const casingsGenerator = constructFullCasingsGenerator({
            generationLanguage: sdkLanguageToGenerationLanguage(v66.casingsConfig?.generationLanguage),
            keywords: v66.casingsConfig?.keywords,
            smartCasing: v66.casingsConfig?.smartCasing ?? true
        });
        return inflateIr(v66, casingsGenerator);
    }
};

// SupportedSdkLanguage is a superset of GenerationLanguage (adds "curl" and "javascript").
// We only ever store a GenerationLanguage value in casingsConfig, so this mapping is exhaustive
// for all values that can actually appear there.
function sdkLanguageToGenerationLanguage(
    language: IrVersions.V66.SupportedSdkLanguage | undefined
): generatorsYml.GenerationLanguage | undefined {
    if (language == null) {
        return undefined;
    }
    switch (language) {
        case "typescript":
        case "java":
        case "python":
        case "go":
        case "ruby":
        case "csharp":
        case "swift":
        case "php":
        case "rust":
            return language;
        case "curl":
        case "javascript":
            return undefined;
        default:
            return assertNever(language);
    }
}

function inflateIr(
    ir: IrVersions.V66.ir.IntermediateRepresentation,
    casingsGenerator: FullCasingsGenerator
): IrVersions.V65.ir.IntermediateRepresentation {
    // ===== Core inflate helpers =====

    const inflateName = (name: IrVersions.V66.NameOrString): IrVersions.V65.Name => {
        return casingsGenerator.generateName(name);
    };

    const inflateOptionalName = (name: IrVersions.V66.NameOrString | undefined): IrVersions.V65.Name | undefined => {
        return name != null ? inflateName(name) : undefined;
    };

    const inflateNameAndWireValue = (
        nameAndWireValue: IrVersions.V66.NameAndWireValueOrString
    ): IrVersions.V65.NameAndWireValue => {
        return casingsGenerator.generateNameAndWireValue(nameAndWireValue);
    };

    // ===== TypeReference / ContainerType / Literal inflate =====
    // These are discriminated unions with _visit methods that differ between V66 and V65.
    // We must reconstruct them using V65 factory methods.

    const inflateTypeReference = (tr: IrVersions.V66.TypeReference): IrVersions.V65.TypeReference => {
        switch (tr.type) {
            case "container":
                return IrVersions.V65.TypeReference.container(inflateContainerType(tr.container));
            case "named":
                return IrVersions.V65.TypeReference.named({
                    typeId: tr.typeId,
                    fernFilepath: inflateFernFilepath(tr.fernFilepath),
                    name: inflateName(tr.name),
                    displayName: tr.displayName,
                    default: tr.default != null ? inflateNamedTypeDefault(tr.default) : undefined,
                    inline: tr.inline
                });
            case "primitive":
                return IrVersions.V65.TypeReference.primitive(tr.primitive);
            case "unknown":
                return IrVersions.V65.TypeReference.unknown();
            default:
                assertNever(tr);
        }
    };

    const inflateContainerType = (ct: IrVersions.V66.ContainerType): IrVersions.V65.ContainerType => {
        switch (ct.type) {
            case "list":
                return IrVersions.V65.ContainerType.list(inflateTypeReference(ct.list));
            case "map":
                return IrVersions.V65.ContainerType.map({
                    keyType: inflateTypeReference(ct.keyType),
                    valueType: inflateTypeReference(ct.valueType)
                });
            case "nullable":
                return IrVersions.V65.ContainerType.nullable(inflateTypeReference(ct.nullable));
            case "optional":
                return IrVersions.V65.ContainerType.optional(inflateTypeReference(ct.optional));
            case "set":
                return IrVersions.V65.ContainerType.set(inflateTypeReference(ct.set));
            case "literal":
                return IrVersions.V65.ContainerType.literal(inflateLiteral(ct.literal));
            default:
                assertNever(ct);
        }
    };

    const inflateLiteral = (lit: IrVersions.V66.Literal): IrVersions.V65.Literal => {
        switch (lit.type) {
            case "string":
                return IrVersions.V65.Literal.string(lit.string);
            case "boolean":
                return IrVersions.V65.Literal.boolean(lit.boolean);
            default:
                assertNever(lit);
        }
    };

    const inflateNamedTypeDefault = (def: IrVersions.V66.NamedTypeDefault): IrVersions.V65.NamedTypeDefault => {
        switch (def.type) {
            case "enum":
                return IrVersions.V65.NamedTypeDefault.enum({
                    name: inflateNameAndWireValue(def.name),
                    docs: def.docs,
                    availability: def.availability
                });
            default:
                assertNever(def.type);
        }
    };

    // ===== V2 Examples helpers =====

    const inflateV2SchemaExamples = (v2: IrVersions.V66.V2SchemaExamples): IrVersions.V65.V2SchemaExamples => ({
        userSpecifiedExamples: v2.userSpecifiedExamples,
        autogeneratedExamples: v2.autogeneratedExamples
    });

    // ===== Structural inflate helpers =====

    const inflateFernFilepath = (fp: IrVersions.V66.FernFilepath): IrVersions.V65.FernFilepath => ({
        allParts: fp.allParts.map(inflateName),
        packagePath: fp.packagePath.map(inflateName),
        file: fp.file != null ? inflateName(fp.file) : undefined
    });

    const inflateDeclaredTypeName = (dtn: IrVersions.V66.DeclaredTypeName): IrVersions.V65.DeclaredTypeName => ({
        typeId: dtn.typeId,
        fernFilepath: inflateFernFilepath(dtn.fernFilepath),
        name: inflateName(dtn.name),
        displayName: dtn.displayName
    });

    const inflateObjectProperty = (prop: IrVersions.V66.ObjectProperty): IrVersions.V65.ObjectProperty => ({
        docs: prop.docs,
        availability: prop.availability,
        name: inflateNameAndWireValue(prop.name),
        valueType: inflateTypeReference(prop.valueType),
        v2Examples: prop.v2Examples != null ? inflateV2SchemaExamples(prop.v2Examples) : undefined,
        propertyAccess: prop.propertyAccess
    });

    const inflatePropertyPathItem = (item: IrVersions.V66.PropertyPathItem): IrVersions.V65.PropertyPathItem => ({
        name: inflateName(item.name),
        type: inflateTypeReference(item.type)
    });

    // ===== Type declaration inflate =====

    const inflateProtobufType = (pt: IrVersions.V66.ProtobufType): IrVersions.V65.ProtobufType => {
        switch (pt.type) {
            case "wellKnown":
                return IrVersions.V65.ProtobufType.wellKnown(pt.value);
            case "userDefined":
                return IrVersions.V65.ProtobufType.userDefined({
                    file: pt.file,
                    name: inflateName(pt.name)
                });
            default:
                assertNever(pt);
        }
    };

    const inflateSource = (source: IrVersions.V66.Source): IrVersions.V65.Source => {
        switch (source.type) {
            case "proto":
                return IrVersions.V65.Source.proto(inflateProtobufType(source.value));
            default:
                assertNever(source.type);
        }
    };

    const inflateTypeDeclaration = (td: IrVersions.V66.TypeDeclaration): IrVersions.V65.TypeDeclaration => ({
        docs: td.docs,
        availability: td.availability,
        name: inflateDeclaredTypeName(td.name),
        shape: inflateTypeShape(td.shape),
        autogeneratedExamples: td.autogeneratedExamples.map(inflateExampleType),
        userProvidedExamples: td.userProvidedExamples.map(inflateExampleType),
        v2Examples: td.v2Examples != null ? inflateV2SchemaExamples(td.v2Examples) : undefined,
        referencedTypes: td.referencedTypes,
        encoding: td.encoding,
        source: td.source != null ? inflateSource(td.source) : undefined,
        inline: td.inline
    });

    const inflateTypeShape = (shape: IrVersions.V66.Type): IrVersions.V65.Type => {
        switch (shape.type) {
            case "object":
                return IrVersions.V65.Type.object({
                    properties: shape.properties.map(inflateObjectProperty),
                    extendedProperties:
                        shape.extendedProperties != null
                            ? shape.extendedProperties.map(inflateObjectProperty)
                            : undefined,
                    extends: shape.extends.map(inflateDeclaredTypeName),
                    extraProperties: shape.extraProperties
                });
            case "union":
                return IrVersions.V65.Type.union({
                    discriminant: inflateNameAndWireValue(shape.discriminant),
                    extends: shape.extends.map(inflateDeclaredTypeName),
                    baseProperties: shape.baseProperties.map(inflateObjectProperty),
                    types: shape.types.map(inflateSingleUnionType),
                    discriminatorContext: shape.discriminatorContext
                });
            case "enum":
                return IrVersions.V65.Type.enum({
                    default: shape.default != null ? inflateEnumValue(shape.default) : undefined,
                    values: shape.values.map(inflateEnumValue),
                    forwardCompatible: shape.forwardCompatible
                });
            case "alias":
                return IrVersions.V65.Type.alias({
                    aliasOf: inflateTypeReference(shape.aliasOf),
                    resolvedType: inflateResolvedTypeReference(shape.resolvedType)
                });
            case "undiscriminatedUnion":
                return IrVersions.V65.Type.undiscriminatedUnion({
                    members: shape.members.map(inflateUndiscriminatedUnionMember)
                });
            default:
                assertNever(shape);
        }
    };

    const inflateResolvedTypeReference = (
        rt: IrVersions.V66.ResolvedTypeReference
    ): IrVersions.V65.ResolvedTypeReference => {
        switch (rt.type) {
            case "container":
                return IrVersions.V65.ResolvedTypeReference.container(inflateContainerType(rt.container));
            case "named":
                return IrVersions.V65.ResolvedTypeReference.named({
                    name: inflateDeclaredTypeName(rt.name),
                    shape: inflateShapeType(rt.shape)
                });
            case "primitive":
                return IrVersions.V65.ResolvedTypeReference.primitive(rt.primitive);
            case "unknown":
                return IrVersions.V65.ResolvedTypeReference.unknown();
            default:
                assertNever(rt);
        }
    };

    const inflateShapeType = (shape: IrVersions.V66.ShapeType): IrVersions.V65.ShapeType => {
        switch (shape) {
            case "ENUM":
                return IrVersions.V65.ShapeType.Enum;
            case "OBJECT":
                return IrVersions.V65.ShapeType.Object;
            case "UNION":
                return IrVersions.V65.ShapeType.Union;
            case "UNDISCRIMINATED_UNION":
                return IrVersions.V65.ShapeType.UndiscriminatedUnion;
            default:
                assertNever(shape);
        }
    };

    const inflateUndiscriminatedUnionMember = (
        member: IrVersions.V66.UndiscriminatedUnionMember
    ): IrVersions.V65.UndiscriminatedUnionMember => ({
        docs: member.docs,
        type: inflateTypeReference(member.type)
    });

    const inflateEnumValue = (ev: IrVersions.V66.EnumValue): IrVersions.V65.EnumValue => ({
        docs: ev.docs,
        availability: ev.availability,
        name: inflateNameAndWireValue(ev.name)
    });

    const inflateSingleUnionType = (ut: IrVersions.V66.SingleUnionType): IrVersions.V65.SingleUnionType => ({
        docs: ut.docs,
        availability: ut.availability,
        discriminantValue: inflateNameAndWireValue(ut.discriminantValue),
        shape: inflateSingleUnionTypeProperties(ut.shape),
        displayName: ut.displayName
    });

    const inflateSingleUnionTypeProperties = (
        props: IrVersions.V66.SingleUnionTypeProperties
    ): IrVersions.V65.SingleUnionTypeProperties => {
        switch (props.propertiesType) {
            case "singleProperty":
                return IrVersions.V65.SingleUnionTypeProperties.singleProperty({
                    name: inflateNameAndWireValue(props.name),
                    type: inflateTypeReference(props.type)
                });
            case "samePropertiesAsObject":
                return IrVersions.V65.SingleUnionTypeProperties.samePropertiesAsObject(inflateDeclaredTypeName(props));
            case "noProperties":
                return IrVersions.V65.SingleUnionTypeProperties.noProperties();
            default:
                assertNever(props);
        }
    };

    // ===== ExamplePrimitive inflate =====

    const inflateExamplePrimitive = (ep: IrVersions.V66.ExamplePrimitive): IrVersions.V65.ExamplePrimitive => {
        switch (ep.type) {
            case "integer":
                return IrVersions.V65.ExamplePrimitive.integer(ep.integer);
            case "long":
                return IrVersions.V65.ExamplePrimitive.long(ep.long);
            case "uint":
                return IrVersions.V65.ExamplePrimitive.uint(ep.uint);
            case "uint64":
                return IrVersions.V65.ExamplePrimitive.uint64(ep.uint64);
            case "float":
                return IrVersions.V65.ExamplePrimitive.float(ep.float);
            case "double":
                return IrVersions.V65.ExamplePrimitive.double(ep.double);
            case "boolean":
                return IrVersions.V65.ExamplePrimitive.boolean(ep.boolean);
            case "string":
                return IrVersions.V65.ExamplePrimitive.string(ep.string);
            case "date":
                return IrVersions.V65.ExamplePrimitive.date(ep.date);
            case "datetime":
                return IrVersions.V65.ExamplePrimitive.datetime({
                    datetime: ep.datetime,
                    raw: ep.raw
                });
            case "datetimeRfc2822":
                return IrVersions.V65.ExamplePrimitive.datetimeRfc2822({
                    datetime: ep.datetime,
                    raw: ep.raw
                });
            case "uuid":
                return IrVersions.V65.ExamplePrimitive.uuid(ep.uuid);
            case "base64":
                return IrVersions.V65.ExamplePrimitive.base64(ep.base64);
            case "bigInteger":
                return IrVersions.V65.ExamplePrimitive.bigInteger(ep.bigInteger);
            default:
                assertNever(ep);
        }
    };

    // ===== Example type inflate (recursive) =====

    const inflateExampleType = (ex: IrVersions.V66.ExampleType): IrVersions.V65.ExampleType => ({
        docs: ex.docs,
        name: inflateOptionalName(ex.name),
        shape: inflateExampleTypeShape(ex.shape),
        jsonExample: ex.jsonExample
    });

    const inflateExampleTypeReference = (
        ref: IrVersions.V66.ExampleTypeReference
    ): IrVersions.V65.ExampleTypeReference => ({
        jsonExample: ref.jsonExample,
        shape: inflateExampleTypeReferenceShape(ref.shape)
    });

    const inflateExampleTypeReferenceShape = (
        shape: IrVersions.V66.ExampleTypeReferenceShape
    ): IrVersions.V65.ExampleTypeReferenceShape => {
        switch (shape.type) {
            case "named":
                return IrVersions.V65.ExampleTypeReferenceShape.named({
                    typeName: inflateDeclaredTypeName(shape.typeName),
                    shape: inflateExampleTypeShape(shape.shape)
                });
            case "container":
                return IrVersions.V65.ExampleTypeReferenceShape.container(inflateExampleContainer(shape.container));
            case "primitive":
                return IrVersions.V65.ExampleTypeReferenceShape.primitive(inflateExamplePrimitive(shape.primitive));
            case "unknown":
                return IrVersions.V65.ExampleTypeReferenceShape.unknown(shape.unknown);
            default:
                assertNever(shape);
        }
    };

    const inflateExampleContainer = (container: IrVersions.V66.ExampleContainer): IrVersions.V65.ExampleContainer => {
        switch (container.type) {
            case "list":
                return IrVersions.V65.ExampleContainer.list({
                    list: container.list.map(inflateExampleTypeReference),
                    itemType: inflateTypeReference(container.itemType)
                });
            case "set":
                return IrVersions.V65.ExampleContainer.set({
                    set: container.set.map(inflateExampleTypeReference),
                    itemType: inflateTypeReference(container.itemType)
                });
            case "optional":
                return IrVersions.V65.ExampleContainer.optional({
                    optional: container.optional != null ? inflateExampleTypeReference(container.optional) : undefined,
                    valueType: inflateTypeReference(container.valueType)
                });
            case "nullable":
                return IrVersions.V65.ExampleContainer.nullable({
                    nullable: container.nullable != null ? inflateExampleTypeReference(container.nullable) : undefined,
                    valueType: inflateTypeReference(container.valueType)
                });
            case "map":
                return IrVersions.V65.ExampleContainer.map({
                    map: container.map.map((kvp) => ({
                        key: inflateExampleTypeReference(kvp.key),
                        value: inflateExampleTypeReference(kvp.value)
                    })),
                    keyType: inflateTypeReference(container.keyType),
                    valueType: inflateTypeReference(container.valueType)
                });
            case "literal":
                return IrVersions.V65.ExampleContainer.literal({
                    literal: inflateExamplePrimitive(container.literal)
                });
            default:
                assertNever(container);
        }
    };

    const inflateExampleTypeShape = (shape: IrVersions.V66.ExampleTypeShape): IrVersions.V65.ExampleTypeShape => {
        switch (shape.type) {
            case "object":
                return IrVersions.V65.ExampleTypeShape.object({
                    properties: shape.properties.map(inflateExampleObjectProperty),
                    extraProperties:
                        shape.extraProperties != null
                            ? shape.extraProperties.map(inflateExampleExtraObjectProperty)
                            : undefined
                });
            case "union":
                return IrVersions.V65.ExampleTypeShape.union({
                    discriminant: inflateNameAndWireValue(shape.discriminant),
                    singleUnionType: inflateExampleSingleUnionType(shape.singleUnionType),
                    extendProperties:
                        shape.extendProperties != null
                            ? shape.extendProperties.map(inflateExampleObjectProperty)
                            : undefined,
                    baseProperties:
                        shape.baseProperties != null
                            ? shape.baseProperties.map(inflateExampleUnionBaseProperty)
                            : undefined
                });
            case "enum":
                return IrVersions.V65.ExampleTypeShape.enum({
                    value: inflateNameAndWireValue(shape.value)
                });
            case "alias":
                return IrVersions.V65.ExampleTypeShape.alias({
                    value: inflateExampleTypeReference(shape.value)
                });
            case "undiscriminatedUnion":
                return IrVersions.V65.ExampleTypeShape.undiscriminatedUnion({
                    index: shape.index,
                    singleUnionType: inflateExampleTypeReference(shape.singleUnionType)
                });
            default:
                assertNever(shape);
        }
    };

    const inflateExampleObjectProperty = (
        prop: IrVersions.V66.ExampleObjectProperty
    ): IrVersions.V65.ExampleObjectProperty => ({
        name: inflateNameAndWireValue(prop.name),
        value: inflateExampleTypeReference(prop.value),
        propertyAccess: prop.propertyAccess,
        originalTypeDeclaration: inflateDeclaredTypeName(prop.originalTypeDeclaration)
    });

    const inflateExampleExtraObjectProperty = (
        prop: IrVersions.V66.ExampleExtraObjectProperty
    ): IrVersions.V65.ExampleExtraObjectProperty => ({
        name: inflateNameAndWireValue(prop.name),
        value: inflateExampleTypeReference(prop.value)
    });

    const inflateExampleUnionBaseProperty = (
        prop: IrVersions.V66.ExampleUnionBaseProperty
    ): IrVersions.V65.ExampleUnionBaseProperty => ({
        name: inflateNameAndWireValue(prop.name),
        value: inflateExampleTypeReference(prop.value)
    });

    const inflateExampleSingleUnionType = (
        sut: IrVersions.V66.ExampleSingleUnionType
    ): IrVersions.V65.ExampleSingleUnionType => ({
        wireDiscriminantValue: inflateNameAndWireValue(sut.wireDiscriminantValue),
        shape: inflateExampleSingleUnionTypeProperties(sut.shape)
    });

    const inflateExampleSingleUnionTypeProperties = (
        props: IrVersions.V66.ExampleSingleUnionTypeProperties
    ): IrVersions.V65.ExampleSingleUnionTypeProperties => {
        switch (props.type) {
            case "samePropertiesAsObject":
                return IrVersions.V65.ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                    typeId: props.typeId,
                    object: {
                        properties: props.object.properties.map(inflateExampleObjectProperty),
                        extraProperties:
                            props.object.extraProperties != null
                                ? props.object.extraProperties.map(inflateExampleExtraObjectProperty)
                                : undefined
                    }
                });
            case "singleProperty":
                return IrVersions.V65.ExampleSingleUnionTypeProperties.singleProperty(
                    inflateExampleTypeReference(props)
                );
            case "noProperties":
                return IrVersions.V65.ExampleSingleUnionTypeProperties.noProperties();
            default:
                assertNever(props);
        }
    };

    // ===== HTTP endpoint inflate =====

    const inflatePathParameter = (pp: IrVersions.V66.PathParameter): IrVersions.V65.PathParameter => ({
        docs: pp.docs,
        name: inflateName(pp.name),
        valueType: inflateTypeReference(pp.valueType),
        location: pp.location,
        variable: pp.variable,
        v2Examples: pp.v2Examples != null ? inflateV2SchemaExamples(pp.v2Examples) : undefined,
        explode: pp.explode,
        clientDefault: undefined
    });

    const inflateQueryParameter = (qp: IrVersions.V66.QueryParameter): IrVersions.V65.QueryParameter => ({
        docs: qp.docs,
        availability: qp.availability,
        name: inflateNameAndWireValue(qp.name),
        valueType: inflateTypeReference(qp.valueType),
        allowMultiple: qp.allowMultiple,
        v2Examples: qp.v2Examples != null ? inflateV2SchemaExamples(qp.v2Examples) : undefined,
        explode: qp.explode,
        clientDefault: undefined
    });

    const inflateHeader = (h: IrVersions.V66.HttpHeader): IrVersions.V65.HttpHeader => ({
        docs: h.docs,
        availability: h.availability,
        name: inflateNameAndWireValue(h.name),
        valueType: inflateTypeReference(h.valueType),
        env: h.env,
        v2Examples: h.v2Examples != null ? inflateV2SchemaExamples(h.v2Examples) : undefined,
        clientDefault: undefined
    });

    const inflateFileProperty = (fp: IrVersions.V66.FileProperty): IrVersions.V65.FileProperty => {
        switch (fp.type) {
            case "file":
                return IrVersions.V65.FileProperty.file({
                    docs: fp.docs,
                    key: inflateNameAndWireValue(fp.key),
                    isOptional: fp.isOptional,
                    contentType: fp.contentType
                });
            case "fileArray":
                return IrVersions.V65.FileProperty.fileArray({
                    docs: fp.docs,
                    key: inflateNameAndWireValue(fp.key),
                    isOptional: fp.isOptional,
                    contentType: fp.contentType
                });
            default:
                assertNever(fp);
        }
    };

    const inflateTransport = (transport: IrVersions.V66.Transport): IrVersions.V65.Transport => {
        switch (transport.type) {
            case "http":
                return IrVersions.V65.Transport.http();
            case "grpc":
                return IrVersions.V65.Transport.grpc({
                    service: {
                        file: transport.service.file,
                        name: inflateName(transport.service.name)
                    }
                });
            default:
                assertNever(transport);
        }
    };

    const inflateHttpEndpointSource = (
        source: IrVersions.V66.HttpEndpointSource
    ): IrVersions.V65.HttpEndpointSource => {
        switch (source.type) {
            case "proto":
                return IrVersions.V65.HttpEndpointSource.proto({
                    methodType: source.methodType
                });
            case "openapi":
                return IrVersions.V65.HttpEndpointSource.openapi();
            case "openrpc":
                return IrVersions.V65.HttpEndpointSource.openrpc();
            default:
                assertNever(source);
        }
    };

    const inflateEndpoint = (ep: IrVersions.V66.HttpEndpoint): IrVersions.V65.HttpEndpoint => ({
        id: ep.id,
        name: inflateName(ep.name),
        displayName: ep.displayName,
        method: ep.method,
        headers: ep.headers.map(inflateHeader),
        responseHeaders: ep.responseHeaders != null ? ep.responseHeaders.map(inflateHeader) : undefined,
        baseUrl: ep.baseUrl,
        v2BaseUrls: ep.v2BaseUrls,
        basePath: ep.basePath != null ? inflateHttpPath(ep.basePath) : undefined,
        path: inflateHttpPath(ep.path),
        fullPath: inflateHttpPath(ep.fullPath),
        pathParameters: ep.pathParameters.map(inflatePathParameter),
        allPathParameters: ep.allPathParameters.map(inflatePathParameter),
        queryParameters: ep.queryParameters.map(inflateQueryParameter),
        requestBody: ep.requestBody != null ? inflateHttpRequestBody(ep.requestBody) : undefined,
        v2RequestBodies:
            ep.v2RequestBodies != null
                ? {
                      requestBodies:
                          ep.v2RequestBodies.requestBodies != null
                              ? ep.v2RequestBodies.requestBodies.map(inflateHttpRequestBody)
                              : undefined
                  }
                : undefined,
        sdkRequest: ep.sdkRequest != null ? inflateSdkRequest(ep.sdkRequest) : undefined,
        response: ep.response != null ? inflateHttpResponse(ep.response) : undefined,
        v2Responses:
            ep.v2Responses != null
                ? {
                      responses:
                          ep.v2Responses.responses != null
                              ? ep.v2Responses.responses.map(inflateHttpResponse)
                              : undefined
                  }
                : undefined,
        errors: ep.errors.map(inflateResponseError),
        auth: ep.auth,
        security: ep.security,
        idempotent: ep.idempotent,
        pagination: ep.pagination != null ? inflatePagination(ep.pagination) : undefined,
        userSpecifiedExamples: ep.userSpecifiedExamples.map(inflateUserSpecifiedEndpointExample),
        autogeneratedExamples: ep.autogeneratedExamples.map(inflateAutogeneratedEndpointExample),
        v2Examples: ep.v2Examples != null ? inflateV2HttpEndpointExamples(ep.v2Examples) : undefined,
        transport: ep.transport != null ? inflateTransport(ep.transport) : undefined,
        source: ep.source != null ? inflateHttpEndpointSource(ep.source) : undefined,
        audiences: ep.audiences,
        retries: ep.retries,
        apiPlayground: ep.apiPlayground,
        availability: ep.availability,
        docs: ep.docs
    });

    const inflateHttpPath = (path: IrVersions.V66.HttpPath): IrVersions.V65.HttpPath => ({
        head: path.head,
        parts: path.parts.map((part) => ({
            pathParameter: part.pathParameter,
            tail: part.tail
        }))
    });

    const inflateAutogeneratedEndpointExample = (
        ex: IrVersions.V66.AutogeneratedEndpointExample
    ): IrVersions.V65.AutogeneratedEndpointExample => ({
        example: inflateExampleEndpointCall(ex.example)
    });

    const inflateUserSpecifiedEndpointExample = (
        ex: IrVersions.V66.UserSpecifiedEndpointExample
    ): IrVersions.V65.UserSpecifiedEndpointExample => ({
        example: ex.example != null ? inflateExampleEndpointCall(ex.example) : undefined,
        codeSamples: ex.codeSamples != null ? ex.codeSamples.map(inflateExampleCodeSample) : undefined
    });

    const inflateExampleCodeSample = (cs: IrVersions.V66.ExampleCodeSample): IrVersions.V65.ExampleCodeSample => {
        switch (cs.type) {
            case "language":
                return IrVersions.V65.ExampleCodeSample.language({
                    name: inflateOptionalName(cs.name),
                    language: cs.language,
                    code: cs.code,
                    install: cs.install,
                    docs: cs.docs
                });
            case "sdk":
                return IrVersions.V65.ExampleCodeSample.sdk({
                    name: inflateOptionalName(cs.name),
                    sdk: cs.sdk,
                    code: cs.code,
                    docs: cs.docs
                });
            default:
                assertNever(cs);
        }
    };

    const inflateV2HttpEndpointExamples = (
        v2: IrVersions.V66.V2HttpEndpointExamples
    ): IrVersions.V65.V2HttpEndpointExamples => ({
        autogeneratedExamples: v2.autogeneratedExamples,
        userSpecifiedExamples: v2.userSpecifiedExamples
    });

    const inflateHttpResponse = (resp: IrVersions.V66.HttpResponse): IrVersions.V65.HttpResponse => ({
        docs: resp.docs,
        statusCode: resp.statusCode,
        isWildcardStatusCode: resp.isWildcardStatusCode,
        body: resp.body != null ? inflateHttpResponseBody(resp.body) : undefined
    });

    const inflateHttpResponseBody = (body: IrVersions.V66.HttpResponseBody): IrVersions.V65.HttpResponseBody => {
        switch (body.type) {
            case "json":
                return IrVersions.V65.HttpResponseBody.json(inflateJsonResponse(body.value));
            case "fileDownload":
                return IrVersions.V65.HttpResponseBody.fileDownload({
                    docs: body.docs,
                    v2Examples: body.v2Examples != null ? inflateV2SchemaExamples(body.v2Examples) : undefined
                });
            case "text":
                return IrVersions.V65.HttpResponseBody.text({
                    docs: body.docs,
                    v2Examples: body.v2Examples != null ? inflateV2SchemaExamples(body.v2Examples) : undefined
                });
            case "bytes":
                return IrVersions.V65.HttpResponseBody.bytes({
                    docs: body.docs,
                    v2Examples: body.v2Examples != null ? inflateV2SchemaExamples(body.v2Examples) : undefined
                });
            case "streaming":
                return IrVersions.V65.HttpResponseBody.streaming(inflateStreamingResponse(body.value));
            case "streamParameter":
                return IrVersions.V65.HttpResponseBody.streamParameter({
                    nonStreamResponse: inflateNonStreamHttpResponseBody(body.nonStreamResponse),
                    streamResponse: inflateStreamingResponse(body.streamResponse)
                });
            default:
                assertNever(body);
        }
    };

    const inflateJsonResponse = (json: IrVersions.V66.JsonResponse): IrVersions.V65.JsonResponse => {
        switch (json.type) {
            case "response":
                return IrVersions.V65.JsonResponse.response({
                    docs: json.docs,
                    responseBodyType: inflateTypeReference(json.responseBodyType),
                    v2Examples: json.v2Examples != null ? inflateV2SchemaExamples(json.v2Examples) : undefined
                });
            case "nestedPropertyAsResponse":
                return IrVersions.V65.JsonResponse.nestedPropertyAsResponse({
                    docs: json.docs,
                    responseBodyType: inflateTypeReference(json.responseBodyType),
                    responseProperty:
                        json.responseProperty != null ? inflateObjectProperty(json.responseProperty) : undefined,
                    v2Examples: json.v2Examples != null ? inflateV2SchemaExamples(json.v2Examples) : undefined
                });
            default:
                assertNever(json);
        }
    };

    const inflateStreamingResponse = (sr: IrVersions.V66.StreamingResponse): IrVersions.V65.StreamingResponse => {
        switch (sr.type) {
            case "json":
                return IrVersions.V65.StreamingResponse.json({
                    docs: sr.docs,
                    payload: inflateTypeReference(sr.payload),
                    terminator: sr.terminator,
                    v2Examples: sr.v2Examples != null ? inflateV2SchemaExamples(sr.v2Examples) : undefined
                });
            case "text":
                return IrVersions.V65.StreamingResponse.text({
                    docs: sr.docs,
                    v2Examples: sr.v2Examples != null ? inflateV2SchemaExamples(sr.v2Examples) : undefined
                });
            case "sse":
                return IrVersions.V65.StreamingResponse.sse({
                    docs: sr.docs,
                    payload: inflateTypeReference(sr.payload),
                    terminator: sr.terminator,
                    v2Examples: sr.v2Examples != null ? inflateV2SchemaExamples(sr.v2Examples) : undefined
                });
            default:
                assertNever(sr);
        }
    };

    const inflateNonStreamHttpResponseBody = (
        body: IrVersions.V66.NonStreamHttpResponseBody
    ): IrVersions.V65.NonStreamHttpResponseBody => {
        switch (body.type) {
            case "json":
                return IrVersions.V65.NonStreamHttpResponseBody.json(inflateJsonResponse(body.value));
            case "fileDownload":
                return IrVersions.V65.NonStreamHttpResponseBody.fileDownload({
                    docs: body.docs,
                    v2Examples: body.v2Examples != null ? inflateV2SchemaExamples(body.v2Examples) : undefined
                });
            case "text":
                return IrVersions.V65.NonStreamHttpResponseBody.text({
                    docs: body.docs,
                    v2Examples: body.v2Examples != null ? inflateV2SchemaExamples(body.v2Examples) : undefined
                });
            case "bytes":
                return IrVersions.V65.NonStreamHttpResponseBody.bytes({
                    docs: body.docs,
                    v2Examples: body.v2Examples != null ? inflateV2SchemaExamples(body.v2Examples) : undefined
                });
            default:
                assertNever(body);
        }
    };

    const inflateResponseError = (re: IrVersions.V66.ResponseError): IrVersions.V65.ResponseError => ({
        docs: re.docs,
        error: inflateDeclaredErrorName(re.error)
    });

    const inflateHttpRequestBody = (rb: IrVersions.V66.HttpRequestBody): IrVersions.V65.HttpRequestBody => {
        switch (rb.type) {
            case "inlinedRequestBody":
                return IrVersions.V65.HttpRequestBody.inlinedRequestBody({
                    docs: rb.docs,
                    name: inflateName(rb.name),
                    extends: rb.extends.map(inflateDeclaredTypeName),
                    properties: rb.properties.map(inflateInlinedRequestBodyProperty),
                    extendedProperties:
                        rb.extendedProperties != null ? rb.extendedProperties.map(inflateObjectProperty) : undefined,
                    extraProperties: rb.extraProperties,
                    contentType: rb.contentType,
                    v2Examples: rb.v2Examples != null ? inflateV2SchemaExamples(rb.v2Examples) : undefined
                });
            case "reference":
                return IrVersions.V65.HttpRequestBody.reference({
                    docs: rb.docs,
                    requestBodyType: inflateTypeReference(rb.requestBodyType),
                    contentType: rb.contentType,
                    v2Examples: rb.v2Examples != null ? inflateV2SchemaExamples(rb.v2Examples) : undefined
                });
            case "fileUpload":
                return IrVersions.V65.HttpRequestBody.fileUpload({
                    docs: rb.docs,
                    name: inflateName(rb.name),
                    properties: rb.properties.map(inflateFileUploadRequestProperty),
                    contentType: rb.contentType,
                    v2Examples: rb.v2Examples != null ? inflateV2SchemaExamples(rb.v2Examples) : undefined
                });
            case "bytes":
                return IrVersions.V65.HttpRequestBody.bytes({
                    docs: rb.docs,
                    isOptional: rb.isOptional,
                    contentType: rb.contentType,
                    v2Examples: rb.v2Examples != null ? inflateV2SchemaExamples(rb.v2Examples) : undefined
                });
            default:
                assertNever(rb);
        }
    };

    const inflateInlinedRequestBodyProperty = (
        prop: IrVersions.V66.InlinedRequestBodyProperty
    ): IrVersions.V65.InlinedRequestBodyProperty => ({
        docs: prop.docs,
        availability: prop.availability,
        name: inflateNameAndWireValue(prop.name),
        valueType: inflateTypeReference(prop.valueType),
        v2Examples: prop.v2Examples != null ? inflateV2SchemaExamples(prop.v2Examples) : undefined,
        propertyAccess: prop.propertyAccess
    });

    const inflateFileUploadRequestProperty = (
        prop: IrVersions.V66.FileUploadRequestProperty
    ): IrVersions.V65.FileUploadRequestProperty => {
        switch (prop.type) {
            case "bodyProperty":
                return IrVersions.V65.FileUploadRequestProperty.bodyProperty({
                    docs: prop.docs,
                    availability: prop.availability,
                    name: inflateNameAndWireValue(prop.name),
                    valueType: inflateTypeReference(prop.valueType),
                    v2Examples: prop.v2Examples != null ? inflateV2SchemaExamples(prop.v2Examples) : undefined,
                    propertyAccess: prop.propertyAccess,
                    contentType: prop.contentType,
                    style: prop.style
                });
            case "file":
                return IrVersions.V65.FileUploadRequestProperty.file(inflateFileProperty(prop.value));
            default:
                assertNever(prop);
        }
    };

    const inflateSdkRequestBodyType = (sbt: IrVersions.V66.SdkRequestBodyType): IrVersions.V65.SdkRequestBodyType => {
        switch (sbt.type) {
            case "typeReference":
                return IrVersions.V65.SdkRequestBodyType.typeReference({
                    docs: sbt.docs,
                    requestBodyType: inflateTypeReference(sbt.requestBodyType),
                    contentType: sbt.contentType,
                    v2Examples: sbt.v2Examples != null ? inflateV2SchemaExamples(sbt.v2Examples) : undefined
                });
            case "bytes":
                return IrVersions.V65.SdkRequestBodyType.bytes({
                    docs: sbt.docs,
                    isOptional: sbt.isOptional,
                    contentType: sbt.contentType,
                    v2Examples: sbt.v2Examples != null ? inflateV2SchemaExamples(sbt.v2Examples) : undefined
                });
            default:
                assertNever(sbt);
        }
    };

    const inflateSdkRequestShape = (shape: IrVersions.V66.SdkRequestShape): IrVersions.V65.SdkRequestShape => {
        switch (shape.type) {
            case "justRequestBody":
                return IrVersions.V65.SdkRequestShape.justRequestBody(inflateSdkRequestBodyType(shape.value));
            case "wrapper":
                return IrVersions.V65.SdkRequestShape.wrapper({
                    wrapperName: inflateName(shape.wrapperName),
                    bodyKey: inflateName(shape.bodyKey),
                    includePathParameters: shape.includePathParameters,
                    onlyPathParameters: shape.onlyPathParameters
                });
            default:
                assertNever(shape);
        }
    };

    const inflateSdkRequest = (req: IrVersions.V66.SdkRequest): IrVersions.V65.SdkRequest => ({
        requestParameterName: inflateName(req.requestParameterName),
        shape: inflateSdkRequestShape(req.shape),
        streamParameter: req.streamParameter != null ? inflateRequestProperty(req.streamParameter) : undefined
    });

    // ===== Pagination inflate =====

    const inflateRequestProperty = (rp: IrVersions.V66.RequestProperty): IrVersions.V65.RequestProperty => ({
        propertyPath: rp.propertyPath != null ? rp.propertyPath.map(inflatePropertyPathItem) : undefined,
        property: inflateRequestPropertyValue(rp.property)
    });

    const inflateRequestPropertyValue = (
        rpv: IrVersions.V66.RequestPropertyValue
    ): IrVersions.V65.RequestPropertyValue => {
        switch (rpv.type) {
            case "query":
                return IrVersions.V65.RequestPropertyValue.query(inflateQueryParameter(rpv));
            case "body":
                return IrVersions.V65.RequestPropertyValue.body(inflateObjectProperty(rpv));
            default:
                assertNever(rpv);
        }
    };

    const inflateResponseProperty = (rp: IrVersions.V66.ResponseProperty): IrVersions.V65.ResponseProperty => ({
        propertyPath: rp.propertyPath != null ? rp.propertyPath.map(inflatePropertyPathItem) : undefined,
        property: inflateObjectProperty(rp.property)
    });

    const inflatePagination = (pagination: IrVersions.V66.Pagination): IrVersions.V65.Pagination => {
        switch (pagination.type) {
            case "cursor":
                return IrVersions.V65.Pagination.cursor({
                    page: inflateRequestProperty(pagination.page),
                    next: inflateResponseProperty(pagination.next),
                    results: inflateResponseProperty(pagination.results)
                });
            case "offset":
                return IrVersions.V65.Pagination.offset({
                    page: inflateRequestProperty(pagination.page),
                    step: pagination.step != null ? inflateRequestProperty(pagination.step) : undefined,
                    results: inflateResponseProperty(pagination.results),
                    hasNextPage:
                        pagination.hasNextPage != null ? inflateResponseProperty(pagination.hasNextPage) : undefined
                });
            case "custom":
                return IrVersions.V65.Pagination.custom({
                    results: inflateResponseProperty(pagination.results)
                });
            case "uri":
                return IrVersions.V65.Pagination.uri({
                    nextUri: inflateResponseProperty(pagination.nextUri),
                    results: inflateResponseProperty(pagination.results)
                });
            case "path":
                return IrVersions.V65.Pagination.path({
                    nextPath: inflateResponseProperty(pagination.nextPath),
                    results: inflateResponseProperty(pagination.results)
                });
            default:
                assertNever(pagination);
        }
    };

    // ===== Example endpoint call inflate =====

    const inflateExampleEndpointCall = (
        ex: IrVersions.V66.ExampleEndpointCall
    ): IrVersions.V65.ExampleEndpointCall => ({
        id: ex.id,
        name: inflateOptionalName(ex.name),
        url: ex.url,
        rootPathParameters: ex.rootPathParameters.map(inflateExamplePathParameter),
        servicePathParameters: ex.servicePathParameters.map(inflateExamplePathParameter),
        endpointPathParameters: ex.endpointPathParameters.map(inflateExamplePathParameter),
        queryParameters: ex.queryParameters.map(inflateExampleQueryParameter),
        serviceHeaders: ex.serviceHeaders.map(inflateExampleHeader),
        endpointHeaders: ex.endpointHeaders.map(inflateExampleHeader),
        request: ex.request != null ? inflateExampleRequestBody(ex.request) : undefined,
        response: inflateExampleResponse(ex.response),
        docs: ex.docs
    });

    const inflateExamplePathParameter = (
        pp: IrVersions.V66.ExamplePathParameter
    ): IrVersions.V65.ExamplePathParameter => ({
        name: inflateName(pp.name),
        value: inflateExampleTypeReference(pp.value)
    });

    const inflateExampleQueryParameter = (
        qp: IrVersions.V66.ExampleQueryParameter
    ): IrVersions.V65.ExampleQueryParameter => ({
        name: inflateNameAndWireValue(qp.name),
        value: inflateExampleTypeReference(qp.value),
        shape: qp.shape
    });

    const inflateExampleHeader = (h: IrVersions.V66.ExampleHeader): IrVersions.V65.ExampleHeader => ({
        name: inflateNameAndWireValue(h.name),
        value: inflateExampleTypeReference(h.value)
    });

    const inflateExampleRequestBody = (rb: IrVersions.V66.ExampleRequestBody): IrVersions.V65.ExampleRequestBody => {
        switch (rb.type) {
            case "inlinedRequestBody":
                return IrVersions.V65.ExampleRequestBody.inlinedRequestBody({
                    jsonExample: rb.jsonExample,
                    properties: rb.properties.map(inflateExampleInlinedRequestBodyProperty),
                    extraProperties:
                        rb.extraProperties != null
                            ? rb.extraProperties.map(inflateExampleInlinedRequestBodyExtraProperty)
                            : undefined
                });
            case "reference":
                return IrVersions.V65.ExampleRequestBody.reference(inflateExampleTypeReference(rb));
            default:
                assertNever(rb);
        }
    };

    const inflateExampleInlinedRequestBodyProperty = (
        prop: IrVersions.V66.ExampleInlinedRequestBodyProperty
    ): IrVersions.V65.ExampleInlinedRequestBodyProperty => ({
        name: inflateNameAndWireValue(prop.name),
        value: inflateExampleTypeReference(prop.value),
        originalTypeDeclaration:
            prop.originalTypeDeclaration != null ? inflateDeclaredTypeName(prop.originalTypeDeclaration) : undefined
    });

    const inflateExampleInlinedRequestBodyExtraProperty = (
        prop: IrVersions.V66.ExampleInlinedRequestBodyExtraProperty
    ): IrVersions.V65.ExampleInlinedRequestBodyExtraProperty => ({
        name: inflateNameAndWireValue(prop.name),
        value: inflateExampleTypeReference(prop.value)
    });

    const inflateExampleResponse = (response: IrVersions.V66.ExampleResponse): IrVersions.V65.ExampleResponse => {
        switch (response.type) {
            case "ok":
                return IrVersions.V65.ExampleResponse.ok(inflateExampleEndpointSuccessResponse(response.value));
            case "error":
                return IrVersions.V65.ExampleResponse.error({
                    error: inflateDeclaredErrorName(response.error),
                    body: response.body != null ? inflateExampleTypeReference(response.body) : undefined
                });
            default:
                assertNever(response);
        }
    };

    const inflateExampleEndpointSuccessResponse = (
        response: IrVersions.V66.ExampleEndpointSuccessResponse
    ): IrVersions.V65.ExampleEndpointSuccessResponse => {
        switch (response.type) {
            case "body":
                return IrVersions.V65.ExampleEndpointSuccessResponse.body(
                    response.value != null ? inflateExampleTypeReference(response.value) : undefined
                );
            case "stream":
                return IrVersions.V65.ExampleEndpointSuccessResponse.stream(
                    response.value.map(inflateExampleTypeReference)
                );
            case "sse":
                return IrVersions.V65.ExampleEndpointSuccessResponse.sse(
                    response.value.map((event) => ({
                        event: event.event,
                        data: inflateExampleTypeReference(event.data)
                    }))
                );
            default:
                assertNever(response);
        }
    };

    // ===== Service inflate =====

    const inflateService = (svc: IrVersions.V66.HttpService): IrVersions.V65.HttpService => ({
        availability: svc.availability,
        name: {
            fernFilepath: inflateFernFilepath(svc.name.fernFilepath)
        },
        displayName: svc.displayName,
        basePath: svc.basePath,
        headers: svc.headers.map(inflateHeader),
        pathParameters: svc.pathParameters.map(inflatePathParameter),
        endpoints: svc.endpoints.map(inflateEndpoint),
        encoding: svc.encoding,
        transport: svc.transport != null ? inflateTransport(svc.transport) : undefined,
        audiences: svc.audiences
    });

    // ===== Error declaration inflate =====

    const inflateDeclaredErrorName = (name: IrVersions.V66.DeclaredErrorName): IrVersions.V65.DeclaredErrorName => ({
        errorId: name.errorId,
        fernFilepath: inflateFernFilepath(name.fernFilepath),
        name: inflateName(name.name)
    });

    const inflateErrorDeclaration = (err: IrVersions.V66.ErrorDeclaration): IrVersions.V65.ErrorDeclaration => ({
        docs: err.docs,
        name: inflateDeclaredErrorName(err.name),
        discriminantValue: inflateNameAndWireValue(err.discriminantValue),
        type: err.type != null ? inflateTypeReference(err.type) : undefined,
        statusCode: err.statusCode,
        isWildcardStatusCode: err.isWildcardStatusCode,
        headers: err.headers != null ? err.headers.map(inflateHeader) : undefined,
        examples: err.examples.map(inflateExampleError),
        v2Examples: err.v2Examples != null ? inflateV2SchemaExamples(err.v2Examples) : undefined,
        displayName: err.displayName
    });

    const inflateExampleError = (ex: IrVersions.V66.ExampleError): IrVersions.V65.ExampleError => ({
        docs: ex.docs,
        name: inflateOptionalName(ex.name),
        shape: inflateExampleTypeReference(ex.shape),
        jsonExample: ex.jsonExample
    });

    // ===== Webhook inflate =====

    const inflateExampleWebhookCall = (ex: IrVersions.V66.ExampleWebhookCall): IrVersions.V65.ExampleWebhookCall => ({
        docs: ex.docs,
        name: inflateOptionalName(ex.name),
        payload: inflateExampleTypeReference(ex.payload)
    });

    const inflateWebhook = (wh: IrVersions.V66.webhooks.Webhook): IrVersions.V65.webhooks.Webhook => ({
        id: wh.id,
        name: inflateName(wh.name),
        displayName: wh.displayName,
        method: wh.method,
        headers: wh.headers.map(inflateHeader),
        payload: inflateWebhookPayload(wh.payload),
        signatureVerification:
            wh.signatureVerification != null
                ? inflateWebhookSignatureVerification(wh.signatureVerification)
                : undefined,
        fileUploadPayload:
            wh.fileUploadPayload != null
                ? {
                      docs: wh.fileUploadPayload.docs,
                      name: inflateName(wh.fileUploadPayload.name),
                      properties: wh.fileUploadPayload.properties.map(inflateFileUploadRequestProperty),
                      contentType: wh.fileUploadPayload.contentType,
                      v2Examples:
                          wh.fileUploadPayload.v2Examples != null
                              ? inflateV2SchemaExamples(wh.fileUploadPayload.v2Examples)
                              : undefined
                  }
                : undefined,
        responses: wh.responses != null ? wh.responses.map(inflateHttpResponse) : undefined,
        examples: wh.examples != null ? wh.examples.map(inflateExampleWebhookCall) : undefined,
        v2Examples: wh.v2Examples,
        availability: wh.availability,
        docs: wh.docs
    });

    const inflateWebhookPayload = (
        payload: IrVersions.V66.webhooks.WebhookPayload
    ): IrVersions.V65.webhooks.WebhookPayload => {
        switch (payload.type) {
            case "inlinedPayload":
                return IrVersions.V65.webhooks.WebhookPayload.inlinedPayload({
                    name: inflateName(payload.name),
                    extends: payload.extends.map(inflateDeclaredTypeName),
                    properties: payload.properties.map(inflateInlinedWebhookPayloadProperty)
                });
            case "reference":
                return IrVersions.V65.webhooks.WebhookPayload.reference({
                    docs: payload.docs,
                    payloadType: inflateTypeReference(payload.payloadType)
                });
            default:
                assertNever(payload);
        }
    };

    const inflateInlinedWebhookPayloadProperty = (
        prop: IrVersions.V66.webhooks.InlinedWebhookPayloadProperty
    ): IrVersions.V65.webhooks.InlinedWebhookPayloadProperty => ({
        docs: prop.docs,
        availability: prop.availability,
        name: inflateNameAndWireValue(prop.name),
        valueType: inflateTypeReference(prop.valueType)
    });

    // ===== Auth inflate =====

    const inflateAuthScheme = (scheme: IrVersions.V66.AuthScheme): IrVersions.V65.AuthScheme => {
        switch (scheme.type) {
            case "header":
                return IrVersions.V65.AuthScheme.header({
                    docs: scheme.docs,
                    name: inflateNameAndWireValue(scheme.name),
                    valueType: inflateTypeReference(scheme.valueType),
                    prefix: scheme.prefix,
                    headerEnvVar: scheme.headerEnvVar,
                    key: scheme.key
                });
            case "bearer":
                return IrVersions.V65.AuthScheme.bearer({
                    docs: scheme.docs,
                    key: scheme.key,
                    token: inflateName(scheme.token),
                    tokenEnvVar: scheme.tokenEnvVar
                });
            case "basic":
                return IrVersions.V65.AuthScheme.basic({
                    docs: scheme.docs,
                    key: scheme.key,
                    username: inflateName(scheme.username),
                    usernameEnvVar: scheme.usernameEnvVar,
                    usernameOmit: scheme.usernameOmit,
                    password: inflateName(scheme.password),
                    passwordEnvVar: scheme.passwordEnvVar,
                    passwordOmit: scheme.passwordOmit
                });
            case "oauth":
                return IrVersions.V65.AuthScheme.oauth({
                    docs: scheme.docs,
                    key: scheme.key,
                    configuration: inflateOAuthConfiguration(scheme.configuration)
                });
            case "inferred":
                return IrVersions.V65.AuthScheme.inferred({
                    docs: scheme.docs,
                    key: scheme.key,
                    tokenEndpoint: {
                        endpoint: scheme.tokenEndpoint.endpoint,
                        expiryProperty:
                            scheme.tokenEndpoint.expiryProperty != null
                                ? inflateResponseProperty(scheme.tokenEndpoint.expiryProperty)
                                : undefined,
                        authenticatedRequestHeaders: scheme.tokenEndpoint.authenticatedRequestHeaders.map((h) => ({
                            responseProperty: inflateResponseProperty(h.responseProperty),
                            headerName: h.headerName,
                            valuePrefix: h.valuePrefix
                        }))
                    }
                });
            default:
                assertNever(scheme);
        }
    };

    const inflateOAuthConfiguration = (
        config: IrVersions.V66.OAuthConfiguration
    ): IrVersions.V65.OAuthConfiguration => {
        switch (config.type) {
            case "clientCredentials":
                return IrVersions.V65.OAuthConfiguration.clientCredentials({
                    clientIdEnvVar: config.clientIdEnvVar,
                    clientSecretEnvVar: config.clientSecretEnvVar,
                    tokenPrefix: config.tokenPrefix,
                    tokenHeader: config.tokenHeader,
                    scopes: config.scopes,
                    tokenEndpoint: {
                        endpointReference: config.tokenEndpoint.endpointReference,
                        requestProperties: {
                            clientId: inflateRequestProperty(config.tokenEndpoint.requestProperties.clientId),
                            clientSecret: inflateRequestProperty(config.tokenEndpoint.requestProperties.clientSecret),
                            scopes:
                                config.tokenEndpoint.requestProperties.scopes != null
                                    ? inflateRequestProperty(config.tokenEndpoint.requestProperties.scopes)
                                    : undefined,
                            customProperties:
                                config.tokenEndpoint.requestProperties.customProperties != null
                                    ? config.tokenEndpoint.requestProperties.customProperties.map(
                                          inflateRequestProperty
                                      )
                                    : undefined
                        },
                        responseProperties: {
                            accessToken: inflateResponseProperty(config.tokenEndpoint.responseProperties.accessToken),
                            expiresIn:
                                config.tokenEndpoint.responseProperties.expiresIn != null
                                    ? inflateResponseProperty(config.tokenEndpoint.responseProperties.expiresIn)
                                    : undefined,
                            refreshToken:
                                config.tokenEndpoint.responseProperties.refreshToken != null
                                    ? inflateResponseProperty(config.tokenEndpoint.responseProperties.refreshToken)
                                    : undefined
                        }
                    },
                    refreshEndpoint:
                        config.refreshEndpoint != null
                            ? {
                                  endpointReference: config.refreshEndpoint.endpointReference,
                                  requestProperties: {
                                      refreshToken: inflateRequestProperty(
                                          config.refreshEndpoint.requestProperties.refreshToken
                                      )
                                  },
                                  responseProperties: {
                                      accessToken: inflateResponseProperty(
                                          config.refreshEndpoint.responseProperties.accessToken
                                      ),
                                      expiresIn:
                                          config.refreshEndpoint.responseProperties.expiresIn != null
                                              ? inflateResponseProperty(
                                                    config.refreshEndpoint.responseProperties.expiresIn
                                                )
                                              : undefined,
                                      refreshToken:
                                          config.refreshEndpoint.responseProperties.refreshToken != null
                                              ? inflateResponseProperty(
                                                    config.refreshEndpoint.responseProperties.refreshToken
                                                )
                                              : undefined
                                  }
                              }
                            : undefined
                });
        }
    };

    // ===== Subpackage / Variable inflate =====

    const inflateSubpackage = (sp: IrVersions.V66.Subpackage): IrVersions.V65.Subpackage => ({
        docs: sp.docs,
        name: inflateName(sp.name),
        displayName: sp.displayName,
        fernFilepath: inflateFernFilepath(sp.fernFilepath),
        service: sp.service,
        types: sp.types,
        errors: sp.errors,
        webhooks: sp.webhooks,
        websocket: sp.websocket,
        subpackages: sp.subpackages,
        hasEndpointsInTree: sp.hasEndpointsInTree,
        navigationConfig: sp.navigationConfig
    });

    const inflateVariable = (v: IrVersions.V66.VariableDeclaration): IrVersions.V65.VariableDeclaration => ({
        docs: v.docs,
        id: v.id,
        name: inflateName(v.name),
        type: inflateTypeReference(v.type)
    });

    // ===== WebSocket channel inflate =====

    const inflateChannel = (
        ch: IrVersions.V66.websocket.WebSocketChannel
    ): IrVersions.V65.websocket.WebSocketChannel => ({
        name: inflateName(ch.name),
        displayName: ch.displayName,
        connectMethodName: ch.connectMethodName,
        baseUrl: ch.baseUrl,
        path: ch.path,
        auth: ch.auth,
        headers: ch.headers.map(inflateHeader),
        queryParameters: ch.queryParameters.map(inflateQueryParameter),
        pathParameters: ch.pathParameters.map(inflatePathParameter),
        messages: ch.messages.map(inflateWebSocketMessage),
        examples: ch.examples.map(inflateExampleWebSocketSession),
        v2Examples: ch.v2Examples != null ? inflateV2WebSocketSessionExamples(ch.v2Examples) : undefined,
        availability: ch.availability,
        docs: ch.docs
    });

    const inflateWebSocketMessage = (
        msg: IrVersions.V66.websocket.WebSocketMessage
    ): IrVersions.V65.websocket.WebSocketMessage => ({
        type: msg.type,
        displayName: msg.displayName,
        methodName: msg.methodName,
        origin: msg.origin,
        body: inflateWebSocketMessageBody(msg.body),
        availability: msg.availability,
        docs: msg.docs
    });

    const inflateWebSocketMessageBody = (
        body: IrVersions.V66.websocket.WebSocketMessageBody
    ): IrVersions.V65.websocket.WebSocketMessageBody => {
        switch (body.type) {
            case "inlinedBody":
                return IrVersions.V65.websocket.WebSocketMessageBody.inlinedBody({
                    name: inflateName(body.name),
                    extends: body.extends.map(inflateDeclaredTypeName),
                    properties: body.properties.map(inflateInlinedWebhookPayloadProperty)
                });
            case "reference":
                return IrVersions.V65.websocket.WebSocketMessageBody.reference({
                    docs: body.docs,
                    bodyType: inflateTypeReference(body.bodyType)
                });
            default:
                assertNever(body);
        }
    };

    const inflateExampleWebSocketSession = (
        ex: IrVersions.V66.websocket.ExampleWebSocketSession
    ): IrVersions.V65.websocket.ExampleWebSocketSession => ({
        name: inflateOptionalName(ex.name),
        url: ex.url,
        pathParameters: ex.pathParameters.map(inflateExamplePathParameter),
        headers: ex.headers.map(inflateExampleHeader),
        queryParameters: ex.queryParameters.map(inflateExampleQueryParameter),
        messages: ex.messages.map(inflateExampleWebSocketMessage),
        docs: ex.docs
    });

    const inflateExampleWebSocketMessage = (
        msg: IrVersions.V66.websocket.ExampleWebSocketMessage
    ): IrVersions.V65.websocket.ExampleWebSocketMessage => ({
        type: msg.type,
        body: inflateExampleWebSocketMessageBody(msg.body)
    });

    const inflateExampleWebSocketMessageBody = (
        body: IrVersions.V66.websocket.ExampleWebSocketMessageBody
    ): IrVersions.V65.websocket.ExampleWebSocketMessageBody => {
        switch (body.type) {
            case "inlinedBody":
                return IrVersions.V65.websocket.ExampleWebSocketMessageBody.inlinedBody({
                    jsonExample: body.jsonExample,
                    properties: body.properties.map(inflateExampleInlinedRequestBodyProperty),
                    extraProperties:
                        body.extraProperties != null
                            ? body.extraProperties.map(inflateExampleInlinedRequestBodyExtraProperty)
                            : undefined
                });
            case "reference":
                return IrVersions.V65.websocket.ExampleWebSocketMessageBody.reference(
                    inflateExampleTypeReference(body)
                );
            default:
                assertNever(body);
        }
    };

    const inflateV2WebSocketSessionExamples = (
        v2: IrVersions.V66.V2WebSocketSessionExamples
    ): IrVersions.V65.V2WebSocketSessionExamples => ({
        autogeneratedExamples: v2.autogeneratedExamples,
        userSpecifiedExamples: v2.userSpecifiedExamples
    });

    // ===== Environment inflate =====

    const inflateEnvironmentsConfig = (
        config: IrVersions.V66.EnvironmentsConfig | undefined
    ): IrVersions.V65.EnvironmentsConfig | undefined => {
        if (config == null) {
            return undefined;
        }
        return {
            defaultEnvironment: config.defaultEnvironment,
            environments: inflateEnvironments(config.environments)
        };
    };

    const inflateEnvironments = (envs: IrVersions.V66.Environments): IrVersions.V65.Environments => {
        switch (envs.type) {
            case "singleBaseUrl":
                return IrVersions.V65.Environments.singleBaseUrl({
                    environments: envs.environments.map(inflateSingleBaseUrlEnvironment)
                });
            case "multipleBaseUrls":
                return IrVersions.V65.Environments.multipleBaseUrls({
                    baseUrls: envs.baseUrls.map(inflateEnvironmentBaseUrlWithId),
                    environments: envs.environments.map(inflateMultipleBaseUrlsEnvironment)
                });
            default:
                assertNever(envs);
        }
    };

    const inflateSingleBaseUrlEnvironment = (
        env: IrVersions.V66.SingleBaseUrlEnvironment
    ): IrVersions.V65.SingleBaseUrlEnvironment => ({
        id: env.id,
        name: inflateName(env.name),
        docs: env.docs,
        url: env.url,
        defaultUrl: env.defaultUrl,
        urlTemplate: env.urlTemplate,
        urlVariables: env.urlVariables != null ? env.urlVariables.map(inflateServerVariable) : undefined,
        audiences: env.audiences
    });

    const inflateMultipleBaseUrlsEnvironment = (
        env: IrVersions.V66.MultipleBaseUrlsEnvironment
    ): IrVersions.V65.MultipleBaseUrlsEnvironment => ({
        id: env.id,
        name: inflateName(env.name),
        docs: env.docs,
        urls: env.urls,
        defaultUrls: env.defaultUrls,
        urlTemplates: env.urlTemplates,
        urlVariables:
            env.urlVariables != null
                ? Object.fromEntries(
                      Object.entries(env.urlVariables).map(([baseUrlId, variables]) => [
                          baseUrlId,
                          variables.map(inflateServerVariable)
                      ])
                  )
                : undefined,
        audiences: env.audiences
    });

    const inflateServerVariable = (sv: IrVersions.V66.ServerVariable): IrVersions.V65.ServerVariable => ({
        id: sv.id,
        name: inflateName(sv.name),
        default: sv.default,
        values: sv.values
    });

    const inflateEnvironmentBaseUrlWithId = (
        baseUrl: IrVersions.V66.EnvironmentBaseUrlWithId
    ): IrVersions.V65.EnvironmentBaseUrlWithId => ({
        id: baseUrl.id,
        name: inflateName(baseUrl.name)
    });

    // ===== Error discrimination strategy inflate =====

    const inflateErrorDiscriminationStrategy = (
        strategy: IrVersions.V66.ErrorDiscriminationStrategy
    ): IrVersions.V65.ErrorDiscriminationStrategy => {
        switch (strategy.type) {
            case "property":
                return IrVersions.V65.ErrorDiscriminationStrategy.property({
                    discriminant: inflateNameAndWireValue(strategy.discriminant),
                    contentProperty: inflateNameAndWireValue(strategy.contentProperty)
                });
            case "statusCode":
                return IrVersions.V65.ErrorDiscriminationStrategy.statusCode();
            default:
                assertNever(strategy);
        }
    };

    // ===== Webhook Signature Verification inflate =====

    const inflateWebhookTimestampConfig = (
        config: IrVersions.V66.WebhookTimestampConfig
    ): IrVersions.V65.WebhookTimestampConfig => ({
        headerName: inflateNameAndWireValue(config.headerName),
        format: config.format,
        tolerance: config.tolerance
    });

    const inflateWebhookSignatureVerification = (
        sv: IrVersions.V66.WebhookSignatureVerification
    ): IrVersions.V65.WebhookSignatureVerification => {
        switch (sv.type) {
            case "hmac":
                return IrVersions.V65.WebhookSignatureVerification.hmac({
                    signatureHeaderName: inflateNameAndWireValue(sv.signatureHeaderName),
                    algorithm: sv.algorithm,
                    encoding: sv.encoding,
                    signaturePrefix: sv.signaturePrefix,
                    payloadFormat: sv.payloadFormat,
                    timestamp: sv.timestamp != null ? inflateWebhookTimestampConfig(sv.timestamp) : undefined
                });
            case "asymmetric":
                return IrVersions.V65.WebhookSignatureVerification.asymmetric({
                    signatureHeaderName: inflateNameAndWireValue(sv.signatureHeaderName),
                    algorithm: sv.algorithm,
                    encoding: sv.encoding,
                    signaturePrefix: sv.signaturePrefix,
                    keySource: inflateAsymmetricKeySource(sv.keySource),
                    timestamp: sv.timestamp != null ? inflateWebhookTimestampConfig(sv.timestamp) : undefined
                });
            default:
                assertNever(sv);
        }
    };

    const inflateAsymmetricKeySource = (ks: IrVersions.V66.AsymmetricKeySource): IrVersions.V65.AsymmetricKeySource => {
        switch (ks.type) {
            case "jwks":
                return IrVersions.V65.AsymmetricKeySource.jwks({
                    url: ks.url,
                    keyIdHeader: ks.keyIdHeader != null ? inflateNameAndWireValue(ks.keyIdHeader) : undefined
                });
            case "static":
                return IrVersions.V65.AsymmetricKeySource.static({});
            default:
                assertNever(ks);
        }
    };

    // ===== ApiVersionScheme inflate =====

    const inflateApiVersionScheme = (scheme: IrVersions.V66.ApiVersionScheme): IrVersions.V65.ApiVersionScheme => {
        switch (scheme.type) {
            case "header":
                return IrVersions.V65.ApiVersionScheme.header({
                    header: inflateHeader(scheme.header),
                    value: {
                        default: scheme.value.default != null ? inflateEnumValue(scheme.value.default) : undefined,
                        values: scheme.value.values.map(inflateEnumValue),
                        forwardCompatible: scheme.value.forwardCompatible
                    }
                });
            default:
                assertNever(scheme.type);
        }
    };

    // ===== Dynamic IR inflate =====

    const inflateDynamicName = (name: IrVersions.V66.dynamic.NameOrString): IrVersions.V65.dynamic.Name => {
        if (typeof name === "string") {
            const generated = casingsGenerator.generateName(name);
            return {
                originalName: generated.originalName,
                camelCase: generated.camelCase,
                pascalCase: generated.pascalCase,
                snakeCase: generated.snakeCase,
                screamingSnakeCase: generated.screamingSnakeCase
            };
        }
        return {
            originalName: name.originalName,
            camelCase: name.camelCase,
            pascalCase: name.pascalCase,
            snakeCase: name.snakeCase,
            screamingSnakeCase: name.screamingSnakeCase
        };
    };

    const inflateDynamicNameAndWireValue = (
        nwv: IrVersions.V66.dynamic.NameAndWireValueOrString
    ): IrVersions.V65.dynamic.NameAndWireValue => {
        if (typeof nwv === "string") {
            return {
                wireValue: nwv,
                name: inflateDynamicName(nwv)
            };
        }
        return {
            wireValue: nwv.wireValue,
            name: inflateDynamicName(nwv.name)
        };
    };

    const inflateDynamicFernFilepath = (
        fp: IrVersions.V66.dynamic.FernFilepath
    ): IrVersions.V65.dynamic.FernFilepath => ({
        allParts: fp.allParts.map(inflateDynamicName),
        packagePath: fp.packagePath.map(inflateDynamicName),
        file: fp.file != null ? inflateDynamicName(fp.file) : undefined
    });

    const inflateDynamicDeclaration = (
        decl: IrVersions.V66.dynamic.Declaration
    ): IrVersions.V65.dynamic.Declaration => ({
        fernFilepath: inflateDynamicFernFilepath(decl.fernFilepath),
        name: inflateDynamicName(decl.name)
    });

    const inflateDynamicNamedParameter = (
        param: IrVersions.V66.dynamic.NamedParameter
    ): IrVersions.V65.dynamic.NamedParameter => ({
        name: inflateDynamicNameAndWireValue(param.name),
        typeReference: param.typeReference,
        propertyAccess: param.propertyAccess,
        variable: param.variable
    });

    const inflateDynamicAuth = (auth: IrVersions.V66.dynamic.Auth): IrVersions.V65.dynamic.Auth => {
        switch (auth.type) {
            case "basic":
                return IrVersions.V65.dynamic.Auth.basic({
                    username: inflateDynamicName(auth.username),
                    password: inflateDynamicName(auth.password)
                });
            case "bearer":
                return IrVersions.V65.dynamic.Auth.bearer({
                    token: inflateDynamicName(auth.token)
                });
            case "header":
                return IrVersions.V65.dynamic.Auth.header({
                    header: inflateDynamicNamedParameter(auth.header)
                });
            case "oauth":
                return IrVersions.V65.dynamic.Auth.oauth({
                    clientId: inflateDynamicName(auth.clientId),
                    clientSecret: inflateDynamicName(auth.clientSecret)
                });
            case "inferred":
                return IrVersions.V65.dynamic.Auth.inferred({
                    parameters: auth.parameters != null ? auth.parameters.map(inflateDynamicNamedParameter) : undefined
                });
            default:
                assertNever(auth);
        }
    };

    const inflateDynamicSingleDiscriminatedUnionType = (
        sdu: IrVersions.V66.dynamic.SingleDiscriminatedUnionType
    ): IrVersions.V65.dynamic.SingleDiscriminatedUnionType => {
        switch (sdu.type) {
            case "samePropertiesAsObject":
                return IrVersions.V65.dynamic.SingleDiscriminatedUnionType.samePropertiesAsObject({
                    typeId: sdu.typeId,
                    discriminantValue: inflateDynamicNameAndWireValue(sdu.discriminantValue),
                    properties: sdu.properties.map(inflateDynamicNamedParameter)
                });
            case "singleProperty":
                return IrVersions.V65.dynamic.SingleDiscriminatedUnionType.singleProperty({
                    typeReference: sdu.typeReference,
                    discriminantValue: inflateDynamicNameAndWireValue(sdu.discriminantValue),
                    properties: sdu.properties != null ? sdu.properties.map(inflateDynamicNamedParameter) : undefined
                });
            case "noProperties":
                return IrVersions.V65.dynamic.SingleDiscriminatedUnionType.noProperties({
                    discriminantValue: inflateDynamicNameAndWireValue(sdu.discriminantValue),
                    properties: sdu.properties != null ? sdu.properties.map(inflateDynamicNamedParameter) : undefined
                });
            default:
                assertNever(sdu);
        }
    };

    const inflateDynamicNamedType = (nt: IrVersions.V66.dynamic.NamedType): IrVersions.V65.dynamic.NamedType => {
        switch (nt.type) {
            case "alias":
                return IrVersions.V65.dynamic.NamedType.alias({
                    declaration: inflateDynamicDeclaration(nt.declaration),
                    typeReference: nt.typeReference
                });
            case "enum":
                return IrVersions.V65.dynamic.NamedType.enum({
                    declaration: inflateDynamicDeclaration(nt.declaration),
                    values: nt.values.map(inflateDynamicNameAndWireValue)
                });
            case "object":
                return IrVersions.V65.dynamic.NamedType.object({
                    declaration: inflateDynamicDeclaration(nt.declaration),
                    properties: nt.properties.map(inflateDynamicNamedParameter),
                    extends: nt.extends,
                    additionalProperties: nt.additionalProperties
                });
            case "discriminatedUnion":
                return IrVersions.V65.dynamic.NamedType.discriminatedUnion({
                    declaration: inflateDynamicDeclaration(nt.declaration),
                    discriminant: inflateDynamicNameAndWireValue(nt.discriminant),
                    types: Object.fromEntries(
                        Object.entries(nt.types).map(([key, val]) => [
                            key,
                            inflateDynamicSingleDiscriminatedUnionType(val)
                        ])
                    )
                });
            case "undiscriminatedUnion":
                return IrVersions.V65.dynamic.NamedType.undiscriminatedUnion({
                    declaration: inflateDynamicDeclaration(nt.declaration),
                    types: nt.types
                });
            default:
                assertNever(nt);
        }
    };

    const inflateDynamicFileUploadRequestBodyProperty = (
        prop: IrVersions.V66.dynamic.FileUploadRequestBodyProperty
    ): IrVersions.V65.dynamic.FileUploadRequestBodyProperty => {
        switch (prop.type) {
            case "file":
                return IrVersions.V65.dynamic.FileUploadRequestBodyProperty.file(
                    inflateDynamicNameAndWireValue({ wireValue: prop.wireValue, name: prop.name })
                );
            case "fileArray":
                return IrVersions.V65.dynamic.FileUploadRequestBodyProperty.fileArray(
                    inflateDynamicNameAndWireValue({ wireValue: prop.wireValue, name: prop.name })
                );
            case "bodyProperty":
                return IrVersions.V65.dynamic.FileUploadRequestBodyProperty.bodyProperty(
                    inflateDynamicNamedParameter(prop)
                );
            default:
                assertNever(prop);
        }
    };

    const inflateDynamicInlinedRequestBody = (
        body: IrVersions.V66.dynamic.InlinedRequestBody
    ): IrVersions.V65.dynamic.InlinedRequestBody => {
        switch (body.type) {
            case "properties":
                return IrVersions.V65.dynamic.InlinedRequestBody.properties(
                    body.value.map(inflateDynamicNamedParameter)
                );
            case "referenced":
                return IrVersions.V65.dynamic.InlinedRequestBody.referenced({
                    bodyKey: inflateDynamicName(body.bodyKey),
                    bodyType: body.bodyType
                });
            case "fileUpload":
                return IrVersions.V65.dynamic.InlinedRequestBody.fileUpload({
                    properties: body.properties.map(inflateDynamicFileUploadRequestBodyProperty)
                });
            default:
                assertNever(body);
        }
    };

    const inflateDynamicRequest = (req: IrVersions.V66.dynamic.Request): IrVersions.V65.dynamic.Request => {
        switch (req.type) {
            case "body":
                return IrVersions.V65.dynamic.Request.body({
                    pathParameters:
                        req.pathParameters != null ? req.pathParameters.map(inflateDynamicNamedParameter) : undefined,
                    body: req.body
                });
            case "inlined":
                return IrVersions.V65.dynamic.Request.inlined({
                    declaration: inflateDynamicDeclaration(req.declaration),
                    pathParameters:
                        req.pathParameters != null ? req.pathParameters.map(inflateDynamicNamedParameter) : undefined,
                    queryParameters:
                        req.queryParameters != null ? req.queryParameters.map(inflateDynamicNamedParameter) : undefined,
                    headers: req.headers != null ? req.headers.map(inflateDynamicNamedParameter) : undefined,
                    body: req.body != null ? inflateDynamicInlinedRequestBody(req.body) : undefined,
                    metadata: req.metadata
                });
            default:
                assertNever(req);
        }
    };

    const inflateDynamicResponse = (resp: IrVersions.V66.dynamic.Response): IrVersions.V65.dynamic.Response => {
        switch (resp.type) {
            case "json":
                return IrVersions.V65.dynamic.Response.json();
            case "streaming":
                return IrVersions.V65.dynamic.Response.streaming();
            case "streamParameter":
                return IrVersions.V65.dynamic.Response.streamParameter();
            case "fileDownload":
                return IrVersions.V65.dynamic.Response.fileDownload();
            case "text":
                return IrVersions.V65.dynamic.Response.text();
            case "bytes":
                return IrVersions.V65.dynamic.Response.bytes();
            default:
                assertNever(resp);
        }
    };

    const inflateDynamicEndpoint = (ep: IrVersions.V66.dynamic.Endpoint): IrVersions.V65.dynamic.Endpoint => ({
        auth: ep.auth != null ? inflateDynamicAuth(ep.auth) : undefined,
        declaration: inflateDynamicDeclaration(ep.declaration),
        location: ep.location,
        request: inflateDynamicRequest(ep.request),
        response: inflateDynamicResponse(ep.response),
        examples: ep.examples
    });

    const inflateDynamicSingleBaseUrlEnvironment = (
        env: IrVersions.V66.dynamic.SingleBaseUrlEnvironment
    ): IrVersions.V65.dynamic.SingleBaseUrlEnvironment => ({
        id: env.id,
        name: inflateDynamicName(env.name),
        url: env.url,
        docs: env.docs
    });

    const inflateDynamicMultipleBaseUrlsEnvironment = (
        env: IrVersions.V66.dynamic.MultipleBaseUrlsEnvironment
    ): IrVersions.V65.dynamic.MultipleBaseUrlsEnvironment => ({
        id: env.id,
        name: inflateDynamicName(env.name),
        urls: env.urls,
        docs: env.docs
    });

    const inflateDynamicEnvironmentBaseUrlWithId = (
        baseUrl: IrVersions.V66.dynamic.EnvironmentBaseUrlWithId
    ): IrVersions.V65.dynamic.EnvironmentBaseUrlWithId => ({
        id: baseUrl.id,
        name: inflateDynamicName(baseUrl.name)
    });

    const inflateDynamicEnvironments = (
        envs: IrVersions.V66.dynamic.Environments
    ): IrVersions.V65.dynamic.Environments => {
        switch (envs.type) {
            case "singleBaseUrl":
                return IrVersions.V65.dynamic.Environments.singleBaseUrl({
                    environments: envs.environments.map(inflateDynamicSingleBaseUrlEnvironment)
                });
            case "multipleBaseUrls":
                return IrVersions.V65.dynamic.Environments.multipleBaseUrls({
                    baseUrls: envs.baseUrls.map(inflateDynamicEnvironmentBaseUrlWithId),
                    environments: envs.environments.map(inflateDynamicMultipleBaseUrlsEnvironment)
                });
            default:
                assertNever(envs);
        }
    };

    const inflateDynamicEnvironmentsConfig = (
        config: IrVersions.V66.dynamic.EnvironmentsConfig
    ): IrVersions.V65.dynamic.EnvironmentsConfig => ({
        defaultEnvironment: config.defaultEnvironment,
        environments: inflateDynamicEnvironments(config.environments)
    });

    const inflateDynamicVariableDeclaration = (
        vd: IrVersions.V66.dynamic.VariableDeclaration
    ): IrVersions.V65.dynamic.VariableDeclaration => ({
        id: vd.id,
        name: inflateName(vd.name),
        typeReference: vd.typeReference
    });

    const inflateDynamicIr = (
        dir: IrVersions.V66.dynamic.DynamicIntermediateRepresentation
    ): IrVersions.V65.dynamic.DynamicIntermediateRepresentation => {
        const inflatedDynamicTypes: Record<string, IrVersions.V65.dynamic.NamedType> = {};
        for (const [id, nt] of Object.entries(dir.types)) {
            inflatedDynamicTypes[id] = inflateDynamicNamedType(nt);
        }

        const inflatedDynamicEndpoints: Record<string, IrVersions.V65.dynamic.Endpoint> = {};
        for (const [id, ep] of Object.entries(dir.endpoints)) {
            inflatedDynamicEndpoints[id] = inflateDynamicEndpoint(ep);
        }

        return {
            version: dir.version,
            types: inflatedDynamicTypes,
            endpoints: inflatedDynamicEndpoints,
            environments: dir.environments != null ? inflateDynamicEnvironmentsConfig(dir.environments) : undefined,
            headers: dir.headers != null ? dir.headers.map(inflateDynamicNamedParameter) : undefined,
            pathParameters:
                dir.pathParameters != null ? dir.pathParameters.map(inflateDynamicNamedParameter) : undefined,
            variables: dir.variables != null ? dir.variables.map(inflateDynamicVariableDeclaration) : undefined,
            generatorConfig: dir.generatorConfig
        };
    };

    // ===== Build the inflated IR =====

    const inflatedTypes: Record<string, IrVersions.V65.TypeDeclaration> = {};
    for (const [id, td] of Object.entries(ir.types)) {
        inflatedTypes[id] = inflateTypeDeclaration(td);
    }

    const inflatedErrors: Record<string, IrVersions.V65.ErrorDeclaration> = {};
    for (const [id, err] of Object.entries(ir.errors)) {
        inflatedErrors[id] = inflateErrorDeclaration(err);
    }

    const inflatedServices: Record<string, IrVersions.V65.HttpService> = {};
    for (const [id, svc] of Object.entries(ir.services)) {
        inflatedServices[id] = inflateService(svc);
    }

    const inflatedWebhookGroups: Record<string, IrVersions.V65.webhooks.Webhook[]> = {};
    for (const [id, group] of Object.entries(ir.webhookGroups)) {
        inflatedWebhookGroups[id] = group.map(inflateWebhook);
    }

    const inflatedChannels: Record<string, IrVersions.V65.websocket.WebSocketChannel> | undefined =
        ir.websocketChannels != null
            ? Object.fromEntries(Object.entries(ir.websocketChannels).map(([id, ch]) => [id, inflateChannel(ch)]))
            : undefined;

    const inflatedSubpackages: Record<string, IrVersions.V65.Subpackage> = {};
    for (const [id, sp] of Object.entries(ir.subpackages)) {
        inflatedSubpackages[id] = inflateSubpackage(sp);
    }

    // Enumerate all fields explicitly so TypeScript can verify the return type matches V65.
    // casingsConfig is V66-only and is intentionally omitted.
    return {
        fdrApiDefinitionId: ir.fdrApiDefinitionId,
        apiVersion: ir.apiVersion != null ? inflateApiVersionScheme(ir.apiVersion) : undefined,
        apiName: inflateName(ir.apiName),
        apiDisplayName: ir.apiDisplayName,
        apiDocs: ir.apiDocs,
        auth: {
            docs: ir.auth.docs,
            requirement: ir.auth.requirement,
            schemes: ir.auth.schemes.map(inflateAuthScheme)
        },
        headers: ir.headers.map(inflateHeader),
        idempotencyHeaders: ir.idempotencyHeaders.map(inflateHeader),
        types: inflatedTypes,
        services: inflatedServices,
        webhookGroups: inflatedWebhookGroups,
        websocketChannels: inflatedChannels,
        errors: inflatedErrors,
        subpackages: inflatedSubpackages,
        rootPackage: {
            fernFilepath: inflateFernFilepath(ir.rootPackage.fernFilepath),
            service: ir.rootPackage.service,
            types: ir.rootPackage.types,
            errors: ir.rootPackage.errors,
            webhooks: ir.rootPackage.webhooks,
            websocket: ir.rootPackage.websocket,
            subpackages: ir.rootPackage.subpackages,
            hasEndpointsInTree: ir.rootPackage.hasEndpointsInTree,
            navigationConfig: ir.rootPackage.navigationConfig,
            docs: ir.rootPackage.docs
        },
        constants: {
            errorInstanceIdKey: inflateNameAndWireValue(ir.constants.errorInstanceIdKey)
        },
        environments: inflateEnvironmentsConfig(ir.environments),
        basePath: ir.basePath,
        pathParameters: ir.pathParameters.map(inflatePathParameter),
        errorDiscriminationStrategy: inflateErrorDiscriminationStrategy(ir.errorDiscriminationStrategy),
        sdkConfig: ir.sdkConfig,
        variables: ir.variables.map(inflateVariable),
        serviceTypeReferenceInfo: ir.serviceTypeReferenceInfo,
        readmeConfig: ir.readmeConfig,
        sourceConfig: ir.sourceConfig,
        publishConfig: ir.publishConfig,
        dynamic: ir.dynamic != null ? inflateDynamicIr(ir.dynamic) : undefined,
        selfHosted: ir.selfHosted,
        audiences: ir.audiences,
        generationMetadata: ir.generationMetadata,
        apiPlayground: ir.apiPlayground
    };
}
