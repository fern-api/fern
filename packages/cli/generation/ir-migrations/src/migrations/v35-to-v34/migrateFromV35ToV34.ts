import { GeneratorName } from "@fern-api/configuration-loader";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V35_TO_V34_MIGRATION: IrMigration<
    IrVersions.V35.ir.IntermediateRepresentation,
    IrVersions.V34.ir.IntermediateRepresentation
> = {
    laterVersion: "v35",
    earlierVersion: "v34",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
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
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: "0.18.0",
        [GeneratorName.GO_MODEL]: "0.18.0",
        [GeneratorName.GO_SDK]: "0.18.0",
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V34.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (V35): IrVersions.V34.ir.IntermediateRepresentation => {
        return {
            ...V35,
            services: Object.fromEntries(
                Object.entries(V35.services).map(([id, service]) => [
                    id,
                    {
                        ...service,
                        endpoints: service.endpoints.map((endpoint) => ({
                            docs: endpoint.docs,
                            availability: endpoint.availability,
                            id: endpoint.id,
                            name: endpoint.name,
                            displayName: endpoint.displayName,
                            method: endpoint.method,
                            headers: endpoint.headers,
                            baseUrl: endpoint.baseUrl,
                            path: endpoint.path,
                            fullPath: endpoint.fullPath,
                            pathParameters: endpoint.pathParameters,
                            allPathParameters: endpoint.allPathParameters,
                            queryParameters: endpoint.queryParameters,
                            requestBody: endpoint.requestBody,
                            sdkRequest: endpoint.sdkRequest,
                            response: endpoint.response,
                            errors: endpoint.errors,
                            auth: endpoint.auth,
                            idempotent: endpoint.idempotent,
                            examples: endpoint.examples
                        }))
                    }
                ])
            )
        };
    }
};
