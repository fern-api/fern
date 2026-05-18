/**
 * @example
 *     {
 *         requiredField: "requiredField"
 *     }
 */
export interface OptionalMergePatchTestServiceRequest {
    requiredField: string;
    optionalString?: string | null;
    optionalInteger?: number | null;
    optionalBoolean?: boolean | null;
    nullableString: string | null;
}
