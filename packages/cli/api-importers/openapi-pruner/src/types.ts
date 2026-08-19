import { OpenAPIV3 } from "openapi-types";

export type HttpMethod = "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace";

export interface EndpointSelector {
    path: string;
    method?: HttpMethod;
}

export interface PruneOptions {
    endpoints: EndpointSelector[];
    document: OpenAPIV3.Document;
}

export interface PruneResult {
    document: OpenAPIV3.Document;
    statistics: PruneStatistics;
}

export interface PruneStatistics {
    originalEndpoints: number;
    prunedEndpoints: number;
    originalSchemas: number;
    prunedSchemas: number;
    originalParameters: number;
    prunedParameters: number;
    originalResponses: number;
    prunedResponses: number;
    originalRequestBodies: number;
    prunedRequestBodies: number;
    originalSecuritySchemes: number;
    prunedSecuritySchemes: number;
}

export type SchemaReference = string;
export type ComponentReference = string;
