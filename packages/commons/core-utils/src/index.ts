// Force cache invalidation for CI - server URL templating feature
export { addPrefixToString } from "./addPrefixToString.js";
export { applyOpenAPIOverlay, type Overlay, type OverlayAction } from "./applyOpenAPIOverlay.js";
export {
    assert,
    assertDefined,
    assertNever,
    assertNeverNoThrow,
    assertNonNull,
    assertString,
    assertVoidNoThrow
} from "./assert.js";
export { delay } from "./delay/delay.js";
export { withMinimumTime } from "./delay/withMinimumTime.js";
export { EMPTY_ARRAY, EMPTY_OBJECT } from "./empty.js";
export * as Examples from "./examples.js";
export { extractErrorMessage } from "./extractErrorMessage.js";
export { getDuplicates } from "./getDuplicates.js";
export { identity } from "./identity.js";
export { isNonNullish } from "./isNonNullish.js";
export { MediaType } from "./mediaType.js";
export { mergeWithOverrides } from "./mergeWithOverrides.js";
export { noop } from "./noop.js";
export {
    haveSameNullishness,
    nullIfNullish,
    nullIfSomeNullish,
    undefinedIfNullish,
    undefinedIfSomeNullish
} from "./nullishUtils.js";
export { type ObjectPropertiesVisitor, visitObject, visitObjectAsync } from "./ObjectPropertiesVisitor.js";
export { type Entries, entries } from "./objects/entries.js";
export { isPlainObject } from "./objects/isPlainObject.js";
export { keys } from "./objects/keys.js";
export { mapValues } from "./objects/mapValues.js";
export { type Values, values } from "./objects/values.js";
export { parseEndpointLocator } from "./parseEndpointLocator.js";
export { PLATFORM, type Platform } from "./platform.js";
export { removeSuffix } from "./removeSuffix.js";
export { replaceEnvVariables } from "./replaceEnvVars.js";
export { SymbolRegistry, type SymbolRegistryOptions } from "./SymbolRegistry.js";
export { SKIP_MARKER, sanitizeNullValues } from "./sanitizeNullValues.js";
export { diffSemverOrThrow, parseSemverOrThrow } from "./semverUtils.js";
export { type SetRequired } from "./setRequired.js";
export { stripLeadingSlash } from "./stripLeadingSlash.js";
export { titleCase } from "./titleCase.js";
export type { ContainerRunner, Digit, Letter, LowercaseLetter, UppercaseLetter } from "./types.js";
export { validateAgainstJsonSchema } from "./validateAgainstJsonSchema.js";
export { visitDiscriminatedUnion } from "./visitDiscriminatedUnion.js";
export type { WithoutQuestionMarks } from "./withoutQuestionMarks.js";
