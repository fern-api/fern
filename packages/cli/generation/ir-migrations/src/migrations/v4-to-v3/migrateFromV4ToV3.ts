import { IrVersions } from "../../ir-versions";
import { GeneratorName } from "../../types/GeneratorName";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V4_TO_V3_MIGRATION: IrMigration<
    IrVersions.V4.ir.IntermediateRepresentation,
    IrVersions.V3.ir.IntermediateRepresentation
> = {
    earlierVersion: "v3",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: AlwaysRunMigration,
        [GeneratorName.PYTHON_PYDANTIC]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
    },
    migrateBackwards: (v4): IrVersions.V3.ir.IntermediateRepresentation => {
        return {
            apiName: v4.apiName,
            auth: v4.auth,
            headers: v4.headers,
            types: v4.types.map(
                (v4Type): IrVersions.V3.types.TypeDeclaration => ({
                    docs: v4Type.docs,
                    availability: v4Type.availability,
                    name: v4Type.name,
                    shape: v4Type.shape,
                    examples: v4Type.examples.map(
                        (v4Example): IrVersions.V3.types.ExampleType => convertExampleType(v4Example.shape)
                    ),
                    referencedTypes: v4Type.referencedTypes,
                })
            ),
            errors: v4.errors,
            constants: v4.constants,
            constantsV2: v4.constantsV2,
            defaultEnvironment: v4.defaultEnvironment,
            environments: v4.environments,
            errorDiscriminant: v4.errorDiscriminant,
            errorDiscriminationStrategy: v4.errorDiscriminationStrategy,
            sdkConfig: v4.sdkConfig,
            services: v4.services,
        };
    },
};

function convertExampleType(v4Example: IrVersions.V4.types.ExampleTypeShape): IrVersions.V3.types.ExampleType {
    return IrVersions.V4.types.ExampleTypeShape._visit<IrVersions.V3.types.ExampleType>(v4Example, {
        object: (exampleObject) => IrVersions.V3.types.ExampleType.object(convertExampleObject(exampleObject)),
        union: (exampleUnion) => IrVersions.V3.types.ExampleType.union(convertExampleUnion(exampleUnion)),
        alias: (exampleAlias) => IrVersions.V3.types.ExampleType.alias(convertExampleAlias(exampleAlias)),
        enum: IrVersions.V3.types.ExampleType.enum,
        _unknown: () => {
            throw new Error("Unknown ExampleTypeShape: " + v4Example.type);
        },
    });
}

function convertExampleObject(v4Example: IrVersions.V4.types.ExampleObjectType): IrVersions.V3.types.ExampleObjectType {
    return {
        properties: v4Example.properties.map(
            (property): IrVersions.V3.types.ExampleObjectProperty => ({
                wireKey: property.wireKey,
                value: convertExampleTypeReference(property.value),
                originalTypeDeclaration: property.originalTypeDeclaration,
            })
        ),
    };
}

function convertExampleTypeReference(
    v4Example: IrVersions.V4.types.ExampleTypeReference
): IrVersions.V3.types.ExampleTypeReference {
    return IrVersions.V4.types.ExampleTypeReference._visit<IrVersions.V3.types.ExampleTypeReference>(v4Example, {
        primitive: IrVersions.V3.types.ExampleTypeReference.primitive,
        container: (containerExample) =>
            IrVersions.V3.types.ExampleTypeReference.container(convertContainerExample(containerExample)),
        named: (namedExample) => IrVersions.V3.types.ExampleTypeReference.named(convertNamedExample(namedExample)),
        unknown: IrVersions.V3.types.ExampleTypeReference.unknown,
        _unknown: () => {
            throw new Error("Unknown ExampleTypeReference: " + v4Example.type);
        },
    });
}

function convertContainerExample(
    v4Example: IrVersions.V4.types.ExampleContainer
): IrVersions.V3.types.ExampleContainer {
    return IrVersions.V4.types.ExampleContainer._visit<IrVersions.V3.types.ExampleContainer>(v4Example, {
        list: (exampleItems) =>
            IrVersions.V3.types.ExampleContainer.list(exampleItems.map(convertExampleTypeReference)),
        set: (exampleItems) => IrVersions.V3.types.ExampleContainer.set(exampleItems.map(convertExampleTypeReference)),
        optional: (exampleItem) =>
            IrVersions.V3.types.ExampleContainer.optional(
                exampleItem != null ? convertExampleTypeReference(exampleItem) : undefined
            ),
        map: (examplePairs) =>
            IrVersions.V3.types.ExampleContainer.map(
                examplePairs.map((pair) => ({
                    key: convertExampleTypeReference(pair.key),
                    value: convertExampleTypeReference(pair.value),
                }))
            ),
        _unknown: () => {
            throw new Error("Unknown ExampleContainer: " + v4Example.type);
        },
    });
}

function convertNamedExample(v4Example: IrVersions.V4.types.ExampleNamedType): IrVersions.V3.types.ExampleNamedType {
    return {
        typeName: v4Example.typeName,
        shape: convertExampleType(v4Example.shape),
    };
}

function convertExampleUnion(
    v4Example: IrVersions.V4.types.ExampleSingleUnionType
): IrVersions.V3.types.ExampleSingleUnionType {
    return {
        wireDiscriminantValue: v4Example.wireDiscriminantValue,
        properties:
            IrVersions.V4.types.ExampleSingleUnionTypeProperties._visit<IrVersions.V3.types.ExampleSingleUnionTypeProperties>(
                v4Example.properties,
                {
                    samePropertiesAsObject: (namedExample) =>
                        IrVersions.V3.types.ExampleSingleUnionTypeProperties.samePropertiesAsObject(
                            convertNamedExample(namedExample)
                        ),
                    singleProperty: (propertyExample) =>
                        IrVersions.V3.types.ExampleSingleUnionTypeProperties.singleProperty(
                            convertExampleTypeReference(propertyExample)
                        ),
                    noProperties: () => IrVersions.V3.types.ExampleSingleUnionTypeProperties.noProperties(),
                    _unknown: () => {
                        throw new Error("Unknown ExampleSingleUnionTypeProperties: " + v4Example.properties.type);
                    },
                }
            ),
    };
}

function convertExampleAlias(v4Example: IrVersions.V4.types.ExampleAliasType): IrVersions.V3.types.ExampleAliasType {
    return {
        value: convertExampleTypeReference(v4Example.value),
    };
}
