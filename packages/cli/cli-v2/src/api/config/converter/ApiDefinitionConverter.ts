import type { schemas } from "@fern-api/config";
import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { isNullish, type Sourced } from "@fern-api/source";
import { ValidationIssue } from "@fern-api/yaml-loader";
import type { FernYmlSchemaLoader } from "../../../config/fern-yml/FernYmlSchemaLoader";
import type { ApiDefinition } from "../ApiDefinition";
import type { ApiSpec } from "../ApiSpec";
import type { AsyncApiSpec } from "../AsyncApiSpec";
import type { ConjureSpec } from "../ConjureSpec";
import type { FernSpec } from "../FernSpec";
import type { OpenApiSpec } from "../OpenApiSpec";
import type { OpenRpcSpec } from "../OpenRpcSpec";
import type { ProtobufDefinition, ProtobufSpec } from "../ProtobufSpec";

/**
 * The key used for the single API definition when using the 'api' field.
 */
export const DEFAULT_API_NAME = "api";

export namespace ApiDefinitionConverter {
    export type Result = Success | Failure;

    export interface Success {
        success: true;
        apis: Record<string, ApiDefinition>;
    }

    export interface Failure {
        success: false;
        issues: ValidationIssue[];
    }
}

/**
 * Converts the apis section of a sourced fern.yml to ApiDefinitions.
 *
 * Resolves all relative paths to absolute paths based on the fern.yml location.
 */
export class ApiDefinitionConverter {
    private readonly cwd: AbsoluteFilePath;
    private readonly issues: ValidationIssue[] = [];

    constructor({ cwd }: { cwd: AbsoluteFilePath }) {
        this.cwd = cwd;
    }

    /**
     * Converts the api/apis config from fern.yml to ApiDefinitions.
     *
     * Exactly one of `api` or `apis` must be defined in the fern.yml.
     *
     * @param fernYml - The loaded fern.yml schema result with source location tracking.
     * @returns Result with either the converted API definitions or validation issues
     */
    public async convert({ fernYml }: { fernYml: FernYmlSchemaLoader.Result }): Promise<ApiDefinitionConverter.Result> {
        if (!fernYml.success) {
            return {
                success: false,
                issues: fernYml.issues
            };
        }

        const { api, apis } = fernYml.data;
        const sourced = fernYml.sourced;

        if (api != null && apis != null) {
            this.issues.push(
                new ValidationIssue({
                    message: "Cannot define both 'api' and 'apis' in fern.yml.",
                    location: sourced.$loc
                })
            );
            return {
                success: false,
                issues: this.issues
            };
        }
        if (api == null && apis == null) {
            // It's valid to not define any APIs in fern.yml.
            return {
                success: true,
                apis: {}
            };
        }

        let result: Record<string, ApiDefinition> = {};
        if (api != null && !isNullish(sourced.api)) {
            result = await this.convertApi({
                absoluteFernYmlPath: fernYml.absoluteFilePath,
                api,
                sourcedApi: sourced.api
            });
        }
        if (apis != null && !isNullish(sourced.apis)) {
            result = await this.convertApis({
                absoluteFernYmlPath: fernYml.absoluteFilePath,
                apis,
                sourcedApis: sourced.apis
            });
        }
        if (this.issues.length > 0) {
            return {
                success: false,
                issues: this.issues
            };
        }
        return {
            success: true,
            apis: result
        };
    }

    private async convertApi({
        absoluteFernYmlPath,
        api,
        sourcedApi
    }: {
        absoluteFernYmlPath: AbsoluteFilePath;
        api: schemas.ApiDefinitionSchema;
        sourcedApi: Sourced<schemas.ApiDefinitionSchema> | null | undefined;
    }): Promise<Record<string, ApiDefinition>> {
        if (isNullish(sourcedApi)) {
            return {};
        }
        const specs = await this.convertSpecs({
            absoluteFernYmlPath,
            specs: api.specs,
            sourced: sourcedApi.specs
        });
        return {
            [DEFAULT_API_NAME]: { specs }
        };
    }

    private async convertApis({
        absoluteFernYmlPath,
        apis,
        sourcedApis
    }: {
        absoluteFernYmlPath: AbsoluteFilePath;
        apis: schemas.ApisSchema;
        sourcedApis: Sourced<schemas.ApisSchema> | null | undefined;
    }): Promise<Record<string, ApiDefinition>> {
        if (isNullish(sourcedApis)) {
            return {};
        }
        const result: Record<string, ApiDefinition> = {};
        for (const [apiName, apiDef] of Object.entries(apis)) {
            const sourcedApiDef = sourcedApis[apiName];
            if (isNullish(sourcedApiDef)) {
                continue;
            }
            const specs = await this.convertSpecs({
                absoluteFernYmlPath,
                specs: apiDef.specs,
                sourced: sourcedApiDef.specs
            });
            result[apiName] = { specs };
        }
        return result;
    }

    private async convertSpecs({
        absoluteFernYmlPath,
        specs,
        sourced
    }: {
        absoluteFernYmlPath: AbsoluteFilePath;
        specs: schemas.ApiSpecSchema[];
        sourced: Sourced<schemas.ApiSpecSchema[]>;
    }): Promise<ApiSpec[]> {
        // Validate spec combinations before conversion.
        this.validateSpecCombinations({ specs, sourced });

        const results: ApiSpec[] = [];
        for (let i = 0; i < specs.length; i++) {
            const spec = specs[i];
            const sourcedSpec = sourced[i];
            if (spec == null || isNullish(sourcedSpec)) {
                continue;
            }
            results.push(await this.convertSpec({ absoluteFernYmlPath, spec, sourced: sourcedSpec }));
        }
        return results;
    }

    private async convertSpec({
        absoluteFernYmlPath,
        spec,
        sourced
    }: {
        absoluteFernYmlPath: AbsoluteFilePath;
        spec: schemas.ApiSpecSchema;
        sourced: Sourced<schemas.ApiSpecSchema>;
    }): Promise<ApiSpec> {
        if ("openapi" in spec && "openapi" in sourced) {
            return await this.convertOpenApiSpec({
                absoluteFernYmlPath,
                spec: spec as schemas.OpenApiSpecSchema,
                sourced: sourced as Sourced<schemas.OpenApiSpecSchema>
            });
        }
        if ("asyncapi" in spec && "asyncapi" in sourced) {
            return await this.convertAsyncApiSpec({
                absoluteFernYmlPath,
                spec: spec as schemas.AsyncApiSpecSchema,
                sourced: sourced as Sourced<schemas.AsyncApiSpecSchema>
            });
        }
        if ("proto" in spec && "proto" in sourced) {
            return await this.convertProtobufSpec({
                absoluteFernYmlPath,
                spec: spec as schemas.ProtobufSpecSchema,
                sourced: sourced as Sourced<schemas.ProtobufSpecSchema>
            });
        }
        if ("fern" in spec && "fern" in sourced) {
            return await this.convertFernSpec({
                absoluteFernYmlPath,
                spec: spec as schemas.FernSpecSchema,
                sourced: sourced as Sourced<schemas.FernSpecSchema>
            });
        }
        if ("conjure" in spec && "conjure" in sourced) {
            return await this.convertConjureSpec({
                absoluteFernYmlPath,
                spec: spec as schemas.ConjureSpecSchema,
                sourced: sourced as Sourced<schemas.ConjureSpecSchema>
            });
        }
        if ("openrpc" in spec && "openrpc" in sourced) {
            return await this.convertOpenRpcSpec({
                absoluteFernYmlPath,
                spec: spec as schemas.OpenRpcSpecSchema,
                sourced: sourced as Sourced<schemas.OpenRpcSpecSchema>
            });
        }
        // Unreachable; this should never happen if the schema validation is correct.
        throw new Error(`Unknown spec type: ${JSON.stringify(spec)}`);
    }

    private async convertOpenApiSpec({
        absoluteFernYmlPath,
        spec,
        sourced
    }: {
        absoluteFernYmlPath: AbsoluteFilePath;
        spec: schemas.OpenApiSpecSchema;
        sourced: Sourced<schemas.OpenApiSpecSchema>;
    }): Promise<OpenApiSpec> {
        const result: OpenApiSpec = {
            openapi: await this.resolvePath({ absoluteFernYmlPath, path: spec.openapi, sourced: sourced.openapi })
        };
        if (spec.origin != null) {
            result.origin = spec.origin;
        }
        if (spec.overrides != null && !isNullish(sourced.overrides)) {
            result.overrides = await this.resolvePath({
                absoluteFernYmlPath,
                path: spec.overrides,
                sourced: sourced.overrides
            });
        }
        if (spec.overlays != null && !isNullish(sourced.overlays)) {
            result.overlays = await this.resolvePath({
                absoluteFernYmlPath,
                path: spec.overlays,
                sourced: sourced.overlays
            });
        }
        if (spec.namespace != null) {
            result.namespace = spec.namespace;
        }
        if (spec.settings != null) {
            result.settings = spec.settings;
        }
        return result;
    }

    private async convertAsyncApiSpec({
        absoluteFernYmlPath,
        spec,
        sourced
    }: {
        absoluteFernYmlPath: AbsoluteFilePath;
        spec: schemas.AsyncApiSpecSchema;
        sourced: Sourced<schemas.AsyncApiSpecSchema>;
    }): Promise<AsyncApiSpec> {
        const result: AsyncApiSpec = {
            asyncapi: await this.resolvePath({ absoluteFernYmlPath, path: spec.asyncapi, sourced: sourced.asyncapi })
        };
        if (spec.overrides != null && !isNullish(sourced.overrides)) {
            result.overrides = await this.resolvePath({
                absoluteFernYmlPath,
                path: spec.overrides,
                sourced: sourced.overrides
            });
        }
        if (spec.settings != null) {
            result.settings = spec.settings;
        }
        return result;
    }

    private async convertProtobufSpec({
        absoluteFernYmlPath,
        spec,
        sourced
    }: {
        absoluteFernYmlPath: AbsoluteFilePath;
        spec: schemas.ProtobufSpecSchema;
        sourced: Sourced<schemas.ProtobufSpecSchema>;
    }): Promise<ProtobufSpec> {
        const proto: ProtobufDefinition = {
            root: await this.resolvePath({ absoluteFernYmlPath, path: spec.proto.root, sourced: sourced.proto.root })
        };
        if (spec.proto.target != null && !isNullish(sourced.proto.target)) {
            proto.target = await this.resolvePath({
                absoluteFernYmlPath,
                path: spec.proto.target,
                sourced: sourced.proto.target
            });
        }
        if (spec.proto.overrides != null && !isNullish(sourced.proto.overrides)) {
            proto.overrides = await this.resolvePath({
                absoluteFernYmlPath,
                path: spec.proto.overrides,
                sourced: sourced.proto.overrides
            });
        }
        if (spec.proto.localGeneration != null) {
            proto.localGeneration = spec.proto.localGeneration;
        }
        if (spec.proto.fromOpenapi != null) {
            proto.fromOpenapi = spec.proto.fromOpenapi;
        }
        if (spec.proto.dependencies != null && !isNullish(sourced.proto.dependencies)) {
            const deps: AbsoluteFilePath[] = [];
            for (let i = 0; i < spec.proto.dependencies.length; i++) {
                const dep = spec.proto.dependencies[i];
                const sourcedDep = sourced.proto.dependencies[i];
                if (dep != null && !isNullish(sourcedDep)) {
                    deps.push(await this.resolvePath({ absoluteFernYmlPath, path: dep, sourced: sourcedDep }));
                }
            }
            proto.dependencies = deps;
        }

        const result: ProtobufSpec = { proto };
        if (spec.settings != null) {
            result.settings = spec.settings;
        }
        return result;
    }

    private async convertFernSpec({
        absoluteFernYmlPath,
        spec,
        sourced
    }: {
        absoluteFernYmlPath: AbsoluteFilePath;
        spec: schemas.FernSpecSchema;
        sourced: Sourced<schemas.FernSpecSchema>;
    }): Promise<FernSpec> {
        const result: FernSpec = {
            fern: await this.resolvePath({ absoluteFernYmlPath, path: spec.fern, sourced: sourced.fern })
        };
        if (spec.settings != null) {
            result.settings = spec.settings;
        }
        return result;
    }

    private async convertConjureSpec({
        absoluteFernYmlPath,
        spec,
        sourced
    }: {
        absoluteFernYmlPath: AbsoluteFilePath;
        spec: schemas.ConjureSpecSchema;
        sourced: Sourced<schemas.ConjureSpecSchema>;
    }): Promise<ConjureSpec> {
        const result: ConjureSpec = {
            conjure: await this.resolvePath({ absoluteFernYmlPath, path: spec.conjure, sourced: sourced.conjure })
        };
        if (spec.settings != null) {
            result.settings = spec.settings;
        }
        return result;
    }

    private async convertOpenRpcSpec({
        absoluteFernYmlPath,
        spec,
        sourced
    }: {
        absoluteFernYmlPath: AbsoluteFilePath;
        spec: schemas.OpenRpcSpecSchema;
        sourced: Sourced<schemas.OpenRpcSpecSchema>;
    }): Promise<OpenRpcSpec> {
        const result: OpenRpcSpec = {
            openrpc: await this.resolvePath({ absoluteFernYmlPath, path: spec.openrpc, sourced: sourced.openrpc })
        };
        if (spec.overrides != null && !isNullish(sourced.overrides)) {
            result.overrides = await this.resolvePath({
                absoluteFernYmlPath,
                path: spec.overrides,
                sourced: sourced.overrides
            });
        }
        if (spec.settings != null) {
            result.settings = spec.settings;
        }
        return result;
    }

    /**
     * Resolves a relative path from fern.yml to an absolute path, and validates that the file exists.
     */
    private async resolvePath({
        absoluteFernYmlPath,
        path,
        sourced
    }: {
        absoluteFernYmlPath: AbsoluteFilePath;
        path: string;
        sourced: Sourced<string>;
    }): Promise<AbsoluteFilePath> {
        const fernYmlDir = dirname(absoluteFernYmlPath);
        const absoluteFilePath = join(fernYmlDir, RelativeFilePath.of(path));
        if (!(await doesPathExist(absoluteFilePath))) {
            const relativeFilePath = RelativeFilePath.of(relative(this.cwd, absoluteFilePath));
            this.issues.push(
                new ValidationIssue({
                    message: `File "${relativeFilePath}" does not exist`,
                    location: sourced.$loc
                })
            );
        }
        return absoluteFilePath;
    }

    /**
     * Validates that the spec combinations in an API definition are valid.
     *
     * Rules:
     *  - At most one Fern spec is allowed
     *  - At most one Conjure spec is allowed
     *  - Fern specs cannot be mixed with other spec types
     *  - Conjure specs cannot be mixed with other spec types
     *  - OpenAPI/AsyncAPI/Protobuf/OpenRPC specs can be mixed together
     */
    private validateSpecCombinations({
        specs,
        sourced
    }: {
        specs: schemas.ApiSpecSchema[];
        sourced: Sourced<schemas.ApiSpecSchema[]>;
    }): void {
        const fernSpecs: Sourced<schemas.FernSpecSchema>[] = [];
        const conjureSpecs: Sourced<schemas.ConjureSpecSchema>[] = [];
        const ossSpecs: Sourced<schemas.ApiSpecSchema>[] = [];

        for (let i = 0; i < specs.length; i++) {
            const spec = specs[i];
            const sourcedSpec = sourced[i];
            if (spec == null || isNullish(sourcedSpec)) {
                continue;
            }
            if ("fern" in spec) {
                fernSpecs.push(sourcedSpec as Sourced<schemas.FernSpecSchema>);
                continue;
            }
            if ("conjure" in spec) {
                conjureSpecs.push(sourcedSpec as Sourced<schemas.ConjureSpecSchema>);
                continue;
            }
            ossSpecs.push(sourcedSpec);
        }

        if (fernSpecs.length > 1) {
            for (const sourced of fernSpecs) {
                this.issues.push(
                    new ValidationIssue({
                        message:
                            "Multiple Fern specs are not allowed. Use multiple definition files within a single Fern definition directory instead.",
                        location: sourced.fern.$loc
                    })
                );
            }
        }
        if (conjureSpecs.length > 1) {
            for (const sourced of conjureSpecs) {
                this.issues.push(
                    new ValidationIssue({
                        message: "Multiple Conjure specs are not allowed.",
                        location: sourced.conjure.$loc
                    })
                );
            }
        }
        if (fernSpecs.length > 0 && (conjureSpecs.length > 0 || ossSpecs.length > 0)) {
            for (const sourced of fernSpecs) {
                this.issues.push(
                    new ValidationIssue({
                        message:
                            "Fern specs cannot be mixed with other spec types. Fern definitions are a standalone definition type.",
                        location: sourced.fern.$loc
                    })
                );
            }
        }
        if (conjureSpecs.length > 0 && (ossSpecs.length > 0 || fernSpecs.length > 0)) {
            for (const sourced of conjureSpecs) {
                this.issues.push(
                    new ValidationIssue({
                        message:
                            "Conjure specs cannot be mixed with other spec types. Conjure definitions are a standalone definition type.",
                        location: sourced.conjure.$loc
                    })
                );
            }
        }
    }
}
