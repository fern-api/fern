import { OpenAPI as OpenAPITypes } from "openapi-types";

export type API = OpenAPI;

export interface OpenAPI {
    type: "openapi";
    openapi: OpenAPITypes.Document;
    overrides?: OpenAPITypes.Document;
}
