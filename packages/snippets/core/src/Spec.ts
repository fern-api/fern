import { OpenAPI as OpenAPITypes } from "openapi-types";

import { OpenAPIWorkspace } from "@fern-api/browser-compatible-fern-workspace";

export type Spec = OpenAPISpec;

export interface OpenAPISpec {
    type: "openapi";
    openapi: OpenAPITypes.Document;
    overrides?: Partial<OpenAPITypes.Document>;
    settings?: OpenAPIWorkspace.Settings;
}
