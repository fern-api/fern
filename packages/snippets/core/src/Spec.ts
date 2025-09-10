import { OpenAPIWorkspace } from "@fern-api/browser-compatible-fern-workspace";
import { dynamic } from "@fern-api/ir-sdk";
import { OpenAPI as OpenAPITypes } from "openapi-types";

export type Spec = OpenAPISpec | DynamicIntermediateRepresentationSpec;

export interface OpenAPISpec {
    type: "openapi";
    openapi: OpenAPITypes.Document;
    overrides?: Partial<OpenAPITypes.Document>;
    settings?: OpenAPIWorkspace.Settings;
}

export interface DynamicIntermediateRepresentationSpec {
    type: "dynamic";
    ir: dynamic.DynamicIntermediateRepresentation;
}
