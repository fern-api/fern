import { GeneratorName } from "@fern-api/configuration-loader";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V58_TO_V57_MIGRATION: IrMigration<
    IrVersions.V58.ir.IntermediateRepresentation,
    IrVersions.V57.ir.IntermediateRepresentation
> = {
    laterVersion: "v58",
    earlierVersion: "v57",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "1.2.0",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "1.2.0",
        [GeneratorName.TYPESCRIPT]: "1.2.0",
        [GeneratorName.TYPESCRIPT_SDK]: "1.2.0",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.18.0",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: "2.36.5",
        [GeneratorName.JAVA_SPRING]: "1.6.1",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: "1.7.0",
        [GeneratorName.PYTHON_PYDANTIC]: "1.5.0",
        [GeneratorName.PYTHON_SDK]: "4.21.0",
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: "1.1.0",
        [GeneratorName.GO_MODEL]: "1.1.0",
        [GeneratorName.GO_SDK]: "1.1.0",
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: "1.17.5",
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: "1.15.1"
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V57.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v58): IrVersions.V57.ir.IntermediateRepresentation => {
        return {
            ...v58,
            services: v58.services != null ? convertServicesIr(v58.services) : undefined,
            dynamic: v58.dynamic != null ? convertDynamicIr(v58.dynamic) : undefined
        } as IrVersions.V57.ir.IntermediateRepresentation;
    }
};

function convertServicesIr(
    services: Record<string, IrVersions.V58.http.HttpService>
): Record<string, IrVersions.V57.http.HttpService> {
    return Object.fromEntries(Object.entries(services).map(([key, service]) => [key, convertServiceIr(service)]));
}

function convertServiceIr(service: IrVersions.V58.http.HttpService): IrVersions.V57.http.HttpService {
    return {
        ...service,
        endpoints: convertEndpointsIr(service.endpoints)
    };
}

function convertEndpointsIr(endpoints: IrVersions.V58.http.HttpEndpoint[]): IrVersions.V57.http.HttpEndpoint[] {
    return endpoints.map(convertEndpointIr).filter((endpoint) => endpoint != null);
}

function convertEndpointIr(endpoint: IrVersions.V58.http.HttpEndpoint): IrVersions.V57.http.HttpEndpoint | undefined {
    const method = endpoint.method;
    if (method === "HEAD") {
        // HEAD methods can dropped entirely.
        return undefined;
    }
    return {
        ...endpoint,
        method: endpoint.method as IrVersions.V57.http.HttpMethod
    };
}

function convertDynamicIr(
    ir: IrVersions.V58.dynamic.DynamicIntermediateRepresentation
): IrVersions.V57.dynamic.DynamicIntermediateRepresentation {
    return {
        ...ir,
        endpoints: convertDynamicEndpoints(ir.endpoints)
    };
}

function convertDynamicEndpoints(
    endpoints: Record<string, IrVersions.V58.dynamic.Endpoint>
): Record<string, IrVersions.V57.dynamic.Endpoint> {
    return Object.fromEntries(
        Object.entries(endpoints)
            .map(([key, endpoint]) => [key, convertDynamicEndpoint(endpoint)])
            .filter(([_, endpoint]) => endpoint != null)
    );
}

function convertDynamicEndpoint(
    endpoint: IrVersions.V58.dynamic.Endpoint
): IrVersions.V57.dynamic.Endpoint | undefined {
    const method = endpoint.location.method;
    if (method === "HEAD") {
        // HEAD methods can dropped entirely.
        return undefined;
    }
    return {
        ...endpoint,
        examples: endpoint.examples != null ? convertDynamicExamples(endpoint.examples) : undefined,
        location: {
            ...endpoint.location,
            method
        }
    };
}

function convertDynamicExamples(
    examples: IrVersions.V58.dynamic.EndpointExample[]
): IrVersions.V57.dynamic.EndpointExample[] {
    return examples.map((example) => convertDynamicExample(example)).filter((example) => example != null);
}

function convertDynamicExample(
    example: IrVersions.V58.dynamic.EndpointExample
): IrVersions.V57.dynamic.EndpointExample | undefined {
    const method = example.endpoint.method;
    if (method === "HEAD") {
        // HEAD methods can dropped entirely.
        return undefined;
    }
    return {
        ...example,
        endpoint: {
            ...example.endpoint,
            method
        }
    };
}
