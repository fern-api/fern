import { assertNever } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

import { ParseOpenAPIOptions, VisibilityFilter } from "../../../options.js";
import { TwilioOpenAPIExtension } from "./twilioExtensions.js";

export const TwilioVisibility = {
    Public: "public",
    Private: "private",
    Hidden: "hidden"
} as const;

export type TwilioVisibility = (typeof TwilioVisibility)[keyof typeof TwilioVisibility];

const TWILIO_VISIBILITY_VALUES: readonly string[] = Object.values(TwilioVisibility);

/** The `x-twilio` keys that carry a visibility tier, and the parser option each one is filtered by. */
export type TwilioVisibilityKey = "libraryVisibility" | "docsVisibility";

const TWILIO_VISIBILITY_KEYS: readonly TwilioVisibilityKey[] = ["libraryVisibility", "docsVisibility"];

export type TwilioVisibilityOptions = Pick<ParseOpenAPIOptions, TwilioVisibilityKey>;

export interface SkippedVisibility {
    key: TwilioVisibilityKey;
    visibility: TwilioVisibility;
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function isTwilioVisibility(value: unknown): value is TwilioVisibility {
    return typeof value === "string" && TWILIO_VISIBILITY_VALUES.includes(value);
}

/**
 * Reads `x-twilio.<key>` from an OpenAPI object (info, path item, operation, parameter, schema
 * or property). Returns undefined when the extension is absent or malformed.
 */
export function getTwilioVisibility({
    object,
    key,
    logger,
    breadcrumbs
}: {
    object: unknown;
    key: TwilioVisibilityKey;
    logger: Logger;
    breadcrumbs: string[];
}): TwilioVisibility | undefined {
    if (!isRecord(object)) {
        return undefined;
    }
    const twilio = object[TwilioOpenAPIExtension.TWILIO];
    if (!isRecord(twilio)) {
        return undefined;
    }
    const value = twilio[key];
    if (value == null) {
        return undefined;
    }
    if (!isTwilioVisibility(value)) {
        logger.warn(
            `${breadcrumbs.join(".")} has an unrecognized ${TwilioOpenAPIExtension.TWILIO}.${key} value "${String(value)}"; expected one of ${TWILIO_VISIBILITY_VALUES.join(", ")}. Ignoring it; the visibility inherited from the enclosing path item or info object (or "public") applies.`
        );
        return undefined;
    }
    return value;
}

/**
 * Resolves the effective visibility of an element by walking from the most specific object to
 * the least specific one (e.g. operation -> path item -> info) and taking the first explicit
 * value. Elements without any value are public.
 */
export function resolveTwilioVisibility({
    objects,
    key,
    logger,
    breadcrumbs
}: {
    objects: unknown[];
    key: TwilioVisibilityKey;
    logger: Logger;
    breadcrumbs: string[];
}): TwilioVisibility {
    for (const object of objects) {
        const visibility = getTwilioVisibility({ object, key, logger, breadcrumbs });
        if (visibility != null) {
            return visibility;
        }
    }
    return TwilioVisibility.Public;
}

export function shouldSkipForVisibility({
    visibility,
    filter
}: {
    visibility: TwilioVisibility;
    filter: VisibilityFilter;
}): boolean {
    switch (filter) {
        case "all":
            return false;
        case "public":
            return visibility !== TwilioVisibility.Public;
        case "private":
            return visibility === TwilioVisibility.Hidden;
        default:
            assertNever(filter);
    }
}

/**
 * Returns the key and resolved visibility that exclude the element under the configured
 * `libraryVisibility` / `docsVisibility` filters, or undefined when it should be kept.
 */
export function getSkippedVisibility({
    objects,
    logger,
    options,
    breadcrumbs
}: {
    objects: unknown[];
    logger: Logger;
    options: TwilioVisibilityOptions;
    breadcrumbs: string[];
}): SkippedVisibility | undefined {
    for (const key of TWILIO_VISIBILITY_KEYS) {
        const filter = options[key];
        if (filter === "all") {
            continue;
        }
        const visibility = resolveTwilioVisibility({ objects, key, logger, breadcrumbs });
        if (shouldSkipForVisibility({ visibility, filter })) {
            return { key, visibility };
        }
    }
    return undefined;
}

export function isTwilioVisibilityFilteringEnabled(options: TwilioVisibilityOptions): boolean {
    return TWILIO_VISIBILITY_KEYS.some((key) => options[key] !== "all");
}

const HTTP_METHODS: readonly string[] = Object.values(OpenAPIV3.HttpMethods);
const OPERATION_CONTAINERS = ["paths", "webhooks"] as const;
const SCHEMA_REF_PREFIX = "#/components/schemas/";
const PARAMETER_REF_PREFIX = "#/components/parameters/";
/** Keys whose values are arbitrary user data rather than schema objects. */
const NON_SCHEMA_KEYS: ReadonlySet<string> = new Set(["example", "examples", "default", "enum", "const"]);

function describe(skipped: SkippedVisibility): string {
    return `${skipped.key} "${skipped.visibility}"`;
}

function decodeJsonPointerSegment(segment: string): string {
    return decodeURIComponent(segment).replaceAll("~1", "/").replaceAll("~0", "~");
}

function getLocalComponent({
    document,
    reference,
    prefix
}: {
    document: JsonRecord;
    reference: unknown;
    prefix: string;
}): { name: string; value: unknown } | undefined {
    if (typeof reference !== "string" || !reference.startsWith(prefix)) {
        return undefined;
    }
    const name = decodeJsonPointerSegment(reference.slice(prefix.length));
    const components = document.components;
    if (!isRecord(components)) {
        return { name, value: undefined };
    }
    const collection = components[prefix.split("/")[2] ?? ""];
    return { name, value: isRecord(collection) ? collection[name] : undefined };
}

/**
 * Removes every element whose `x-twilio.libraryVisibility` / `x-twilio.docsVisibility` is excluded
 * by the configured filters from an OpenAPI document, so that all downstream parsers (the
 * OpenAPI IR parser and the v3 IR converter) see the same spec. The input is not mutated.
 *
 * - Operations (`paths` and `webhooks`) resolve `operation -> path item -> info`; a path item
 *   whose operations were all removed is dropped.
 * - Non-path parameters (inline or `$ref`'d) are removed; path parameters are kept with a warning
 *   because they are required to build the URL.
 * - Component schemas are removed; a warning is logged when a remaining element still `$ref`s one.
 * - Object properties are removed (and dropped from the sibling `required` list).
 */
export function applyTwilioVisibility<T extends OpenAPIV3.Document | OpenAPIV3_1.Document>({
    document,
    options,
    logger
}: {
    document: T;
    options: TwilioVisibilityOptions;
    logger: Logger;
}): T {
    if (!isTwilioVisibilityFilteringEnabled(options)) {
        return document;
    }
    const pruned = structuredClone(document);
    if (isRecord(pruned)) {
        new TwilioVisibilityPruner({ document: pruned, options, logger }).prune();
    }
    return pruned;
}

class TwilioVisibilityPruner {
    private readonly document: JsonRecord;
    private readonly options: TwilioVisibilityOptions;
    private readonly logger: Logger;
    private readonly removedSchemas = new Map<string, SkippedVisibility>();

    constructor({
        document,
        options,
        logger
    }: {
        document: JsonRecord;
        options: TwilioVisibilityOptions;
        logger: Logger;
    }) {
        this.document = document;
        this.options = options;
        this.logger = logger;
    }

    public prune(): void {
        for (const container of OPERATION_CONTAINERS) {
            this.pruneOperations(container);
        }
        this.pruneComponentSchemas();
        this.pruneProperties({ node: this.document, breadcrumbs: [] });
        this.warnOnDanglingSchemaReferences({ node: this.document, breadcrumbs: [] });
    }

    private getSkipped({
        objects,
        breadcrumbs
    }: {
        objects: unknown[];
        breadcrumbs: string[];
    }): SkippedVisibility | undefined {
        return getSkippedVisibility({ objects, logger: this.logger, options: this.options, breadcrumbs });
    }

    private pruneOperations(container: (typeof OPERATION_CONTAINERS)[number]): void {
        const paths = this.document[container];
        if (!isRecord(paths)) {
            return;
        }
        const info = this.document.info;
        for (const [path, pathItem] of Object.entries(paths)) {
            if (!isRecord(pathItem)) {
                continue;
            }
            const pathItemParameters = pathItem.parameters;
            const pathBreadcrumbs = [container, path];
            if (Array.isArray(pathItemParameters)) {
                pathItem.parameters = this.pruneParameters({
                    parameters: pathItemParameters,
                    breadcrumbs: pathBreadcrumbs
                });
            }
            let removedOperation = false;
            for (const method of HTTP_METHODS) {
                const operation = pathItem[method];
                if (!isRecord(operation)) {
                    continue;
                }
                const breadcrumbs = [`${method.toUpperCase()} ${path}`];
                const skipped = this.getSkipped({ objects: [operation, pathItem, info], breadcrumbs });
                if (skipped != null) {
                    this.logger.debug(`${breadcrumbs.join(".")} has ${describe(skipped)}. Skipping.`);
                    delete pathItem[method];
                    removedOperation = true;
                    continue;
                }
                const operationParameters = operation.parameters;
                if (Array.isArray(operationParameters)) {
                    operation.parameters = this.pruneParameters({ parameters: operationParameters, breadcrumbs });
                }
            }
            if (removedOperation && !HTTP_METHODS.some((method) => pathItem[method] != null)) {
                delete paths[path];
            }
        }
    }

    private pruneParameters({ parameters, breadcrumbs }: { parameters: unknown[]; breadcrumbs: string[] }): unknown[] {
        return parameters.filter((parameter) => {
            if (!isRecord(parameter)) {
                return true;
            }
            const resolved = getLocalComponent({
                document: this.document,
                reference: parameter.$ref,
                prefix: PARAMETER_REF_PREFIX
            })?.value;
            const target = isRecord(resolved) ? resolved : parameter;
            const name = typeof target.name === "string" ? target.name : String(parameter.$ref ?? "");
            const skipped = this.getSkipped({ objects: [parameter, resolved], breadcrumbs: [...breadcrumbs, name] });
            if (skipped == null) {
                return true;
            }
            if (target.in === "path") {
                this.logger.warn(
                    `${breadcrumbs.join(".")} has path parameter "${name}" with ${describe(skipped)}. Path parameters cannot be excluded because they are required to build the URL; keeping it.`
                );
                return true;
            }
            this.logger.debug(`${breadcrumbs.join(".")} has parameter "${name}" with ${describe(skipped)}. Skipping.`);
            return false;
        });
    }

    private pruneComponentSchemas(): void {
        const components = this.document.components;
        if (!isRecord(components)) {
            return;
        }
        const schemas = components.schemas;
        if (!isRecord(schemas)) {
            return;
        }
        for (const [name, schema] of Object.entries(schemas)) {
            const skipped = this.getSkipped({ objects: [schema], breadcrumbs: ["components", "schemas", name] });
            if (skipped != null) {
                this.logger.debug(`Schema ${name} has ${describe(skipped)}. Skipping.`);
                delete schemas[name];
                this.removedSchemas.set(name, skipped);
            }
        }
    }

    private pruneProperties({ node, breadcrumbs }: { node: unknown; breadcrumbs: string[] }): void {
        if (Array.isArray(node)) {
            node.forEach((item, index) =>
                this.pruneProperties({ node: item, breadcrumbs: [...breadcrumbs, String(index)] })
            );
            return;
        }
        if (!isRecord(node)) {
            return;
        }
        const properties = node.properties;
        if (isRecord(properties)) {
            const removed: string[] = [];
            for (const [key, property] of Object.entries(properties)) {
                const propertyBreadcrumbs = [...breadcrumbs, "properties", key];
                const skipped = this.getSkipped({ objects: [property], breadcrumbs: propertyBreadcrumbs });
                if (skipped != null) {
                    this.logger.debug(`Property ${propertyBreadcrumbs.join(".")} has ${describe(skipped)}. Skipping.`);
                    delete properties[key];
                    removed.push(key);
                }
            }
            if (removed.length > 0 && Array.isArray(node.required)) {
                node.required = node.required.filter((key) => typeof key !== "string" || !removed.includes(key));
            }
        }
        for (const [key, value] of Object.entries(node)) {
            if (NON_SCHEMA_KEYS.has(key)) {
                continue;
            }
            this.pruneProperties({ node: value, breadcrumbs: [...breadcrumbs, key] });
        }
    }

    private warnOnDanglingSchemaReferences({ node, breadcrumbs }: { node: unknown; breadcrumbs: string[] }): void {
        if (this.removedSchemas.size === 0) {
            return;
        }
        if (Array.isArray(node)) {
            node.forEach((item, index) =>
                this.warnOnDanglingSchemaReferences({ node: item, breadcrumbs: [...breadcrumbs, String(index)] })
            );
            return;
        }
        if (!isRecord(node)) {
            return;
        }
        const referenced = getLocalComponent({
            document: this.document,
            reference: node.$ref,
            prefix: SCHEMA_REF_PREFIX
        });
        if (referenced != null) {
            const skipped = this.removedSchemas.get(referenced.name);
            if (skipped != null) {
                this.logger.warn(
                    `Schema ${referenced.name} has ${describe(skipped)} and was excluded from generation, but it is referenced by ${breadcrumbs.join(".")}. References to it will be generated as "unknown".`
                );
                this.removedSchemas.delete(referenced.name);
            }
        }
        for (const [key, value] of Object.entries(node)) {
            if (NON_SCHEMA_KEYS.has(key)) {
                continue;
            }
            this.warnOnDanglingSchemaReferences({ node: value, breadcrumbs: [...breadcrumbs, key] });
        }
    }
}
