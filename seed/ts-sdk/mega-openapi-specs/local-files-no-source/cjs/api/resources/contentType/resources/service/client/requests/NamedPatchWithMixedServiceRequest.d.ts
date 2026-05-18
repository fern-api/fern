/**
 * @example
 *     {
 *         id: "id"
 *     }
 */
export interface NamedPatchWithMixedServiceRequest {
    id: string;
    appId?: string | null;
    instructions: string | null;
    active: boolean | null;
}
