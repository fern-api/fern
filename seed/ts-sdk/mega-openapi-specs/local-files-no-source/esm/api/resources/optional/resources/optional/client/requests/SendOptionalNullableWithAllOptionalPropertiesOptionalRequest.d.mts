import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         actionId: "actionId",
 *         id: "id",
 *         body: {}
 *     }
 */
export interface SendOptionalNullableWithAllOptionalPropertiesOptionalRequest {
    actionId: string;
    id: string;
    body: SeedApi.optional.DeployParams | null;
}
