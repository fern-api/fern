import { GeneratorName } from "@fern-api/generators-configuration";
import { mapValues } from "lodash-es";
import { IrVersions } from "../../ir-versions";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V13_TO_V12_MIGRATION: IrMigration<
    IrVersions.V13.ir.IntermediateRepresentation,
    IrVersions.V12.ir.IntermediateRepresentation
> = {
    laterVersion: "v13",
    earlierVersion: "v12",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_EXPRESS]: AlwaysRunMigration,
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA_SPRING]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: AlwaysRunMigration,
        [GeneratorName.PYTHON_PYDANTIC]: AlwaysRunMigration,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.STOPLIGHT]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
        [GeneratorName.PYTHON_SDK]: undefined,
        [GeneratorName.GO_MODEL]: undefined,
    },
    migrateBackwards: (v13): IrVersions.V12.ir.IntermediateRepresentation => {
        return {
            ...v13,
            types: mapValues(v13.types, (type) => {
                if (type.shape._type !== "undiscriminatedUnion") {
                    return {
                        ...type,
                        shape: type.shape,
                    };
                }
                return {
                    ...type,
                    shape: IrVersions.V12.types.Type.undiscriminatedUnion({
                        docs: undefined,
                        members: type.shape.members,
                    }),
                };
            }),
            auth: {
                ...v13.auth,
                schemes: v13.auth.schemes.map((scheme) => {
                    if (scheme._type !== "header") {
                        return scheme;
                    }
                    return {
                        ...scheme,
                        name: scheme.name.name,
                        header: scheme.name.wireValue,
                    };
                }),
            },
        };
    },
};
