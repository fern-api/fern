/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernOpenapiIr from "../../../index";

export interface MapSchemaWithExample
    extends FernOpenapiIr.WithSdkGroupName,
        FernOpenapiIr.WithNamespace,
        FernOpenapiIr.WithName,
        FernOpenapiIr.WithDescription,
        FernOpenapiIr.WithAvailability,
        FernOpenapiIr.WithEncoding,
        FernOpenapiIr.WithTitle,
        FernOpenapiIr.WithInline {
    key: FernOpenapiIr.PrimitiveSchemaWithExample;
    value: FernOpenapiIr.SchemaWithExample;
    example: unknown | undefined;
}
