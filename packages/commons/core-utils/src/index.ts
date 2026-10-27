// Force cache invalidation for CI - server URL templating feature
export { addPrefixToString } from "./addPrefixToString.js";
export {
    type AnyOfConstraintSchemaLike,
    anyOfIsPresenceConstraint,
    isPresenceConstraintBranch,
    oneOfIsPresenceConstraint,
    requiredByPresenceConstraint
} from "./anyOfPresenceConstraint.js";
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
export { asyncPool } from "./asyncPool.js";
export { capitalizeFirstLetter } from "./capitalizeFirstLetter.js";
export { convertNumberToSnakeCase } from "./convertNumberToSnakeCase.js";
export { decodeJsonPointerSegment } from "./decodeJsonPointerSegment.js";
export { delay } from "./delay/delay.js";
export { withMinimumTime } from "./delay/withMinimumTime.js";
export { EMPTY_ARRAY, EMPTY_OBJECT } from "./empty.js";
export { errorMessageOrString } from "./errorMessageOrString.js";
export * as Examples from "./examples.js";
export { extractErrorMessage } from "./extractErrorMessage.js";
export { FERN_CA_BUNDLE_ENV_VAR, FERN_JAVA_SKIP_FORMATTING_ENV_VAR } from "./fernEnvVars.js";
export { getDuplicates } from "./getDuplicates.js";
export { isCommitSha, isGitAvailable } from "./gitUtils.js";
export { identity } from "./identity.js";
export { hasErrnoCode, isEnoentError } from "./isEnoentError.js";
export { isEnvVarTruthy } from "./isEnvVarTruthy.js";
export { isHttpUrl } from "./isHttpUrl.js";
export { isNonNullish } from "./isNonNullish.js";
export { MediaType } from "./mediaType.js";
export { mergeWithOverrides } from "./mergeWithOverrides.js";
export { nonEmpty } from "./nonEmpty.js";
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
export { isRecord } from "./objects/isRecord.js";
export { keys } from "./objects/keys.js";
export { mapValues } from "./objects/mapValues.js";
export { type Values, values } from "./objects/values.js";
export { parseEndpointLocator } from "./parseEndpointLocator.js";
export { PLATFORM, type Platform } from "./platform.js";
export { removeSuffix } from "./removeSuffix.js";
export { replaceEnvVariables } from "./replaceEnvVars.js";
export { SymbolRegistry, type SymbolRegistryOptions } from "./SymbolRegistry.js";
export { sanitizeChangelogEntry } from "./sanitizeChangelogEntry.js";
export { SKIP_MARKER, sanitizeNullValues } from "./sanitizeNullValues.js";
export { sanitizePreviewId } from "./sanitizePreviewId.js";
export { diffSemverOrThrow, parseSemverOrThrow } from "./semverUtils.js";
export { type SetRequired } from "./setRequired.js";
export { stripLeadingSlash } from "./stripLeadingSlash.js";
export { stripTrailingSlashes } from "./stripTrailingSlashes.js";
export { titleCase } from "./titleCase.js";
export { tokenizeOperationId } from "./tokenizeOperationId.js";
export type { ContainerRunner, Digit, Letter, LowercaseLetter, UppercaseLetter } from "./types.js";
export { validateAgainstJsonSchema } from "./validateAgainstJsonSchema.js";
export { visitDiscriminatedUnion } from "./visitDiscriminatedUnion.js";
export type { WithoutQuestionMarks } from "./withoutQuestionMarks.js";
