const RUBY_FILE_EXTENSION = ".rb";

/**
 * Maximum length (in characters) for a generated Ruby filename, including its
 * extension. RubyGems packages gems into a tar format whose header caps a
 * file's name at 100 characters, so `gem build` fails with
 * `Gem::Package::TooLongFileName` for anything longer. This limit is fixed in
 * RubyGems — there is no build flag to raise it — so filenames must be capped
 * at generation time. Deeply nested inline types (e.g. anonymous `oneOf`
 * variants) can otherwise produce names well over 100 characters.
 */
export const MAX_RUBY_FILE_NAME_LENGTH = 100;

/** Number of hex characters of the deterministic hash appended when truncating. */
const TRUNCATION_HASH_LENGTH = 6;

/**
 * Deterministic, dependency-free 32-bit FNV-1a hash rendered as hex. Used to
 * disambiguate filenames that share a truncated prefix. Deterministic so the
 * on-disk filename and its `require_relative` always agree, and so regenerating
 * the same IR always produces the same output.
 */
function deterministicShortHash(input: string): string {
    let hash = 0x811c9dc5; // FNV offset basis
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193); // FNV prime
    }
    return (hash >>> 0).toString(16).padStart(8, "0").slice(0, TRUNCATION_HASH_LENGTH);
}

/**
 * Builds a Ruby filename from an already snake_cased base name, capping the
 * result at {@link MAX_RUBY_FILE_NAME_LENGTH} so `gem build` does not fail with
 * `Gem::Package::TooLongFileName`.
 *
 * When the name fits, `<snakeName>.rb` is returned verbatim (unchanged
 * behavior). Otherwise the name is truncated and a short deterministic hash of
 * the full name is appended to keep it unique within its directory. Because the
 * hash is derived from the full name, two distinct names that share a truncated
 * prefix still produce distinct filenames.
 */
export function buildRubyTypeFileName(snakeName: string): string {
    if (snakeName.length + RUBY_FILE_EXTENSION.length <= MAX_RUBY_FILE_NAME_LENGTH) {
        return snakeName + RUBY_FILE_EXTENSION;
    }
    const hash = deterministicShortHash(snakeName);
    // Reserve room for: "_" separator + hash + extension.
    const maxPrefixLength = MAX_RUBY_FILE_NAME_LENGTH - RUBY_FILE_EXTENSION.length - 1 - hash.length;
    const prefix = snakeName.slice(0, maxPrefixLength).replace(/_+$/, "");
    return `${prefix}_${hash}${RUBY_FILE_EXTENSION}`;
}
