/**
 * @example
 *     {
 *         pathParam: "pathParam",
 *         serviceParam: "serviceParam",
 *         endpointParam: 1,
 *         resourceParam: "resourceParam"
 *     }
 */
export interface PostServiceRequest {
    pathParam: string;
    serviceParam: string;
    endpointParam: number;
    resourceParam: string;
}
