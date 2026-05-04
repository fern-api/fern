/**
 * Tests that dynamic snippets include all required properties even when
 * the example data only provides a subset. In C#, properties marked as
 * `required` must be set in the object initializer.
 */
export interface ObjectWithMixedRequiredAndOptionalFields {
    requiredString: string;
    requiredInteger: number;
    optionalString?: string | undefined;
    requiredLong: number;
}
