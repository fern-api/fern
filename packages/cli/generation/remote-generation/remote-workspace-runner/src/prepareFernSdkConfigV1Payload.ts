import { generatorsYml } from "@fern-api/configuration";
import type { IntermediateRepresentation } from "@fern-api/ir-sdk";
import {
    FernConfigMappingError,
    mapFernConfigToSdkConfigV1,
    parseSdkConfigV1,
    type SdkConfigV1
} from "@postman/sdk-config/sdk-config/v1";
import { mapFernIrToSdkConfigApi } from "./mapFernIrToSdkConfigApi.js";
import type { GenerationConfigRoute } from "./sdk-gen-client/index.js";

export interface PrepareFernSdkConfigV1PayloadParameters {
    apiName: string;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    sdkVersion: string;
    audiences: generatorsYml.GeneratorGroup["audiences"];
    intermediateRepresentation: IntermediateRepresentation;
    route: GenerationConfigRoute;
}

export interface PreparedFernSdkConfigV1Payload {
    body: Buffer;
    package?: {
        packageName?: string;
        moduleName?: string;
        modulePath?: string;
        namespace?: string;
        groupId?: string;
        artifactId?: string;
    };
}

/** Maps one resolved Fern target to validated, customer-facing SDK Config v1 JSON bytes. */
export function prepareFernSdkConfigV1Payload({
    apiName,
    generatorInvocation,
    sdkVersion,
    audiences,
    intermediateRepresentation,
    route
}: PrepareFernSdkConfigV1PayloadParameters): PreparedFernSdkConfigV1Payload {
    const { sdkConfig, unsupportedFields } = mapFernConfigToSdkConfigV1({
        apiName,
        sdkVersion,
        apiVersion: intermediateRepresentation.specVersion,
        api: mapFernIrToSdkConfigApi(intermediateRepresentation),
        group: {
            audiences,
            generators: [
                {
                    ...generatorInvocation,
                    sdkLanguage: route.language,
                    sdkVersion
                }
            ]
        }
    });
    const behaviorRelevantUnsupportedFields = unsupportedFields.filter(
        (diagnostic) => !isSafeUnsupportedField(diagnostic)
    );
    if (behaviorRelevantUnsupportedFields.length > 0) {
        throw new FernSdkConfigUnsupportedFieldsError(behaviorRelevantUnsupportedFields);
    }

    const validated = parseSdkConfigV1(sdkConfig);
    const target = validated.targets[0];
    if (target == null) {
        throw new Error(`SDK Config mapping did not produce a target for ${generatorInvocation.name}`);
    }
    const effectivePackage = { ...validated.package, ...target.package };
    const packageIdentity = {
        ...(effectivePackage.packageName != null ? { packageName: effectivePackage.packageName } : {}),
        ...(effectivePackage.moduleName != null ? { moduleName: effectivePackage.moduleName } : {}),
        ...(effectivePackage.modulePath != null ? { modulePath: effectivePackage.modulePath } : {}),
        ...(effectivePackage.namespace != null ? { namespace: effectivePackage.namespace } : {}),
        ...(effectivePackage.groupId != null ? { groupId: effectivePackage.groupId } : {}),
        ...(effectivePackage.artifactId != null ? { artifactId: effectivePackage.artifactId } : {})
    };
    return {
        body: serializeSdkConfig(validated),
        ...(Object.keys(packageIdentity).length > 0 ? { package: packageIdentity } : {})
    };
}

export function formatFernSdkConfigMappingError(error: unknown): string {
    if (error instanceof FernSdkConfigUnsupportedFieldsError) {
        return error.diagnostics
            .map((diagnostic) => `${diagnostic.code} at ${diagnostic.path.join(".")}: ${diagnostic.reason}`)
            .join("; ");
    }
    if (error instanceof FernConfigMappingError) {
        return error.issues.map((issue) => `${issue.code} at ${issue.path.join(".")}: ${issue.reason}`).join("; ");
    }
    return error instanceof Error ? error.message : "Unknown SDK Config mapping failure";
}

type FernMappingDiagnostic = ReturnType<typeof mapFernConfigToSdkConfigV1>["unsupportedFields"][number];

export class FernSdkConfigUnsupportedFieldsError extends Error {
    public override readonly name = "FernSdkConfigUnsupportedFieldsError";

    public constructor(public readonly diagnostics: FernMappingDiagnostic[]) {
        super(
            diagnostics
                .map((diagnostic) => `${diagnostic.code} at ${diagnostic.path.join(".")}: ${diagnostic.reason}`)
                .join("; ")
        );
    }
}

const SAFE_RESOLVED_FIELDS = new Set(["apiOverride", "automation"]);

function isSafeUnsupportedField(diagnostic: FernMappingDiagnostic): boolean {
    if (diagnostic.code === "FERN_OUTPUT_CREDENTIAL_UNSUPPORTED") {
        return true;
    }
    if (diagnostic.code !== "FERN_RESOLVED_FIELD_UNSUPPORTED") {
        return false;
    }
    const field = diagnostic.path.at(-1);
    return typeof field === "string" && SAFE_RESOLVED_FIELDS.has(field);
}

function serializeSdkConfig(sdkConfig: SdkConfigV1): Buffer {
    return Buffer.from(JSON.stringify(sdkConfig), "utf8");
}
