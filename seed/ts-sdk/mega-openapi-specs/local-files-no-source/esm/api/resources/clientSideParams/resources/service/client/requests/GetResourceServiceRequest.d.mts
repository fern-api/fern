/**
 * @example
 *     {
 *         resourceId: "resourceId",
 *         include_metadata: true,
 *         format: "format"
 *     }
 */
export interface GetResourceServiceRequest {
    resourceId: string;
    /** Include metadata in response */
    include_metadata: boolean;
    /** Response format */
    format: string;
}
