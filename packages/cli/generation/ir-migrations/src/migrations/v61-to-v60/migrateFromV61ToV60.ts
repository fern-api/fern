import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";
import { expandName } from "@fern-api/ir-utils";

export const V61_TO_V60_MIGRATION: IrMigration<
    IrVersions.V61.ir.IntermediateRepresentation,
    IrVersions.V60.ir.IntermediateRepresentation
> = {
    laterVersion: "v61",
    earlierVersion: "v60",
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
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V60.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (
        v61: IrVersions.V61.IntermediateRepresentation
    ): IrVersions.V60.ir.IntermediateRepresentation => {
        return {
            ...v61,
            apiVersion: v61.apiVersion != null ? convertApiVersionScheme(v61.apiVersion) : undefined,
            apiName: expandName(v61.apiName),
            auth: convertAuth(v61.auth),
            headers: convertHeaders(v61.headers),
            idempotencyHeaders: convertHeaders(v61.idempotencyHeaders),
            types: convertTypes(v61.types),
            services: convertServices(v61.services),
            webhookGroups: convertWebhookGroups(v61.webhookGroups),
            websocketChannels: v61.websocketChannels != null ? convertWebsocketChannels(v61.websocketChannels) : undefined,
            errors: convertErrors(v61.errors),
            subpackages: convertSubpackages(v61.subpackages),
            rootPackage: convertRootPackage(v61.rootPackage),
            constants: convertConstants(v61.constants),
            environments: v61.environments != null ? convertEnvironments(v61.environments) : undefined,
            pathParameters: convertPathParameters(v61.pathParameters),
            errorDiscriminationStrategy: convertErrorDiscriminationStrategy(v61.errorDiscriminationStrategy),
            variables: convertVariables(v61.variables),
            dynamic: v61.dynamic != null ? convertDynamic(v61.dynamic) : undefined,
        };
    }
};

function convertApiVersionScheme(apiVersion: IrVersions.V61.ApiVersionScheme): IrVersions.V60.ApiVersionScheme {
}

function convertAuth(auth: IrVersions.V61.ApiAuth): IrVersions.V60.ApiAuth {
}

function convertHeaders(headers: IrVersions.V61.HttpHeader[]): IrVersions.V60.HttpHeader[] {
}

function convertTypes(types: Record<IrVersions.V61.TypeId, IrVersions.V61.TypeDeclaration>): Record<IrVersions.V60.TypeId, IrVersions.V60.TypeDeclaration> {
}

function convertErrors(errors: Record<IrVersions.V61.ErrorId, IrVersions.V61.ErrorDeclaration>): Record<IrVersions.V60.ErrorId, IrVersions.V60.ErrorDeclaration> {
}

function convertServices(services: Record<IrVersions.V61.ServiceId, IrVersions.V61.HttpService>): Record<IrVersions.V60.ServiceId, IrVersions.V60.HttpService> {
}

function convertWebhookGroups(webhookGroups: Record<IrVersions.V61.WebhookGroupId, IrVersions.V61.WebhookGroup>): Record<IrVersions.V60.WebhookGroupId, IrVersions.V60.WebhookGroup> {
}

function convertWebsocketChannels(websocketChannels: Record<IrVersions.V61.WebSocketChannelId, IrVersions.V61.WebSocketChannel>): Record<IrVersions.V60.WebSocketChannelId, IrVersions.V60.WebSocketChannel> {
}

function convertSubpackages(subpackages: Record<IrVersions.V61.SubpackageId, IrVersions.V61.Subpackage>): Record<IrVersions.V60.SubpackageId, IrVersions.V60.Subpackage> {
}

function convertRootPackage(rootPackage: IrVersions.V61.Package): IrVersions.V60.Package {
}

function convertConstants(constants: IrVersions.V61.Constants): IrVersions.V60.Constants {
}

function convertEnvironments(environments: IrVersions.V61.EnvironmentsConfig): IrVersions.V60.EnvironmentsConfig {
}

function convertPathParameters(pathParameters: IrVersions.V61.PathParameter[]): IrVersions.V60.PathParameter[] {
}

function convertErrorDiscriminationStrategy(errorDiscriminationStrategy: IrVersions.V61.ErrorDiscriminationStrategy): IrVersions.V60.ErrorDiscriminationStrategy {
}

function convertVariables(variables: IrVersions.V61.VariableDeclaration[]): IrVersions.V60.VariableDeclaration[] {
}

function convertDynamic(dynamic: IrVersions.V61.dynamic.DynamicIntermediateRepresentation): IrVersions.V60.dynamic.DynamicIntermediateRepresentation {
}
