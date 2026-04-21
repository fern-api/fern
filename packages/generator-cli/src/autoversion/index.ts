export {
    AutoVersioningException,
    AutoVersioningService,
    countFilesInDiff,
    formatSizeKB,
    type AutoVersionResult
} from "./AutoVersioningService.js";
export { AutoVersioningCache, type CachedAnalysis } from "./AutoVersioningCache.js";
export {
    AUTO_VERSION,
    extractLanguageFromGeneratorName,
    extractPreviousVersionFromDiffLine,
    incrementVersion,
    isAutoVersion,
    MAGIC_VERSION,
    MAGIC_VERSION_PYTHON,
    mapMagicVersionForLanguage,
    MAX_AI_DIFF_BYTES,
    MAX_CHUNKS,
    MAX_RAW_DIFF_BYTES,
    maxVersionBump,
    VersionBump
} from "./VersionUtils.js";
