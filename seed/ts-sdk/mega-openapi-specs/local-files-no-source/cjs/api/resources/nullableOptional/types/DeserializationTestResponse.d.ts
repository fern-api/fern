import type * as SeedApi from "../../../index.js";
/**
 * Response for deserialization test
 */
export interface DeserializationTestResponse {
    echo: SeedApi.nullableOptional.DeserializationTestRequest;
    processedAt: string;
    nullCount: number;
    presentFieldsCount: number;
}
