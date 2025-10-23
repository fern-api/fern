import { GeneratorName } from "@fern-api/configuration-loader";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V61_TO_V60_MIGRATION: IrMigration<
    IrVersions.V61.ir.IntermediateRepresentation,
    IrVersions.V60.ir.IntermediateRepresentation
> = {
    laterVersion: "v61",
    earlierVersion: "v60",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "3.7.2",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "3.7.2",
        [GeneratorName.TYPESCRIPT]: "3.7.2",
        [GeneratorName.TYPESCRIPT_SDK]: "3.7.2",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "3.7.2",
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
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: "0.0.4",
        [GeneratorName.CSHARP_SDK]: "2.4.0",
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: "0.7.2"
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V60.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough", // Changed from "strip" to preserve isOptional flags
            skipValidation: true
        }),
    migrateBackwards: (
        v61: IrVersions.V61.IntermediateRepresentation
    ): IrVersions.V60.ir.IntermediateRepresentation => {
        return {
            ...v61,
            dynamic: v61.dynamic != null ? convertDynamic(v61.dynamic) : undefined,
            publishConfig: v61.publishConfig != null ? convertPublishConfig(v61.publishConfig) : undefined
        };
    }
};

function convertPublishConfig(
    publishConfig: IrVersions.V61.PublishingConfig
): IrVersions.V60.PublishingConfig | undefined {
    return IrVersions.V61.PublishingConfig._visit<IrVersions.V60.PublishingConfig | undefined>(publishConfig, {
        github: (github) => {
            const convertedTarget = convertPublishTarget(github.target);
            return convertedTarget != null
                ? IrVersions.V60.PublishingConfig.github({
                      ...github,
                      target: convertedTarget
                  })
                : undefined;
        },
        direct: (direct) => {
            const convertedTarget = convertPublishTarget(direct.target);
            return convertedTarget != null
                ? IrVersions.V60.PublishingConfig.direct({
                      target: convertedTarget
                  })
                : undefined;
        },
        filesystem: (filesystem) => {
            const convertedTarget =
                filesystem.publishTarget != null ? convertPublishTarget(filesystem.publishTarget) : undefined;
            return IrVersions.V60.PublishingConfig.filesystem({
                generateFullProject: filesystem.generateFullProject,
                publishTarget: convertedTarget
            });
        },
        _other: () => undefined
    });
}

function convertPublishTarget(target: IrVersions.V61.PublishTarget): IrVersions.V60.PublishTarget | undefined {
    return IrVersions.V61.PublishTarget._visit<IrVersions.V60.PublishTarget | undefined>(target, {
        postman: IrVersions.V60.PublishTarget.postman,
        npm: IrVersions.V60.PublishTarget.npm,
        maven: IrVersions.V60.PublishTarget.maven,
        pypi: IrVersions.V60.PublishTarget.pypi,
        crates: (crates) => {
            // Convert crates to pypi for backward compatibility (v60 doesn't have crates)
            return IrVersions.V60.PublishTarget.pypi({
                version: crates.version,
                packageName: crates.packageName
            });
        },
        _other: () => undefined
    });
}

function convertDynamic(
    dynamic: IrVersions.V61.dynamic.DynamicIntermediateRepresentation
): IrVersions.V60.dynamic.DynamicIntermediateRepresentation {
    return {
        ...dynamic,
        endpoints: convertDynamicEndpoints(dynamic.endpoints),
        generatorConfig: dynamic.generatorConfig != null ? convertGeneratorConfig(dynamic.generatorConfig) : undefined
    };
}

function convertGeneratorConfig(
    config: IrVersions.V61.dynamic.GeneratorConfig
): IrVersions.V60.dynamic.GeneratorConfig {
    return {
        ...config,
        outputConfig: convertGeneratorOutputConfig(config.outputConfig)
    };
}

function convertGeneratorOutputConfig(
    outputConfig: IrVersions.V61.dynamic.GeneratorOutputConfig
): IrVersions.V60.dynamic.GeneratorOutputConfig {
    return IrVersions.V61.dynamic.GeneratorOutputConfig._visit<IrVersions.V60.dynamic.GeneratorOutputConfig>(
        outputConfig,
        {
            publish: (publishInfo) => {
                const converted = convertPublishInfo(publishInfo);
                // If crates was stripped (not supported in v60), fallback to local mode
                return converted != null
                    ? IrVersions.V60.dynamic.GeneratorOutputConfig.publish(converted)
                    : IrVersions.V60.dynamic.GeneratorOutputConfig.local();
            },
            local: IrVersions.V60.dynamic.GeneratorOutputConfig.local,
            _other: IrVersions.V60.dynamic.GeneratorOutputConfig.local
        }
    );
}

function convertPublishInfo(
    publishInfo: IrVersions.V61.dynamic.PublishInfo
): IrVersions.V60.dynamic.PublishInfo | undefined {
    return IrVersions.V61.dynamic.PublishInfo._visit<IrVersions.V60.dynamic.PublishInfo | undefined>(publishInfo, {
        go: IrVersions.V60.dynamic.PublishInfo.go,
        swift: () => undefined,
        maven: IrVersions.V60.dynamic.PublishInfo.maven,
        npm: IrVersions.V60.dynamic.PublishInfo.npm,
        nuget: IrVersions.V60.dynamic.PublishInfo.nuget,
        pypi: IrVersions.V60.dynamic.PublishInfo.pypi,
        rubygems: IrVersions.V60.dynamic.PublishInfo.rubygems,
        // crates publish target is not supported in v60, return undefined
        crates: () => undefined,
        _other: () => undefined
    });
}

function convertDynamicEndpoints(
    endpoints: Record<IrVersions.V61.dynamic.EndpointId, IrVersions.V61.dynamic.Endpoint>
): Record<IrVersions.V60.dynamic.EndpointId, IrVersions.V60.dynamic.Endpoint> {
    return Object.fromEntries(
        Object.entries(endpoints)
            .map(([key, endpoint]) => [key, convertDynamicEndpoint(endpoint)])
            .filter(([_, endpoint]) => endpoint != null)
    );
}

function convertDynamicEndpoint(
    endpoint: IrVersions.V61.dynamic.Endpoint
): IrVersions.V60.dynamic.Endpoint | undefined {
    return {
        ...endpoint,
        response: convertDynamicEndpointResponse(endpoint.response)
    };
}

function convertDynamicEndpointResponse(response: IrVersions.V61.dynamic.Response): IrVersions.V60.dynamic.Response {
    return IrVersions.V61.dynamic.Response._visit<IrVersions.V60.dynamic.Response>(response, {
        json: IrVersions.V60.dynamic.Response.json,
        streaming: IrVersions.V60.dynamic.Response.json,
        streamParameter: IrVersions.V60.dynamic.Response.json,
        fileDownload: IrVersions.V60.dynamic.Response.json,
        text: IrVersions.V60.dynamic.Response.json,
        bytes: IrVersions.V60.dynamic.Response.json,
        _other: IrVersions.V60.dynamic.Response.json
    });
}
