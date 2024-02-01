import { OpenAPIV3 } from "openapi-types";
import { OpenAPIOverridesBuilder } from "./OpenAPIOverridesBuilder";

export interface Suggestion {
    name: string;
    /* Implementing the suggestion on OpenAPI specs */
    openapi: SuggestForOpenAPI;
}

export interface SuggestForOpenAPI {
    /**
     * Called when there are no existing OpenAPI overrides
     * @param openapi The OpenAPI document to initialize the suggestion with
     */
    initialize(openapi: OpenAPIV3.Document): Promise<void>;

    /**
     * Called when there are existing OpenAPI overrides to respect
     * @param openapi
     * @param overidesBuilder
     */
    update(openapi: OpenAPIV3.Document, overidesBuilder: OpenAPIOverridesBuilder): Promise<void>;
}
