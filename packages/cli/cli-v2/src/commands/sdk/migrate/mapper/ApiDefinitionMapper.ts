import { type FernConfigMappingDiagnostic, type SdkConfigV1ApiConfigInput } from "@postman/sdk-config/sdk-config/v1";
import type { ApiDefinition } from "../../../../api/config/ApiDefinition.js";

type Environment = NonNullable<ApiDefinition["environments"]>[string];

export declare namespace ApiDefinitionMapper {
    export interface Result {
        api: SdkConfigV1ApiConfigInput;
        diagnostics: FernConfigMappingDiagnostic[];
    }
}

/** Maps a resolved Fern API definition to the SDK Config API block. */
export class ApiDefinitionMapper {
    public map(definition: ApiDefinition): ApiDefinitionMapper.Result {
        const environments = Object.entries(definition.environments ?? {}).map(([name, environment]) => ({
            name,
            urls: this.mapEnvironmentUrls(environment),
            ...(typeof environment === "string" || environment.docs == null ? {} : { description: environment.docs })
        }));
        const headers = Object.entries(definition.headers ?? {}).map(([headerName, header]) =>
            typeof header === "string"
                ? { name: headerName, value: header }
                : {
                      name: header.name ?? headerName,
                      ...(header.env == null ? {} : { environmentVariable: header.env }),
                      ...(header.docs == null ? {} : { description: header.docs })
                  }
        );
        const diagnostics: FernConfigMappingDiagnostic[] = [];
        if (definition.auth != null || definition.authSchemes != null) {
            diagnostics.push({
                code: "FERN_API_AUTH_REQUIRES_REVIEW",
                severity: "warning",
                path: ["api", "auth"],
                reason: "Fern API authentication cannot yet be represented safely by this migration command",
                sdkConfigPath: ["api", "auth"],
                suggestedAction: "Review the Fern auth schemes and configure api.auth manually in SDK Config v1."
            });
        }
        return {
            api: {
                ...(definition.defaultUrl == null ? {} : { baseUrl: definition.defaultUrl }),
                ...(definition.defaultEnvironment == null ? {} : { defaultEnvironment: definition.defaultEnvironment }),
                ...(environments.length === 0 ? {} : { environments }),
                ...(headers.length === 0 ? {} : { headers })
            },
            diagnostics
        };
    }

    private mapEnvironmentUrls(environment: Environment): Array<{ name: string; url: string }> {
        if (typeof environment === "string") {
            return [{ name: "default", url: environment }];
        }
        if ("url" in environment) {
            return [{ name: "default", url: environment.url }];
        }
        return Object.entries(environment.urls).map(([name, url]) => ({ name, url }));
    }
}
