import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V18_TO_V17_MIGRATION: IrMigration<
    IrVersions.V18.ir.IntermediateRepresentation,
    IrVersions.V17.ir.IntermediateRepresentation
> = {
    laterVersion: "v18",
    earlierVersion: "v17",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "0.5.14-1-ga6817141",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.5.14-1-ga6817141",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: "0.3.0-3-ge125e311",
        [GeneratorName.PYTHON_PYDANTIC]: "0.3.0-3-ge125e311",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: "0.3.0-3-ge125e311",
        [GeneratorName.GO_FIBER]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) => ir,
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
                    baseUrl
                };
            })
        };
    }
};
