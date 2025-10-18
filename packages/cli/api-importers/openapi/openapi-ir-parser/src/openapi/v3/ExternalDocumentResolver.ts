import { Logger } from "@fern-api/logger";
import { readFile } from "fs/promises";
import * as yaml from "js-yaml";
import { OpenAPIV3 } from "openapi-types";
import * as path from "path";

// Type for any value that might contain a $ref property
export type OpenAPIValue =
    | OpenAPIV3.Document
    | OpenAPIV3.ComponentsObject
    | OpenAPIV3.SchemaObject
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3.ResponseObject
    | OpenAPIV3.ParameterObject
    | OpenAPIV3.RequestBodyObject
    | OpenAPIV3.HeaderObject
    | OpenAPIV3.SecuritySchemeObject
    | OpenAPIV3.LinkObject
    | OpenAPIV3.CallbackObject
    | OpenAPIV3.ExampleObject
    | OpenAPIV3.PathItemObject
    | OpenAPIV3.OperationObject
    | OpenAPIV3.MediaTypeObject
    | string
    | number
    | boolean
    | null
    | undefined
    | OpenAPIValue[]
    | { [key: string]: OpenAPIValue };

export interface ExternalReferenceInfo {
    /** The document URL/path (without the internal pointer) */
    documentUrl: string;
    /** The internal JSON pointer (e.g., "#/components/schemas/Pet") */
    internalPointer: string;
    /** Whether this is an HTTP/HTTPS URL */
    isRemote: boolean;
}

export interface ExternalDocumentResolverOptions {
    baseUrl?: string;
    maxCacheSize?: number;
    httpTimeoutMs?: number;
    allowRemote?: boolean;
}

export class ExternalDocumentResolver {
    private documentCache = new Map<string, OpenAPIV3.Document>();
    private resolutionStack: string[] = [];
    private readonly logger: Logger;
    private readonly options: Required<ExternalDocumentResolverOptions>;

    constructor(logger: Logger, options: ExternalDocumentResolverOptions = {}) {
        this.logger = logger;
        this.options = {
            baseUrl: options.baseUrl || "",
            maxCacheSize: options.maxCacheSize || 100,
            httpTimeoutMs: options.httpTimeoutMs || 30000,
            allowRemote: options.allowRemote ?? true
        };
    }

    /**
     * Parse a reference string into its components
     */
    public parseReference(ref: string, currentBaseUrl?: string): ExternalReferenceInfo {
        // Handle internal references
        if (ref.startsWith("#")) {
            return {
                documentUrl: currentBaseUrl || this.options.baseUrl,
                internalPointer: ref,
                isRemote: false
            };
        }

        // Split reference into document part and internal pointer
        const hashIndex = ref.indexOf("#");
        let documentUrl: string;
        let internalPointer: string;

        if (hashIndex === -1) {
            // No internal pointer, reference is just to the document
            documentUrl = ref;
            internalPointer = "#";
        } else {
            documentUrl = ref.substring(0, hashIndex);
            internalPointer = ref.substring(hashIndex);
        }

        // Resolve relative URLs
        const resolvedUrl = this.resolveUrl(documentUrl, currentBaseUrl);
        const isRemote = this.isRemoteUrl(resolvedUrl);

        return {
            documentUrl: resolvedUrl,
            internalPointer,
            isRemote
        };
    }

    /**
     * Resolve a reference to get the referenced content
     */
    public async resolveReference(ref: string, currentBaseUrl?: string): Promise<OpenAPIValue> {
        const refInfo = this.parseReference(ref, currentBaseUrl);

        // Check for circular references
        if (this.resolutionStack.includes(refInfo.documentUrl)) {
            throw new Error(
                `Circular reference detected: ${this.resolutionStack.join(" -> ")} -> ${refInfo.documentUrl}`
            );
        }

        try {
            this.resolutionStack.push(refInfo.documentUrl);

            // Get the document
            const document = await this.getDocument(refInfo.documentUrl);

            // Resolve the internal pointer
            if (refInfo.internalPointer === "#") {
                return document;
            }

            return this.resolveInternalPointer(document, refInfo.internalPointer);
        } finally {
            this.resolutionStack.pop();
        }
    }

    /**
     * Get a document from cache or fetch it
     */
    public async getDocument(documentUrl: string): Promise<OpenAPIV3.Document> {
        // Check cache first
        const cached = this.documentCache.get(documentUrl);
        if (cached) {
            return cached;
        }

        // Fetch the document
        let document: OpenAPIV3.Document;
        if (this.isRemoteUrl(documentUrl)) {
            document = await this.fetchRemoteDocument(documentUrl);
        } else {
            document = await this.fetchLocalDocument(documentUrl);
        }

        // Cache the document
        this.cacheDocument(documentUrl, document);

        return document;
    }

    private async fetchRemoteDocument(url: string): Promise<OpenAPIV3.Document> {
        if (!this.options.allowRemote) {
            throw new Error(`Remote references are disabled: ${url}`);
        }

        this.logger.debug(`Fetching external OpenAPI document: ${url}`);

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), this.options.httpTimeoutMs);

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    Accept: "application/json, application/x-yaml, text/yaml, text/plain"
                }
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type") || "";
            const text = await response.text();

            const document = this.parseDocument(text, contentType.includes("json"));

            // Log domain library info for debugging
            if (url.includes("swaggerhub.com") || url.includes("cdn.com")) {
                this.logger.debug(`Successfully fetched shared domain library: ${url}`);
                if (document.components) {
                    const componentSummary = Object.entries(document.components)
                        .map(([type, components]) => `${type}: [${Object.keys(components || {}).join(", ")}]`)
                        .join("; ");
                    this.logger.debug(`Shared domain components: ${componentSummary}`);
                }
            }

            return document;
        } catch (error) {
            // Enhanced error logging for shared domain libraries
            if (url.includes("swaggerhub.com") || url.includes("cdn.com")) {
                this.logger.error(
                    `Failed to fetch shared domain library ${url}: ${error instanceof Error ? error.message : String(error)}`
                );
            }
            throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async fetchLocalDocument(filePath: string): Promise<OpenAPIV3.Document> {
        this.logger.debug(`Reading external OpenAPI document: ${filePath}`);

        try {
            const content = await readFile(filePath, "utf-8");
            const isJson = filePath.endsWith(".json");
            return this.parseDocument(content, isJson);
        } catch (error) {
            throw new Error(`Failed to read ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private parseDocument(content: string, isJson: boolean): OpenAPIV3.Document {
        try {
            let document: unknown;
            if (isJson) {
                document = JSON.parse(content);
            } else {
                // Parse as YAML
                document = yaml.load(content);
            }

            // Log document parsing to help track where OpenAPI version errors might come from
            const documentRecord = document as Record<string, unknown>;
            this.logger.debug(
                `Parsed external document - OpenAPI version: ${documentRecord?.openapi || documentRecord?.swagger || "unknown"}`
            );

            // Log a warning if this is an OpenAPI v2 document that might cause issues elsewhere
            if (documentRecord?.swagger) {
                this.logger.warn(
                    `External document appears to be OpenAPI v2 (swagger: ${documentRecord.swagger}), this may cause version compatibility issues in downstream processing`
                );
            }

            return document as OpenAPIV3.Document;
        } catch (error) {
            throw new Error(`Failed to parse document: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public resolveInternalPointer(document: OpenAPIValue, pointer: string): OpenAPIValue {
        if (!pointer.startsWith("#/")) {
            throw new Error(`Invalid JSON pointer: ${pointer}`);
        }

        const keys = pointer
            .substring(2)
            .split("/")
            .map((key) => key.replace(/~1/g, "/").replace(/~0/g, "~"));

        let current: OpenAPIValue = document;
        for (const key of keys) {
            if (current == null || typeof current !== "object") {
                throw new Error(`Cannot resolve pointer ${pointer}: path not found`);
            }

            if (Array.isArray(current)) {
                const index = parseInt(key, 10);
                if (isNaN(index) || index < 0 || index >= current.length) {
                    throw new Error(`Cannot resolve pointer ${pointer}: invalid array index ${key}`);
                }
                current = current[index];
            } else {
                current = (current as Record<string, OpenAPIValue>)[key];
            }
        }

        if (current === undefined) {
            throw new Error(`Cannot resolve pointer ${pointer}: path not found`);
        }

        return current;
    }

    private cacheDocument(documentUrl: string, document: OpenAPIV3.Document): void {
        // Implement LRU-style eviction if cache is full
        if (this.documentCache.size >= this.options.maxCacheSize) {
            const firstKey = this.documentCache.keys().next().value;
            if (firstKey) {
                this.documentCache.delete(firstKey);
            }
        }

        this.documentCache.set(documentUrl, document);
    }

    private resolveUrl(targetUrl: string, baseUrl?: string): string {
        if (this.isRemoteUrl(targetUrl)) {
            return targetUrl;
        }

        if (!baseUrl) {
            baseUrl = this.options.baseUrl;
        }

        if (!baseUrl) {
            return targetUrl;
        }

        if (this.isRemoteUrl(baseUrl)) {
            return new URL(targetUrl, baseUrl).toString();
        } else {
            return path.resolve(path.dirname(baseUrl), targetUrl);
        }
    }

    private isRemoteUrl(url: string): boolean {
        return url.startsWith("http://") || url.startsWith("https://");
    }

    public clearCache(): void {
        this.documentCache.clear();
    }

    public getCacheSize(): number {
        return this.documentCache.size;
    }
}
