import { ParseOpenAPIOptions } from "@fern-api/openapi-ir-parser";
import { ConvertOpenAPIOptions } from "@fern-api/openapi-ir-to-fern";

export type OpenAPISettings = ParseOpenAPIOptions & ConvertOpenAPIOptions;
