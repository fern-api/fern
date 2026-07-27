import { toCamelCase } from "./toCamelCase.js";

/**
 * Derives the wrapper property name under which OAuth credentials are nested when
 * multiple auth schemes are present (e.g. `OAuth` -> `oauth`, `magical_auth` -> `magicalAuth`).
 *
 * This is the single source of truth for the OAuth wrapper key. Both
 * `OAuthAuthProviderGenerator` (which emits `WRAPPER_PROPERTY` into the generated
 * SDK) and `ReadmeSnippetBuilder` (which documents the key users must nest under)
 * call this helper so their derivations cannot drift apart — any change to casing,
 * keyword escaping, or smart-casing lives here and applies to both.
 *
 * @param oauthSchemeKey The `key` of the OAuth `AuthScheme`.
 * @returns The camelCased wrapper property name.
 */
export function getOAuthWrapperPropertyName(oauthSchemeKey: string): string {
    return toCamelCase(oauthSchemeKey);
}
