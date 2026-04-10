/**
 * Tests that unknown/any values containing backslashes in map keys
 * are properly escaped in Go string literals.
 */
export interface TypesObjectWithUnknownField {
    unknown?: unknown | undefined;
}
