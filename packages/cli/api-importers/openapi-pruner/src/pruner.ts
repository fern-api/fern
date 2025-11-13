import { OpenAPIV3 } from "openapi-types";
import { EndpointMatcher } from "./endpoint-matcher";
import { ReferenceCollector } from "./reference-collector";
import { HttpMethod, PruneOptions, PruneResult, PruneStatistics } from "./types";

export class OpenAPIPruner {
    private matcher: EndpointMatcher;
    private document: OpenAPIV3.Document;

    constructor(options: PruneOptions) {
        this.matcher = new EndpointMatcher(options.endpoints);
        this.document = JSON.parse(JSON.stringify(options.document));
    }

    public prune(): PruneResult {
        const statistics = this.collectStatistics();

        const collector = new ReferenceCollector(this.document);

        const prunedPaths: OpenAPIV3.PathsObject = {};
        const matchingPaths = this.matcher.getMatchingPaths(this.document.paths);

        for (const path of matchingPaths) {
            const pathItem = this.document.paths[path];
            if (!pathItem) {
                continue;
            }

            const prunedPathItem: OpenAPIV3.PathItemObject = {};

            if (pathItem.summary) {
                prunedPathItem.summary = pathItem.summary;
            }
            if (pathItem.description) {
                prunedPathItem.description = pathItem.description;
            }
            if (pathItem.servers) {
                prunedPathItem.servers = pathItem.servers;
            }
            if (pathItem.parameters) {
                prunedPathItem.parameters = pathItem.parameters;
            }

            const methods: HttpMethod[] = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

            for (const method of methods) {
                const operation = pathItem[method];
                if (operation && this.matcher.matches(path, method)) {
                    prunedPathItem[method] = operation;
                    collector.collectFromOperation(operation);
                }
            }

            if (pathItem.parameters) {
                for (const param of pathItem.parameters) {
                    collector.collectParameter(param);
                }
            }

            prunedPaths[path] = prunedPathItem;
        }

        const prunedDocument: OpenAPIV3.Document = {
            openapi: this.document.openapi,
            info: this.document.info,
            paths: prunedPaths
        };

        if (this.document.servers) {
            prunedDocument.servers = this.document.servers;
        }

        if (this.document.externalDocs) {
            prunedDocument.externalDocs = this.document.externalDocs;
        }

        if (this.document.tags) {
            const usedTags = new Set<string>();
            for (const pathItem of Object.values(prunedPaths)) {
                const methods: HttpMethod[] = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];
                for (const method of methods) {
                    const operation = pathItem?.[method];
                    if (operation?.tags) {
                        for (const tag of operation.tags) {
                            usedTags.add(tag);
                        }
                    }
                }
            }

            prunedDocument.tags = this.document.tags.filter((tag) => usedTags.has(tag.name));
        }

        if (this.document.security) {
            prunedDocument.security = this.document.security;
            for (const securityRequirement of this.document.security) {
                for (const schemeName of Object.keys(securityRequirement)) {
                    collector.getSecuritySchemes().add(schemeName);
                }
            }
        }

        prunedDocument.components = this.buildPrunedComponents(collector);

        const prunedStatistics = this.collectPrunedStatistics(prunedDocument);

        return {
            document: prunedDocument,
            statistics: {
                originalEndpoints: statistics.originalEndpoints,
                prunedEndpoints: prunedStatistics.originalEndpoints,
                originalSchemas: statistics.originalSchemas,
                prunedSchemas: prunedStatistics.originalSchemas,
                originalParameters: statistics.originalParameters,
                prunedParameters: prunedStatistics.originalParameters,
                originalResponses: statistics.originalResponses,
                prunedResponses: prunedStatistics.originalResponses,
                originalRequestBodies: statistics.originalRequestBodies,
                prunedRequestBodies: prunedStatistics.originalRequestBodies,
                originalSecuritySchemes: statistics.originalSecuritySchemes,
                prunedSecuritySchemes: prunedStatistics.originalSecuritySchemes
            }
        };
    }

    private buildPrunedComponents(collector: ReferenceCollector): OpenAPIV3.ComponentsObject | undefined {
        if (!this.document.components) {
            return undefined;
        }

        const components: OpenAPIV3.ComponentsObject = {};

        if (this.document.components.schemas && collector.getSchemas().size > 0) {
            components.schemas = {};
            for (const schemaName of collector.getSchemas()) {
                const schema = this.document.components.schemas[schemaName];
                if (schema) {
                    components.schemas[schemaName] = schema;
                }
            }
        }

        if (this.document.components.parameters && collector.getParameters().size > 0) {
            components.parameters = {};
            for (const paramName of collector.getParameters()) {
                const param = this.document.components.parameters[paramName];
                if (param) {
                    components.parameters[paramName] = param;
                }
            }
        }

        if (this.document.components.responses && collector.getResponses().size > 0) {
            components.responses = {};
            for (const responseName of collector.getResponses()) {
                const response = this.document.components.responses[responseName];
                if (response) {
                    components.responses[responseName] = response;
                }
            }
        }

        if (this.document.components.requestBodies && collector.getRequestBodies().size > 0) {
            components.requestBodies = {};
            for (const bodyName of collector.getRequestBodies()) {
                const body = this.document.components.requestBodies[bodyName];
                if (body) {
                    components.requestBodies[bodyName] = body;
                }
            }
        }

        if (this.document.components.securitySchemes && collector.getSecuritySchemes().size > 0) {
            components.securitySchemes = {};
            for (const schemeName of collector.getSecuritySchemes()) {
                const scheme = this.document.components.securitySchemes[schemeName];
                if (scheme) {
                    components.securitySchemes[schemeName] = scheme;
                }
            }
        }

        if (this.document.components.headers && collector.getHeaders().size > 0) {
            components.headers = {};
            for (const headerName of collector.getHeaders()) {
                const header = this.document.components.headers[headerName];
                if (header) {
                    components.headers[headerName] = header;
                }
            }
        }

        if (this.document.components.examples && collector.getExamples().size > 0) {
            components.examples = {};
            for (const exampleName of collector.getExamples()) {
                const example = this.document.components.examples[exampleName];
                if (example) {
                    components.examples[exampleName] = example;
                }
            }
        }

        if (this.document.components.links && collector.getLinks().size > 0) {
            components.links = {};
            for (const linkName of collector.getLinks()) {
                const link = this.document.components.links[linkName];
                if (link) {
                    components.links[linkName] = link;
                }
            }
        }

        if (this.document.components.callbacks && collector.getCallbacks().size > 0) {
            components.callbacks = {};
            for (const callbackName of collector.getCallbacks()) {
                const callback = this.document.components.callbacks[callbackName];
                if (callback) {
                    components.callbacks[callbackName] = callback;
                }
            }
        }

        return Object.keys(components).length > 0 ? components : undefined;
    }

    private collectStatistics(): PruneStatistics {
        let endpointCount = 0;
        for (const pathItem of Object.values(this.document.paths)) {
            if (!pathItem) {
                continue;
            }
            const methods: HttpMethod[] = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];
            for (const method of methods) {
                if (pathItem[method]) {
                    endpointCount++;
                }
            }
        }

        return {
            originalEndpoints: endpointCount,
            prunedEndpoints: 0,
            originalSchemas: Object.keys(this.document.components?.schemas ?? {}).length,
            prunedSchemas: 0,
            originalParameters: Object.keys(this.document.components?.parameters ?? {}).length,
            prunedParameters: 0,
            originalResponses: Object.keys(this.document.components?.responses ?? {}).length,
            prunedResponses: 0,
            originalRequestBodies: Object.keys(this.document.components?.requestBodies ?? {}).length,
            prunedRequestBodies: 0,
            originalSecuritySchemes: Object.keys(this.document.components?.securitySchemes ?? {}).length,
            prunedSecuritySchemes: 0
        };
    }

    private collectPrunedStatistics(document: OpenAPIV3.Document): PruneStatistics {
        let endpointCount = 0;
        for (const pathItem of Object.values(document.paths)) {
            if (!pathItem) {
                continue;
            }
            const methods: HttpMethod[] = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];
            for (const method of methods) {
                if (pathItem[method]) {
                    endpointCount++;
                }
            }
        }

        return {
            originalEndpoints: endpointCount,
            prunedEndpoints: 0,
            originalSchemas: Object.keys(document.components?.schemas ?? {}).length,
            prunedSchemas: 0,
            originalParameters: Object.keys(document.components?.parameters ?? {}).length,
            prunedParameters: 0,
            originalResponses: Object.keys(document.components?.responses ?? {}).length,
            prunedResponses: 0,
            originalRequestBodies: Object.keys(document.components?.requestBodies ?? {}).length,
            prunedRequestBodies: 0,
            originalSecuritySchemes: Object.keys(document.components?.securitySchemes ?? {}).length,
            prunedSecuritySchemes: 0
        };
    }
}
