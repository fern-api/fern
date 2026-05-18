/**
 * @example
 *     {
 *         plantId: "plantId",
 *         body: {
 *             "name": "Updated Venus Flytrap",
 *             "care": {
 *                 "light": "partial shade"
 *             }
 *         }
 *     }
 */
export interface UpdatePlantRequest {
    plantId: string;
    body?: unknown;
}
