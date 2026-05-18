import type * as SeedApi from "../../../index.mjs";
/**
 * Response for deserialization test
 */
export interface DeserializationTestResponse {
    echo: SeedApi.nullableOptional.DeserializationTestRequest;
    processedAt: string;
    nullCount: number;
    presentFieldsCount: number;
}
