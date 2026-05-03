/**
 * In-tree PEP 440 validator covering the dev release + local-version segment
 * shapes produced by `computePypiPreviewVersion`. NOT a full PEP 440 parser:
 * we only validate the subset we generate, which is enough to lock the format
 * contract via tests and to surface mistakes if the generator drifts.
 *
 * Spec references:
 *   PEP 440 §"Local version identifiers": [N!]N(.N)*[{a|b|c|rc|alpha|beta|pre|preview}N][.postN][.devN][+local]
 *   Local segment: ([a-z0-9]+(?:[-_.][a-z0-9]+)*) - we restrict to dots only.
 */

const PEP_440_DEV_LOCAL_REGEX = /^(?:\d+!)?\d+(?:\.\d+)*(?:\.dev\d+)?(?:\+[a-z0-9]+(?:\.[a-z0-9]+)*)?$/;

const MAX_LOCAL_SEGMENT_LENGTH = 64;

export function isValidPep440DevLocalVersion(version: string): boolean {
    if (typeof version !== "string" || version.length === 0) {
        return false;
    }
    if (!PEP_440_DEV_LOCAL_REGEX.test(version)) {
        return false;
    }
    const plusIdx = version.indexOf("+");
    if (plusIdx !== -1) {
        const local = version.slice(plusIdx + 1);
        if (local.length === 0 || local.length > MAX_LOCAL_SEGMENT_LENGTH) {
            return false;
        }
    }
    return true;
}
