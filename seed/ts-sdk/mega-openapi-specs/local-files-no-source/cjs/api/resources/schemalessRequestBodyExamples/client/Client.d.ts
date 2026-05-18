import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedApi from "../../../index.js";
export declare namespace SchemalessRequestBodyExamplesClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class SchemalessRequestBodyExamplesClient {
    protected readonly _options: NormalizedClientOptions<SchemalessRequestBodyExamplesClient.Options>;
    constructor(options: SchemalessRequestBodyExamplesClient.Options);
    /**
     * Creates a plant with example JSON but no request body schema.
     *
     * @param {unknown} request
     * @param {SchemalessRequestBodyExamplesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.schemalessRequestBodyExamples.createPlant({
     *         "name": "Venus Flytrap",
     *         "species": "Dionaea muscipula",
     *         "care": {
     *             "light": "full sun",
     *             "water": "distilled only",
     *             "humidity": "high"
     *         },
     *         "tags": [
     *             "carnivorous",
     *             "tropical"
     *         ]
     *     })
     */
    createPlant(request?: unknown, requestOptions?: SchemalessRequestBodyExamplesClient.RequestOptions): core.HttpResponsePromise<SeedApi.schemalessRequestBodyExamples.CreatePlantResponse>;
    private __createPlant;
    /**
     * Updates a plant with example JSON but no request body schema.
     *
     * @param {SeedApi.schemalessRequestBodyExamples.UpdatePlantRequest} request
     * @param {SchemalessRequestBodyExamplesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.schemalessRequestBodyExamples.updatePlant({
     *         plantId: "plantId",
     *         body: {
     *             "name": "Updated Venus Flytrap",
     *             "care": {
     *                 "light": "partial shade"
     *             }
     *         }
     *     })
     */
    updatePlant(request: SeedApi.schemalessRequestBodyExamples.UpdatePlantRequest, requestOptions?: SchemalessRequestBodyExamplesClient.RequestOptions): core.HttpResponsePromise<SeedApi.schemalessRequestBodyExamples.UpdatePlantResponse>;
    private __updatePlant;
    /**
     * A control endpoint that has both schema and example defined.
     *
     * @param {SeedApi.schemalessRequestBodyExamples.CreatePlantWithSchemaRequest} request
     * @param {SchemalessRequestBodyExamplesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.schemalessRequestBodyExamples.createPlantWithSchema({
     *         name: "Sundew",
     *         species: "Drosera capensis"
     *     })
     */
    createPlantWithSchema(request?: SeedApi.schemalessRequestBodyExamples.CreatePlantWithSchemaRequest, requestOptions?: SchemalessRequestBodyExamplesClient.RequestOptions): core.HttpResponsePromise<SeedApi.schemalessRequestBodyExamples.CreatePlantWithSchemaResponse>;
    private __createPlantWithSchema;
}
