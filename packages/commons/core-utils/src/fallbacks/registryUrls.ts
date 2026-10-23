/**
 * Public package registries SDKs are published to when `generators.yml` does not set an output `url`.
 * These are the publish URLs; the URLs used to look up published versions are different for some registries.
 */
export const DEFAULT_NPM_REGISTRY_URL = "https://registry.npmjs.org";
export const DEFAULT_PYPI_UPLOAD_URL = "https://upload.pypi.org/legacy/";
export const DEFAULT_NUGET_REGISTRY_URL = "https://nuget.org/";
export const DEFAULT_RUBYGEMS_REGISTRY_URL = "https://rubygems.org/";
export const DEFAULT_CRATES_REGISTRY_URL = "https://crates.io/api/v1/crates";
