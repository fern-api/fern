import { FernIr, IntermediateRepresentation, Package } from "@fern-api/ir-sdk";

import { AbstractConverterContext } from "./AbstractConverterContext";
import { ErrorCollector } from "./ErrorCollector";
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
     * @param errorCollector Optional collector to track any conversion errors
     * @returns The converted target type Output
     */
    public abstract convert({
        errorCollector
    }: {
        errorCollector: ErrorCollector;
    }): Output | undefined | Promise<Output | undefined>;


    protected removeXFernIgnores({
        document,
        context,
        errorCollector,
        breadcrumbs = []
    }: {
        document: unknown;
        context: Context;
        errorCollector: ErrorCollector;
        breadcrumbs?: string[];
    }): unknown {
        if (Array.isArray(document)) {
            return document
                .filter((item, index) => {
                    const shouldIgnore = new FernIgnoreExtension({
                        breadcrumbs: [...breadcrumbs, String(index)],
                        operation: item
                    }).convert({ errorCollector });
                    return !shouldIgnore;
                })
                .map((item, index) =>
                    this.removeXFernIgnores({
                        document: item,
                        context,
                        errorCollector,
                        breadcrumbs: [...breadcrumbs, String(index)]
                    })
                );
        } else if (document != null && typeof document === "object") {
            return Object.fromEntries(
                Object.entries(document)
                    .filter(([key, value]) => {
                        const shouldIgnore = new FernIgnoreExtension({
                            breadcrumbs: [...breadcrumbs, key],
                            operation: value
                        }).convert({ errorCollector });
                        return !shouldIgnore;
                    })
                    .map(([key, value]) => [
                        key,
                        this.removeXFernIgnores({
                            document: value,
                            context,
                            errorCollector,
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
