export { AutoVersioningCache, type CachedAnalysis } from "./AutoVersioningCache.js";
export {
    AutoVersioningException,
    AutoVersioningService,
    type AutoVersionResult,
    countFilesInDiff,
    formatSizeKB
} from "./AutoVersioningService.js";
export {
    AUTO_VERSION,
    extractLanguageFromGeneratorName,
    extractPreviousVersionFromDiffLine,
    incrementVersion,
    isAutoVersion,
    isValidSemver,
    MAGIC_VERSION,
    MAGIC_VERSION_PYTHON,
    MAX_AI_DIFF_BYTES,
    MAX_CHUNKS,
    MAX_RAW_DIFF_BYTES,
    mapMagicVersionForLanguage,
    maxVersionBump,
    VersionBump
} from "./VersionUtils.js";
