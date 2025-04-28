import { appendFileSync } from "fs";

import { FernIr, IntermediateRepresentation, Package } from "@fern-api/ir-sdk";

import { AbstractConverterContext } from "./AbstractConverterContext";
import { FernIgnoreExtension } from "./extensions";

export type BaseIntermediateRepresentation = Omit<IntermediateRepresentation, "apiName" | "constants">;

export declare namespace AbstractConverter {
    export interface Args<Context> {
        breadcrumbs?: string[];
        context: Context;
    }

    export type AbstractArgs = Args<AbstractConverterContext<object>>;
}

/**
 * Interface for converting OpenAPI specifications to a target type
 * @template Output The target type to convert to
 */
export abstract class AbstractConverter<Context extends AbstractConverterContext<object>, Output> {
    protected ir: BaseIntermediateRepresentation;
    protected breadcrumbs: string[] = [];
    protected context: Context;

    /**
     * String primitive type constant
     */
    protected static STRING = FernIr.TypeReference.primitive({
        v1: "STRING",
        v2: FernIr.PrimitiveTypeV2.string({
            default: undefined,
            validation: undefined
        })
    });

    constructor({ breadcrumbs = [], context }: AbstractConverter.Args<Context>) {
        this.breadcrumbs = breadcrumbs;
        this.context = context;
        this.ir = {
            auth: {
                docs: undefined,
                requirement: FernIr.AuthSchemesRequirement.All,
                schemes: []
            },
            types: {},
            services: {},
            errors: {},
            webhookGroups: {},
            websocketChannels: undefined,
            headers: [],
            idempotencyHeaders: [],
            apiVersion: undefined,
            apiDisplayName: undefined,
            apiDocs: undefined,
            basePath: undefined,
            pathParameters: [],
            errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode(),
            variables: [],
            serviceTypeReferenceInfo: {
                sharedTypes: [],
                typesReferencedOnlyByService: {}
            },
            readmeConfig: undefined,
            sourceConfig: undefined,
            publishConfig: undefined,
            dynamic: undefined,
            environments: undefined,
            fdrApiDefinitionId: undefined,
            rootPackage: context.createPackage(),
            subpackages: {},
            sdkConfig: {
                hasFileDownloadEndpoints: false,
                hasPaginatedEndpoints: false,
                hasStreamingEndpoints: false,
                isAuthMandatory: true,
                platformHeaders: {
                    language: "",
                    sdkName: "",
                    sdkVersion: "",
                    userAgent: undefined
                }
            }
        };
    }

    /**
     * Converts the OpenAPI specification to the target type
     * @returns The converted target type Output
     */
    public abstract convert(): Output | undefined | Promise<Output | undefined>;

    protected async resolveExternalRefs({ spec, context }: { spec: unknown; context: Context }): Promise<unknown> {
        const queue = [spec];

        while (queue.length > 0) {
            const current = queue.shift();
            if (current == null) {
                continue;
            }

            if (Array.isArray(current)) {
                for (let i = 0; i < current.length; i++) {
                    let resolvedRefVal = current[i];
                    if (this.context.isReferenceObject(current[i])) {
                        // repeatedly resolve nested refs until we get a definition to check whether it's external
                        let depth = 0;
                        while (this.context.isReferenceObject(resolvedRefVal)) {
                            resolvedRefVal = await context.resolveReference({ $ref: resolvedRefVal.$ref });
                            if (resolvedRefVal.resolved) {
                                resolvedRefVal = resolvedRefVal.value;
                            } else {
                                resolvedRefVal = null;
                                break;
                            }
                            depth++;
                        }
                        if (resolvedRefVal != null) {
                            current[i] = resolvedRefVal;
                        }
                    } else {
                        queue.push(current[i]);
                    }
                }
            } else if (typeof current === "object") {
                for (const [key, value] of Object.entries(current)) {
                    let resolvedRefVal = value;
                    if (this.context.isReferenceObject(value)) {
                        let depth = 0;
                        while (this.context.isReferenceObject(resolvedRefVal)) {
                            resolvedRefVal = await context.resolveReference({ $ref: resolvedRefVal.$ref });
                            if (resolvedRefVal.resolved) {
                                resolvedRefVal = resolvedRefVal.value;
                            } else {
                                resolvedRefVal = null;
                                break;
                            }
                            depth++;
                        }
                        if (resolvedRefVal != null) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (current as any)[key] = resolvedRefVal;
                        }
                    } else {
                        queue.push(value);
                    }
                }
            }
        }
        return spec;
    }

    protected removeXFernIgnores({
        document,
        context,
        breadcrumbs = []
    }: {
        document: unknown;
        context: Context;
        breadcrumbs?: string[];
    }): unknown {
        if (Array.isArray(document)) {
            return document
                .filter((item, index) => {
                    const shouldIgnore = new FernIgnoreExtension({
                        breadcrumbs: [...breadcrumbs, String(index)],
                        operation: item,
                        context
                    }).convert();
                    return !shouldIgnore;
                })
                .map((item, index) =>
                    this.removeXFernIgnores({
                        document: item,
                        context,
                        breadcrumbs: [...breadcrumbs, String(index)]
                    })
                );
        } else if (document != null && typeof document === "object") {
            return Object.fromEntries(
                Object.entries(document)
                    .filter(([key, value]) => {
                        const shouldIgnore = new FernIgnoreExtension({
                            breadcrumbs: [...breadcrumbs, key],
                            operation: value,
                            context
                        }).convert();
                        return !shouldIgnore;
                    })
                    .map(([key, value]) => [
                        key,
                        this.removeXFernIgnores({
                            document: value,
                            context,
                            breadcrumbs: [...breadcrumbs, key]
                        })
                    ])
            );
        }
        return document;
    }

    /**
     * Gets an existing package or creates a new one if it doesn't exist
     * @param packageName The name of the package to get or create
     * @param context The converter context
     * @returns The package object
     */
    protected getOrCreatePackage({ group }: { group?: string[] }): Package {
        const groupParts = [];
        if (this.context.namespace != null) {
            groupParts.push(this.context.namespace);
        }
        groupParts.push(...(group ?? []));

        if (groupParts.length == 0) {
            return this.ir.rootPackage;
        }

        let pkg = this.ir.rootPackage;
        for (let i = 0; i < groupParts.length; i++) {
            const name = groupParts[i];
            const subpackageId = groupParts.slice(0, i + 1).join(".");
            if (this.ir.subpackages[subpackageId] == null) {
                this.ir.subpackages[subpackageId] = {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    name: this.context.casingsGenerator.generateName(name!),
                    ...this.context.createPackage({ name })
                };
            }
            const curr = this.ir.subpackages[subpackageId];
            if (!pkg.subpackages.includes(subpackageId)) {
                pkg.subpackages.push(subpackageId);
            }
            pkg = curr;
        }

        return pkg;
    }
}
