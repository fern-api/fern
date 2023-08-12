import { identity } from "@fern-api/core-utils";
import { GeneratorName } from "@fern-api/generators-configuration";
import { mapValues } from "lodash-es";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration,
} from "../../types/IrMigration";

export const V13_TO_V12_MIGRATION: IrMigration<
    IrVersions.V13.ir.IntermediateRepresentation,
    IrVersions.V12.ir.IntermediateRepresentation
> = {
    laterVersion: "v13",
    earlierVersion: "v12",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_SDK]: GeneratorWasNotCreatedYet,
    },
    serializeLaterVersion: identity,
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
