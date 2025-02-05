import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export interface CasingConfig {
    snake?: string;
    camel?: string;
    screamingSnake?: string;
    pascal?: string;
}

export type FernEnumConfig = Record<string, { description?: string; name?: string; casing?: CasingConfig }>;

export function getFernEnum(schema: OpenAPIV3.SchemaObject): FernEnumConfig | undefined {
    return getExtension<FernEnumConfig>(schema, FernOpenAPIExtension.FERN_ENUM);
}
