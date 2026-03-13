/**
 * Tests that unknown/any values containing backslashes in map keys
 * are properly escaped in Go string literals.
 */
export interface ObjectWithUnknownField {
    unknown?: unknown | undefined;
}
