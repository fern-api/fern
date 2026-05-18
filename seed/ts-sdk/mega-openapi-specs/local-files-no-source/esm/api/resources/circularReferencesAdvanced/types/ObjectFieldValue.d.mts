import type * as SeedApi from "../../../index.mjs";
/**
 * This type allows us to test a circular reference with a union type (see FieldValue).
 */
export interface ObjectFieldValue {
    name: SeedApi.circularReferencesAdvanced.FieldName;
    value: SeedApi.circularReferencesAdvanced.FieldValue;
}
