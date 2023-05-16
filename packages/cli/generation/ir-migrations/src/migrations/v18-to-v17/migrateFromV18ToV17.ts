import { GeneratorName } from "@fern-api/generators-configuration";
import { mapValues } from "lodash-es";
import { IrVersions } from "../../ir-versions";
import { AlwaysRunMigration, IrMigration } from "../../types/IrMigration";

export const V18_TO_V17_MIGRATION: IrMigration<
    IrVersions.V18.ir.IntermediateRepresentation,
    IrVersions.V17.ir.IntermediateRepresentation
> = {
    laterVersion: "v18",
    earlierVersion: "v17",
    minGeneratorVersionsToExclude: {
        [GeneratorName.TYPESCRIPT]: AlwaysRunMigration,
        [GeneratorName.TYPESCRIPT_SDK]: "0.5.14-1-ga6817141",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.5.14-1-ga6817141",
        [GeneratorName.JAVA]: AlwaysRunMigration,
        [GeneratorName.JAVA_MODEL]: AlwaysRunMigration,
        [GeneratorName.JAVA_SDK]: AlwaysRunMigration,
        [GeneratorName.JAVA_SPRING]: AlwaysRunMigration,
        [GeneratorName.PYTHON_FASTAPI]: "0.3.0-3-ge125e311",
        [GeneratorName.PYTHON_PYDANTIC]: "0.3.0-3-ge125e311",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: AlwaysRunMigration,
        [GeneratorName.OPENAPI]: AlwaysRunMigration,
        [GeneratorName.STOPLIGHT]: AlwaysRunMigration,
        [GeneratorName.POSTMAN]: AlwaysRunMigration,
        [GeneratorName.PYTHON_SDK]: "0.3.0-3-ge125e311",
        [GeneratorName.GO_MODEL]: AlwaysRunMigration,
    },
    migrateBackwards: (v18, { taskContext, targetGenerator }): IrVersions.V17.ir.IntermediateRepresentation => {
        return {
            ...v18,
            services: mapValues(v18.services, (service) => {
                const baseUrl = service.endpoints[0]?.baseUrl;

                if (service.endpoints.some((endpoint) => endpoint.baseUrl !== baseUrl)) {
                    return taskContext.failAndThrow(
                        targetGenerator != null
                            ? `Generator ${targetGenerator.name}@${targetGenerator.version}` +
                                  " does not support endpoint-level server URLs." +
                                  ` If you'd like to use this feature, please upgrade ${targetGenerator.name}` +
                                  " to a compatible version."
                            : "Cannot backwards-migrate IR because this IR contains endpoint-level server URLs."
                    );
                }

                return {
                    ...service,
                    baseUrl,
                };
            }),
        };
    },
};
