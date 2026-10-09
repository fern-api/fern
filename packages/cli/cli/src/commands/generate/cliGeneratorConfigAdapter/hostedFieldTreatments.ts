// Copied from postman-eng/sdk-gen-api src/build/fern-cli-bridge/mapper/treatments.json (commit b2744e65),
// the hosted bridge's treatment of every leaf of @postman/sdk-config 0.8.0 sdkConfigIrV1Schema.
// The local differences live in fieldTreatmentOverrides.ts; edit those, not this table.

import type { FieldTreatment } from "./fieldTreatments.js";

export const HOSTED_FIELD_TREATMENTS: Record<string, FieldTreatment> = {
    "api.audiences": { treatment: "Map", note: "IR build `--audience` (group `audiences`)." },
    "api.auth.endpointSecurity": { treatment: "Warn", note: "Not mapped: Fern reads endpoint security from the spec." },
    "api.auth.requirements[].schemes": {
        treatment: "Map",
        note: '`api.auth`: a single id, or `any:` for several entries. Several ids **in one entry** (all required) are rejected: Fern has no `all:` (`Unexpected key "all"`).'
    },
    "api.auth.schemes[].clientId.description": { treatment: "Warn", note: "SDK parameter naming; no FCG input." },
    "api.auth.schemes[].clientId.environmentVariable": {
        treatment: "Map",
        note: "Client credentials: `client-id-env` / `client-secret-env`."
    },
    "api.auth.schemes[].clientId.name": { treatment: "Warn", note: "SDK parameter naming; no FCG input." },
    "api.auth.schemes[].clientId.omit": { treatment: "Warn", note: "SDK parameter naming; no FCG input." },
    "api.auth.schemes[].clientSecret.description": { treatment: "Warn", note: "SDK parameter naming; no FCG input." },
    "api.auth.schemes[].clientSecret.environmentVariable": {
        treatment: "Map",
        note: "Client credentials: `client-id-env` / `client-secret-env`."
    },
    "api.auth.schemes[].clientSecret.name": { treatment: "Warn", note: "SDK parameter naming; no FCG input." },
    "api.auth.schemes[].clientSecret.omit": { treatment: "Warn", note: "SDK parameter naming; no FCG input." },
    "api.auth.schemes[].description": { treatment: "Warn", note: "Scheme `docs` never reaches the IR." },
    "api.auth.schemes[].environmentVariable": {
        treatment: "Map",
        note: "API key header `name` and `env`; bearer token `env` (SDK Config carries `environmentVariable` on the scheme itself)."
    },
    "api.auth.schemes[].flows[].authorizationUrl": {
        treatment: "Map",
        note: "`authorization-url`, `token-url` / `get-token.endpoint` (matched to a spec `POST` operation), `scopes` (names only; scope descriptions have no effect)."
    },
    "api.auth.schemes[].flows[].refreshUrl": {
        treatment: "Warn",
        note: "Not mapped: the CLI fetches a new token instead of refreshing."
    },
    "api.auth.schemes[].flows[].scopes[].description": {
        treatment: "Warn",
        note: "Scope descriptions have no effect."
    },
    "api.auth.schemes[].flows[].scopes[].name": { treatment: "Map", note: "OAuth `scopes`." },
    "api.auth.schemes[].flows[].tokenUrl": {
        treatment: "Map",
        note: "`authorization-url`, `token-url` / `get-token.endpoint` (matched to a spec `POST` operation), `scopes` (names only; scope descriptions have no effect)."
    },
    "api.auth.schemes[].flows[].type": {
        treatment: "Map",
        note: "`client-credentials` and `authorization-code` map. `implicit` and `password` are rejected (Fern: `Expected enum`)."
    },
    "api.auth.schemes[].header": {
        treatment: "Map",
        note: "Bearer custom header: rejected, `scheme: bearer` has no such key."
    },
    "api.auth.schemes[].id": {
        treatment: "Map",
        note: "Scheme key and kind. Type `custom` is rejected (no `generators.yml` equivalent)."
    },
    "api.auth.schemes[].location": {
        treatment: "Map",
        note: "API key `header` maps. `query` and `cookie` are rejected: Fern either stops (`Endpoint requires auth, but no auth is defined`) or drops the scheme, leaving a CLI with no auth."
    },
    "api.auth.schemes[].name": {
        treatment: "Map",
        note: "API key header `name` and `env`; bearer token `env` (SDK Config carries `environmentVariable` on the scheme itself)."
    },
    "api.auth.schemes[].parameters[].environmentVariable": {
        treatment: "Reject",
        note: "Belongs to the `custom` scheme type, which is rejected."
    },
    "api.auth.schemes[].parameters[].location": {
        treatment: "Reject",
        note: "Belongs to the `custom` scheme type, which is rejected."
    },
    "api.auth.schemes[].parameters[].name": {
        treatment: "Reject",
        note: "Belongs to the `custom` scheme type, which is rejected."
    },
    "api.auth.schemes[].parameters[].prefix": {
        treatment: "Reject",
        note: "Belongs to the `custom` scheme type, which is rejected."
    },
    "api.auth.schemes[].password.description": {
        treatment: "Warn",
        note: "`name` reaches the IR but changes no output; `description` never reaches the IR."
    },
    "api.auth.schemes[].password.environmentVariable": {
        treatment: "Map",
        note: "Basic `username` / `password`: `env`, `omit`."
    },
    "api.auth.schemes[].password.name": {
        treatment: "Warn",
        note: "`name` reaches the IR but changes no output; `description` never reaches the IR."
    },
    "api.auth.schemes[].password.omit": { treatment: "Map", note: "Basic `username` / `password`: `env`, `omit`." },
    "api.auth.schemes[].prefix": {
        treatment: "Map",
        note: "API key `prefix` maps. **Bearer** `prefix` is rejected: `scheme: bearer` has no such key (a header-scheme workaround changes the env var default and SDK shape; B13)."
    },
    "api.auth.schemes[].refreshBufferSeconds": { treatment: "Warn", note: "No Fern key (`Unexpected key`)." },
    "api.auth.schemes[].tokenHeader": { treatment: "Map", note: "`token-header`." },
    "api.auth.schemes[].tokenPrefix": {
        treatment: "Map",
        note: "`token-prefix`. SDK Config does not allow an empty prefix, so a header with no prefix cannot be expressed."
    },
    "api.auth.schemes[].type": {
        treatment: "Map",
        note: "Scheme key and kind. Type `custom` is rejected (no `generators.yml` equivalent)."
    },
    "api.auth.schemes[].username.description": {
        treatment: "Warn",
        note: "`name` reaches the IR but changes no output; `description` never reaches the IR."
    },
    "api.auth.schemes[].username.environmentVariable": {
        treatment: "Map",
        note: "Basic `username` / `password`: `env`, `omit`."
    },
    "api.auth.schemes[].username.name": {
        treatment: "Warn",
        note: "`name` reaches the IR but changes no output; `description` never reaches the IR."
    },
    "api.auth.schemes[].username.omit": { treatment: "Map", note: "Basic `username` / `password`: `env`, `omit`." },
    "api.baseUrl": {
        treatment: "Warn",
        note: "`default-url` is accepted but ignored for OpenAPI-based definitions. A one-entry `environments` map is the alternative (untested for this purpose)."
    },
    "api.defaultEnvironment": { treatment: "Map", note: "`api.default-environment`." },
    "api.environmentVariables[].defaultValue": { treatment: "Warn", note: "No FCG input." },
    "api.environmentVariables[].description": { treatment: "Warn", note: "No FCG input." },
    "api.environmentVariables[].name": { treatment: "Warn", note: "No FCG input." },
    "api.environments[].description": {
        treatment: "Warn",
        note: "Reaches the IR or is dropped; no FCG output change."
    },
    "api.environments[].name": {
        treatment: "Map",
        note: "`api.environments`: name as key, **one URL per environment**. Several URLs per environment are rejected until endpoints are mapped to URLs (Fern requires each endpoint to choose a `url`)."
    },
    "api.environments[].urls[].name": {
        treatment: "Map",
        note: "`api.environments`: name as key, **one URL per environment**. Several URLs per environment are rejected until endpoints are mapped to URLs (Fern requires each endpoint to choose a `url`)."
    },
    "api.environments[].urls[].serverName": {
        treatment: "Warn",
        note: "Reaches the IR or is dropped; no FCG output change."
    },
    "api.environments[].urls[].url": {
        treatment: "Map",
        note: "`api.environments`: name as key, **one URL per environment**. Several URLs per environment are rejected until endpoints are mapped to URLs (Fern requires each endpoint to choose a `url`)."
    },
    "api.headers[].description": {
        treatment: "Map",
        note: "`api.headers.<name>`: `env`, docs. Fern also accepts a header the spec already declares."
    },
    "api.headers[].environmentVariable": {
        treatment: "Map",
        note: "`api.headers.<name>`: `env`, docs. Fern also accepts a header the spec already declares."
    },
    "api.headers[].name": {
        treatment: "Map",
        note: "`api.headers.<name>`: `env`, docs. Fern also accepts a header the spec already declares."
    },
    "api.headers[].value": { treatment: "Warn", note: "Header `default` has no effect on FCG output." },
    "api.webhookSignature.algorithm": { treatment: "Warn", note: "Webhook verification has no meaning for a CLI." },
    "api.webhookSignature.bodyHashBinding.algorithm": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "api.webhookSignature.bodyHashBinding.encoding": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "api.webhookSignature.bodyHashBinding.location.name": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "api.webhookSignature.bodyHashBinding.location.type": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "api.webhookSignature.encoding": { treatment: "Warn", note: "Webhook verification has no meaning for a CLI." },
    "api.webhookSignature.header": { treatment: "Warn", note: "Webhook verification has no meaning for a CLI." },
    "api.webhookSignature.payloadFormat.bodySort": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "api.webhookSignature.payloadFormat.components": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "api.webhookSignature.payloadFormat.delimiter": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "api.webhookSignature.signaturePrefix": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "api.webhookSignature.timestamp.format": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "api.webhookSignature.timestamp.header": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "api.webhookSignature.timestamp.tolerance": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "api.webhookSignature.type": { treatment: "Warn", note: "Webhook verification has no meaning for a CLI." },
    "api.webhookSignature.urlNormalization.legacyQueryEncoding": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "api.webhookSignature.urlNormalization.portVariants": {
        treatment: "Warn",
        note: "Webhook verification has no meaning for a CLI."
    },
    "client.additionalConstructorParameters[].description": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.additionalConstructorParameters[].example": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.additionalConstructorParameters[].name": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.additionalConstructorParameters[].required": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.filePropertyStyle": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.multiTenant": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.pathParameterStyle": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.requestParameterStyle": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.respectOptionalRequestBody": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.responseHeaders": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.responseValidation": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.retry.backoffFactor": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.retry.enabled": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.retry.jitterMs": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.retry.maxAttempts": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.retry.maxDelayMs": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.retry.maxRetryAfterDelayMs": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.retry.methods": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.retry.retryDelayMs": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.retry.statusCodeProfile": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.retry.statusCodes": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.timeoutMs": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.tokenRefresh.accessTokenField": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.tokenRefresh.enabled": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.tokenRefresh.endpoint": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.tokenRefresh.refreshTokenField": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "client.useDefaultRequestParameterValues": {
        treatment: "Warn",
        note: "Library client behavior (retries, timeouts, request styles). The CLI's Rust runtime has fixed behavior; no FCG input."
    },
    "compatibility.legacyInput.kind": { treatment: "Ignore", note: "The SDK Config IR README forbids reading it." },
    "compatibility.legacyInput.value.*": { treatment: "Ignore", note: "The SDK Config IR README forbids reading it." },
    "compatibility.outputProfile": { treatment: "Ignore", note: "No FCG input." },
    "compatibility.unsupportedFields[].code": { treatment: "Warn", note: "Reported as a warning." },
    "compatibility.unsupportedFields[].owner": { treatment: "Warn", note: "Reported as a warning." },
    "compatibility.unsupportedFields[].path": { treatment: "Warn", note: "Reported as a warning." },
    "compatibility.unsupportedFields[].reason": { treatment: "Warn", note: "Reported as a warning." },
    "compatibility.unsupportedFields[].risk": { treatment: "Warn", note: "Reported as a warning." },
    "compatibility.unsupportedFields[].severity": { treatment: "Warn", note: "Reported as a warning." },
    "compatibility.unsupportedFields[].source": { treatment: "Warn", note: "Reported as a warning." },
    "compatibility.unsupportedFields[].suggestedAction": { treatment: "Warn", note: "Reported as a warning." },
    "docs.includeApiReference": { treatment: "Warn", note: "No FCG input." },
    "docs.readme.apiName": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.readme.apiReferenceLink": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.readme.bannerLink": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.readme.customSections[].content": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.readme.customSections[].title": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.readme.defaultEndpoint.method": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.readme.defaultEndpoint.path": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.readme.defaultEndpoint.stream": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.readme.disabledSections": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.readme.features.*[].method": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.readme.features.*[].path": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.readme.features.*[].stream": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.readme.introduction": {
        treatment: "Warn",
        note: "Reaches the IR as the generator `readme:` block, but FCG's README ignores it. Fern also requires a `language` on `customSections`, which SDK Config lacks."
    },
    "docs.referenceBaseUrl": { treatment: "Warn", note: "No FCG input." },
    "docs.snippets.enabled": { treatment: "Warn", note: "No FCG input." },
    "docs.snippets.format": { treatment: "Warn", note: "No FCG input." },
    "docs.snippets.outputPath": { treatment: "Warn", note: "No FCG input." },
    "generation.ai": { treatment: "Warn", note: "No FCG input." },
    "generation.allowMockClient": { treatment: "Warn", note: "No FCG input." },
    "generation.analytics.batchSize": { treatment: "Warn", note: "No FCG input." },
    "generation.analytics.enabled": { treatment: "Warn", note: "No FCG input." },
    "generation.analytics.endpoint": { treatment: "Warn", note: "No FCG input." },
    "generation.analytics.exportTimeoutMs": { treatment: "Warn", note: "No FCG input." },
    "generation.analytics.exporter": { treatment: "Warn", note: "No FCG input." },
    "generation.analytics.headers[].name": { treatment: "Warn", note: "No FCG input." },
    "generation.analytics.headers[].value": { treatment: "Warn", note: "No FCG input." },
    "generation.analytics.headers[].valueRef": { treatment: "Warn", note: "No FCG input." },
    "generation.analytics.scheduledDelayMs": { treatment: "Warn", note: "No FCG input." },
    "generation.buildAllModels": { treatment: "Warn", note: "No FCG input." },
    "generation.customCode.conflictStrategy": {
        treatment: "Warn",
        note: "FCG manages its own `.fernignore` for `custom.rs`; no FCG input."
    },
    "generation.customCode.enabled": {
        treatment: "Warn",
        note: "FCG manages its own `.fernignore` for `custom.rs`; no FCG input."
    },
    "generation.customCode.previousBuildId": {
        treatment: "Warn",
        note: "FCG manages its own `.fernignore` for `custom.rs`; no FCG input."
    },
    "generation.customCode.protectedFiles": {
        treatment: "Warn",
        note: "FCG manages its own `.fernignore` for `custom.rs`; no FCG input."
    },
    "generation.customCode.source.location": {
        treatment: "Warn",
        note: "FCG manages its own `.fernignore` for `custom.rs`; no FCG input."
    },
    "generation.customCode.source.type": {
        treatment: "Warn",
        note: "FCG manages its own `.fernignore` for `custom.rs`; no FCG input."
    },
    "generation.customCode.trackChanges": {
        treatment: "Warn",
        note: "FCG manages its own `.fernignore` for `custom.rs`; no FCG input."
    },
    "generation.customQueryPaths": { treatment: "Warn", note: "No FCG input." },
    "generation.devContainer": { treatment: "Warn", note: "No FCG input." },
    "generation.fernDefinitionMetadata.cliVersion": { treatment: "Warn", note: "No FCG input." },
    "generation.fernDefinitionMetadata.definitionS3DownloadUrl": { treatment: "Warn", note: "No FCG input." },
    "generation.fernDefinitionMetadata.outputPath": { treatment: "Warn", note: "No FCG input." },
    "generation.fernignoreContents": { treatment: "Warn", note: "No FCG input." },
    "generation.generateFullProject": { treatment: "Warn", note: "No FCG input." },
    "generation.hooks.dependencies[].groupId": { treatment: "Warn", note: "No FCG input." },
    "generation.hooks.dependencies[].name": { treatment: "Warn", note: "No FCG input." },
    "generation.hooks.dependencies[].version": { treatment: "Warn", note: "No FCG input." },
    "generation.hooks.enabled": { treatment: "Warn", note: "No FCG input." },
    "generation.hooks.source.location": { treatment: "Warn", note: "No FCG input." },
    "generation.hooks.source.type": { treatment: "Warn", note: "No FCG input." },
    "generation.ignoreFiles": { treatment: "Warn", note: "No FCG input." },
    "generation.includeDeprecatedOperations": { treatment: "Warn", note: "No FCG input." },
    "generation.includeOptionalSnippetParameters": { treatment: "Warn", note: "No FCG input." },
    "generation.includeWatermark": { treatment: "Warn", note: "No FCG input." },
    "generation.inferServiceNames": { treatment: "Warn", note: "No FCG input." },
    "generation.language.cli.paginationParameters": {
        treatment: "Warn",
        note: "Go CLI options (`skills`, `paginationParameters`); FCG has no equivalent."
    },
    "generation.language.cli.skills": {
        treatment: "Warn",
        note: "Go CLI options (`skills`, `paginationParameters`); FCG has no equivalent."
    },
    "generation.language.csharp.experimentalExplicitNullableOptional": { treatment: "Warn", note: "No FCG input." },
    "generation.language.csharp.explicitNamespaces": { treatment: "Warn", note: "No FCG input." },
    "generation.language.csharp.includeExceptionHandler": { treatment: "Warn", note: "No FCG input." },
    "generation.language.csharp.rootNamespaceForCoreClasses": { treatment: "Warn", note: "No FCG input." },
    "generation.language.csharp.simplifyObjectDictionaries": { treatment: "Warn", note: "No FCG input." },
    "generation.language.csharp.useOptionalWrapper": { treatment: "Warn", note: "No FCG input." },
    "generation.language.go.clientConstructorName": { treatment: "Warn", note: "No FCG input." },
    "generation.language.go.includeLegacyClientOptions": { treatment: "Warn", note: "No FCG input." },
    "generation.language.go.legacyComplexModels": { treatment: "Warn", note: "No FCG input." },
    "generation.language.go.smartCasing": { treatment: "Warn", note: "No FCG input." },
    "generation.language.go.unionVersion": { treatment: "Warn", note: "No FCG input." },
    "generation.language.java.asyncStyle": { treatment: "Warn", note: "No FCG input." },
    "generation.language.java.collapseOptionalNullable": { treatment: "Warn", note: "No FCG input." },
    "generation.language.java.gradleCentralDependencyManagement": { treatment: "Warn", note: "No FCG input." },
    "generation.language.java.gradleDistributionUrl": { treatment: "Warn", note: "No FCG input." },
    "generation.language.java.gradlePluginManagement": { treatment: "Warn", note: "No FCG input." },
    "generation.language.java.includeKotlinSnippets": { treatment: "Warn", note: "No FCG input." },
    "generation.language.java.packageLayout": { treatment: "Warn", note: "No FCG input." },
    "generation.language.java.useLocalDateForDates": { treatment: "Warn", note: "No FCG input." },
    "generation.language.kotlin.asyncStyle": { treatment: "Warn", note: "No FCG input." },
    "generation.language.kotlin.collapseOptionalNullable": { treatment: "Warn", note: "No FCG input." },
    "generation.language.kotlin.gradleCentralDependencyManagement": { treatment: "Warn", note: "No FCG input." },
    "generation.language.kotlin.gradleDistributionUrl": { treatment: "Warn", note: "No FCG input." },
    "generation.language.kotlin.gradlePluginManagement": { treatment: "Warn", note: "No FCG input." },
    "generation.language.kotlin.packageLayout": { treatment: "Warn", note: "No FCG input." },
    "generation.language.kotlin.useLocalDateForDates": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.allowCustomFetcher": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.bundle": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.compilerOptions.lib": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.compilerOptions.module": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.compilerOptions.target": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.consolidateTypeFiles": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.esmOnly": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.excludeAvailability": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.exportClassDefault": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.httpClient.name": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.namespaceExportName": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.namingStrategy": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.packageManager": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.packageManagerVersion": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.scripts[].command": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.scripts[].name": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.serdeLayer": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.serverDescription": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.serverName": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.testFramework": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.tools.exclude": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.tools.include": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.toolsets.*.exclude": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.toolsets.*.include": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.typescriptVersion": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.useBigInt": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.useBrandedStringAliases": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.useLegacyExports": { treatment: "Warn", note: "No FCG input." },
    "generation.language.mcp.zodVersion": { treatment: "Warn", note: "No FCG input." },
    "generation.language.php.generateClientInterfaces": { treatment: "Warn", note: "No FCG input." },
    "generation.language.php.propertyAccess": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.additionalInitExports[].from": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.additionalInitExports[].imports": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.alwaysInitializeOptionals": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.client.exportedFileName": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.client.fileName": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.defaultBytesStreamChunkSize": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.extras.*": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.followRedirectsByDefault": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.pydantic.frozen": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.pydantic.requireOptionalFields": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.pydantic.unionNaming": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.pydantic.useFieldAliases": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.pydantic.versionCompatibility": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.pydanticVersion": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.pythonVersion": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.recursionLimit": { treatment: "Warn", note: "No FCG input." },
    "generation.language.python.useTypedDictRequests": { treatment: "Warn", note: "No FCG input." },
    "generation.language.ruby.requirePaths": { treatment: "Warn", note: "No FCG input." },
    "generation.language.rust.capitalizeInitialisms": { treatment: "Warn", note: "No FCG input." },
    "generation.language.rust.dateTimeType": { treatment: "Warn", note: "No FCG input." },
    "generation.language.rust.defaultFeatures": { treatment: "Warn", note: "No FCG input." },
    "generation.language.rust.features.*": { treatment: "Warn", note: "No FCG input." },
    "generation.language.swift.moduleName": { treatment: "Warn", note: "No FCG input." },
    "generation.language.swift.nullableAsOptional": { treatment: "Warn", note: "No FCG input." },
    "generation.language.terraform.hideComputedDiff": { treatment: "Warn", note: "No FCG input." },
    "generation.language.terraform.mockAcceptance": { treatment: "Warn", note: "No FCG input." },
    "generation.language.terraform.planModifiers.attributes.enabled": { treatment: "Warn", note: "No FCG input." },
    "generation.language.terraform.planModifiers.attributes.sourceDir": { treatment: "Warn", note: "No FCG input." },
    "generation.language.terraform.planModifiers.resources.enabled": { treatment: "Warn", note: "No FCG input." },
    "generation.language.terraform.planModifiers.resources.sourceDir": { treatment: "Warn", note: "No FCG input." },
    "generation.language.terraform.providerModulePath": { treatment: "Warn", note: "No FCG input." },
    "generation.language.terraform.providerName": { treatment: "Warn", note: "No FCG input." },
    "generation.language.terraform.providerSchema.addressKey": { treatment: "Warn", note: "No FCG input." },
    "generation.language.terraform.providerSchema.authTokenKey": { treatment: "Warn", note: "No FCG input." },
    "generation.language.terraform.providerVersion": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.allowCustomFetcher": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.bundle": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.compilerOptions.lib": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.compilerOptions.module": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.compilerOptions.target": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.consolidateTypeFiles": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.esmOnly": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.exportClassDefault": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.httpClient.name": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.namespaceExportName": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.namingStrategy": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.packageManager": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.packageManagerVersion": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.scripts[].command": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.scripts[].name": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.serdeLayer": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.testFramework": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.typescriptVersion": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.useBigInt": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.useBrandedStringAliases": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.useLegacyExports": { treatment: "Warn", note: "No FCG input." },
    "generation.language.typescript.zodVersion": { treatment: "Warn", note: "No FCG input." },
    "generation.layout.outputDirectory": { treatment: "Warn", note: "No FCG input." },
    "generation.layout.packagePath": { treatment: "Warn", note: "No FCG input." },
    "generation.multipleResponses": { treatment: "Warn", note: "No FCG input." },
    "generation.naming.apiErrorName": { treatment: "Warn", note: "No FCG input." },
    "generation.naming.baseErrorName": { treatment: "Warn", note: "No FCG input." },
    "generation.naming.clientName": { treatment: "Warn", note: "No FCG input." },
    "generation.naming.environmentTypeName": { treatment: "Warn", note: "No FCG input." },
    "generation.naming.exportedClientName": { treatment: "Warn", note: "No FCG input." },
    "generation.naming.pagerName": { treatment: "Warn", note: "No FCG input." },
    "generation.naming.smartCasing": { treatment: "Warn", note: "No FCG input." },
    "generation.naming.smartCasingDigitWordBoundary": { treatment: "Warn", note: "No FCG input." },
    "generation.reservedKeywords": { treatment: "Warn", note: "No FCG input." },
    "generation.serialization.additionalProperties": { treatment: "Warn", note: "No FCG input." },
    "generation.serialization.enumRepresentation": { treatment: "Warn", note: "No FCG input." },
    "generation.serialization.inlineTypes": { treatment: "Warn", note: "No FCG input." },
    "generation.serialization.omitUndefined": { treatment: "Warn", note: "No FCG input." },
    "generation.streams.defaultChunkSizeBytes": { treatment: "Warn", note: "No FCG input." },
    "generation.streams.enabled": { treatment: "Warn", note: "No FCG input." },
    "generation.streams.fileResponseType": { treatment: "Warn", note: "No FCG input." },
    "generation.streams.responseType": { treatment: "Warn", note: "No FCG input." },
    "generation.unitTests.enabled": { treatment: "Warn", note: "No FCG input." },
    "generation.unitTests.exclusions": { treatment: "Warn", note: "No FCG input." },
    "generation.unitTests.mode": { treatment: "Warn", note: "No FCG input." },
    "generation.webSockets": { treatment: "Warn", note: "No FCG input." },
    "generation.wireTests.enabled": { treatment: "Map", note: "`customConfig.generateWireTests`." },
    "generation.wireTests.exclusions": { treatment: "Warn", note: "Other wire-test settings have no FCG input." },
    "generation.wireTests.fallbackToGeneratedErrorExamples": {
        treatment: "Warn",
        note: "Other wire-test settings have no FCG input."
    },
    "generation.wireTests.fixtureSource": { treatment: "Warn", note: "Other wire-test settings have no FCG input." },
    "generation.workflows[].outputName": { treatment: "Warn", note: "No FCG input." },
    "generation.workflows[].path": { treatment: "Warn", note: "No FCG input." },
    "output.credentialResolution": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.delivery": { treatment: "Ignore", note: "sdk-gen-api owns delivery; the expander forces zip output." },
    "output.fileName": { treatment: "Ignore", note: "sdk-gen-api owns delivery; the expander forces zip output." },
    "output.github.autoMerge": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.branch": { treatment: "Ignore", note: "sdk-gen-api owns delivery; the expander forces zip output." },
    "output.github.credentials.apiKey": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.credentials.password": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.credentials.token": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.credentials.username": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.credentialsRef": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.host": { treatment: "Ignore", note: "sdk-gen-api owns delivery; the expander forces zip output." },
    "output.github.license.customPath": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.license.type": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.mode": { treatment: "Ignore", note: "sdk-gen-api owns delivery; the expander forces zip output." },
    "output.github.privateRepository": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.replay.enabled": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.repository": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.reviewers.teams": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.reviewers.users": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.skipIfNoDiff": {
        treatment: "Ignore",
        note: "sdk-gen-api owns delivery; the expander forces zip output."
    },
    "output.github.verify": { treatment: "Ignore", note: "sdk-gen-api owns delivery; the expander forces zip output." },
    "output.path": { treatment: "Ignore", note: "sdk-gen-api owns delivery; the expander forces zip output." },
    "output.publish.apiKeyEnvironmentVariable": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.coordinate": { treatment: "Reject", note: "SDK Config rejects every publish registry for `cli`." },
    "output.publish.credentials.apiKey": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.credentials.password": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.credentials.token": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.credentials.username": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.credentialsRef": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.isPackagePrivate": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.mavenUrlEnvironmentVariable": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.passwordEnvironmentVariable": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.publishToJsr": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.registry": { treatment: "Reject", note: "SDK Config rejects every publish registry for `cli`." },
    "output.publish.releaseBranch": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.shouldGeneratePublishWorkflow": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.signature.keyId": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.signature.password": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.signature.secretKey": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.signatureEnvironmentVariables.keyIdEnvironmentVariable": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.signatureEnvironmentVariables.passwordEnvironmentVariable": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.signatureEnvironmentVariables.secretKeyEnvironmentVariable": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.signingCredentialsRef": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.tokenEnvironmentVariable": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.tolerateRepublish": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.trustedPublishing": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.url": { treatment: "Reject", note: "SDK Config rejects every publish registry for `cli`." },
    "output.publish.usernameEnvironmentVariable": {
        treatment: "Reject",
        note: "SDK Config rejects every publish registry for `cli`."
    },
    "output.publish.version": { treatment: "Reject", note: "SDK Config rejects every publish registry for `cli`." },
    "package.artifactId": { treatment: "Warn", note: "Other ecosystems' package fields; no Cargo input." },
    "package.authors[].email": {
        treatment: "Map",
        note: '`packageIdentity.authors` as `"Name <email>"` strings; also the MIT copyright holder.'
    },
    "package.authors[].name": {
        treatment: "Map",
        note: '`packageIdentity.authors` as `"Name <email>"` strings; also the MIT copyright holder.'
    },
    "package.authors[].url": { treatment: "Warn", note: "Cargo authors carry no URL." },
    "package.classifiers": { treatment: "Warn", note: "Other ecosystems' package fields; no Cargo input." },
    "package.description": {
        treatment: "Map",
        note: "`customConfig.packageIdentity.name` / `description` / `repository` / `homepage` / `keywords`."
    },
    "package.developers[].email": { treatment: "Warn", note: "Other ecosystems' package fields; no Cargo input." },
    "package.developers[].name": { treatment: "Warn", note: "Other ecosystems' package fields; no Cargo input." },
    "package.developers[].organization": {
        treatment: "Warn",
        note: "Other ecosystems' package fields; no Cargo input."
    },
    "package.developers[].organizationUrl": {
        treatment: "Warn",
        note: "Other ecosystems' package fields; no Cargo input."
    },
    "package.documentationUrl": { treatment: "Warn", note: "Other ecosystems' package fields; no Cargo input." },
    "package.extraDependencies[].defaultFeatures": {
        treatment: "Map",
        note: "`customConfig.extraDependencies` / `extraDevDependencies` (`packageName` to `package`). After adding any dependency, `cargo build --locked` fails (the shipped lockfile is stale); CI must build without `--locked`."
    },
    "package.extraDependencies[].environmentMarker": {
        treatment: "Reject",
        note: "Python-only dependency fields; confirmed ignored by Fern, so reject rather than drop."
    },
    "package.extraDependencies[].extras": {
        treatment: "Reject",
        note: "Python-only dependency fields; confirmed ignored by Fern, so reject rather than drop."
    },
    "package.extraDependencies[].features": {
        treatment: "Map",
        note: "`customConfig.extraDependencies` / `extraDevDependencies` (`packageName` to `package`). After adding any dependency, `cargo build --locked` fails (the shipped lockfile is stale); CI must build without `--locked`."
    },
    "package.extraDependencies[].name": {
        treatment: "Map",
        note: "`customConfig.extraDependencies` / `extraDevDependencies` (`packageName` to `package`). After adding any dependency, `cargo build --locked` fails (the shipped lockfile is stale); CI must build without `--locked`."
    },
    "package.extraDependencies[].optional": {
        treatment: "Map",
        note: "`customConfig.extraDependencies` / `extraDevDependencies` (`packageName` to `package`). After adding any dependency, `cargo build --locked` fails (the shipped lockfile is stale); CI must build without `--locked`."
    },
    "package.extraDependencies[].packageName": {
        treatment: "Map",
        note: "`customConfig.extraDependencies` / `extraDevDependencies` (`packageName` to `package`). After adding any dependency, `cargo build --locked` fails (the shipped lockfile is stale); CI must build without `--locked`."
    },
    "package.extraDependencies[].source.path": {
        treatment: "Map",
        note: "Cargo `path`, `git` (`url`), `rev` (`ref`; never `branch`), `registry`."
    },
    "package.extraDependencies[].source.ref": {
        treatment: "Map",
        note: "Cargo `path`, `git` (`url`), `rev` (`ref`; never `branch`), `registry`."
    },
    "package.extraDependencies[].source.registry": {
        treatment: "Map",
        note: "Cargo `path`, `git` (`url`), `rev` (`ref`; never `branch`), `registry`."
    },
    "package.extraDependencies[].source.subdirectory": {
        treatment: "Reject",
        note: "Python-only dependency fields; confirmed ignored by Fern, so reject rather than drop."
    },
    "package.extraDependencies[].source.type": {
        treatment: "Map",
        note: "Cargo `path`, `git` (`url`), `rev` (`ref`; never `branch`), `registry`."
    },
    "package.extraDependencies[].source.url": {
        treatment: "Map",
        note: "Cargo `path`, `git` (`url`), `rev` (`ref`; never `branch`), `registry`."
    },
    "package.extraDependencies[].version": {
        treatment: "Map",
        note: "`customConfig.extraDependencies` / `extraDevDependencies` (`packageName` to `package`). After adding any dependency, `cargo build --locked` fails (the shipped lockfile is stale); CI must build without `--locked`."
    },
    "package.extraDevDependencies[].defaultFeatures": {
        treatment: "Map",
        note: "`customConfig.extraDependencies` / `extraDevDependencies` (`packageName` to `package`). After adding any dependency, `cargo build --locked` fails (the shipped lockfile is stale); CI must build without `--locked`."
    },
    "package.extraDevDependencies[].environmentMarker": {
        treatment: "Reject",
        note: "Python-only dependency fields; confirmed ignored by Fern, so reject rather than drop."
    },
    "package.extraDevDependencies[].extras": {
        treatment: "Reject",
        note: "Python-only dependency fields; confirmed ignored by Fern, so reject rather than drop."
    },
    "package.extraDevDependencies[].features": {
        treatment: "Map",
        note: "`customConfig.extraDependencies` / `extraDevDependencies` (`packageName` to `package`). After adding any dependency, `cargo build --locked` fails (the shipped lockfile is stale); CI must build without `--locked`."
    },
    "package.extraDevDependencies[].name": {
        treatment: "Map",
        note: "`customConfig.extraDependencies` / `extraDevDependencies` (`packageName` to `package`). After adding any dependency, `cargo build --locked` fails (the shipped lockfile is stale); CI must build without `--locked`."
    },
    "package.extraDevDependencies[].optional": {
        treatment: "Reject",
        note: "FCG rejects `optional` on dev-dependencies."
    },
    "package.extraDevDependencies[].packageName": {
        treatment: "Map",
        note: "`customConfig.extraDependencies` / `extraDevDependencies` (`packageName` to `package`). After adding any dependency, `cargo build --locked` fails (the shipped lockfile is stale); CI must build without `--locked`."
    },
    "package.extraDevDependencies[].source.path": {
        treatment: "Map",
        note: "Cargo `path`, `git` (`url`), `rev` (`ref`; never `branch`), `registry`."
    },
    "package.extraDevDependencies[].source.ref": {
        treatment: "Map",
        note: "Cargo `path`, `git` (`url`), `rev` (`ref`; never `branch`), `registry`."
    },
    "package.extraDevDependencies[].source.registry": {
        treatment: "Map",
        note: "Cargo `path`, `git` (`url`), `rev` (`ref`; never `branch`), `registry`."
    },
    "package.extraDevDependencies[].source.subdirectory": {
        treatment: "Reject",
        note: "Python-only dependency fields; confirmed ignored by Fern, so reject rather than drop."
    },
    "package.extraDevDependencies[].source.type": {
        treatment: "Map",
        note: "Cargo `path`, `git` (`url`), `rev` (`ref`; never `branch`), `registry`."
    },
    "package.extraDevDependencies[].source.url": {
        treatment: "Map",
        note: "Cargo `path`, `git` (`url`), `rev` (`ref`; never `branch`), `registry`."
    },
    "package.extraDevDependencies[].version": {
        treatment: "Map",
        note: "`customConfig.extraDependencies` / `extraDevDependencies` (`packageName` to `package`). After adding any dependency, `cargo build --locked` fails (the shipped lockfile is stale); CI must build without `--locked`."
    },
    "package.extraPeerDependencies[].defaultFeatures": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    "package.extraPeerDependencies[].environmentMarker": {
        treatment: "Reject",
        note: "npm-only; no Cargo equivalent."
    },
    "package.extraPeerDependencies[].extras": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    "package.extraPeerDependencies[].features": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    "package.extraPeerDependencies[].name": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    "package.extraPeerDependencies[].optional": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    "package.extraPeerDependencies[].packageName": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    "package.extraPeerDependencies[].source.path": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    "package.extraPeerDependencies[].source.ref": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    "package.extraPeerDependencies[].source.registry": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    "package.extraPeerDependencies[].source.subdirectory": {
        treatment: "Reject",
        note: "npm-only; no Cargo equivalent."
    },
    "package.extraPeerDependencies[].source.type": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    "package.extraPeerDependencies[].source.url": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    "package.extraPeerDependencies[].version": { treatment: "Reject", note: "npm-only; no Cargo equivalent." },
    "package.groupId": { treatment: "Warn", note: "Other ecosystems' package fields; no Cargo input." },
    "package.homepage": {
        treatment: "Map",
        note: "`customConfig.packageIdentity.name` / `description` / `repository` / `homepage` / `keywords`."
    },
    "package.keywords": {
        treatment: "Map",
        note: "`customConfig.packageIdentity.name` / `description` / `repository` / `homepage` / `keywords`."
    },
    "package.license.name": {
        treatment: "Map",
        note: "`packageIdentity.license` (SPDX). A custom license file is rejected: nothing on the hosted path mounts it."
    },
    "package.license.path": {
        treatment: "Map",
        note: "`packageIdentity.license` (SPDX). A custom license file is rejected: nothing on the hosted path mounts it."
    },
    "package.license.type": {
        treatment: "Map",
        note: "`packageIdentity.license` (SPDX). A custom license file is rejected: nothing on the hosted path mounts it."
    },
    "package.license.url": { treatment: "Warn", note: "No effect." },
    "package.moduleName": { treatment: "Warn", note: "Other ecosystems' package fields; no Cargo input." },
    "package.modulePath": { treatment: "Warn", note: "Other ecosystems' package fields; no Cargo input." },
    "package.namespace": { treatment: "Warn", note: "Other ecosystems' package fields; no Cargo input." },
    "package.packageName": {
        treatment: "Map",
        note: "`customConfig.packageIdentity.name` / `description` / `repository` / `homepage` / `keywords`."
    },
    "package.projectUrls[].label": { treatment: "Warn", note: "Other ecosystems' package fields; no Cargo input." },
    "package.projectUrls[].url": { treatment: "Warn", note: "Other ecosystems' package fields; no Cargo input." },
    "package.repository": {
        treatment: "Map",
        note: "`customConfig.packageIdentity.name` / `description` / `repository` / `homepage` / `keywords`."
    },
    "replay.enabled": { treatment: "Warn", note: "Fiddle replay; not a generator input." },
    schemaVersion: { treatment: "Map", note: "Must be `sdk-config-ir/v1`." },
    "source.apiImportSettings.asyncApiMessageNaming": {
        treatment: "Warn",
        note: "`message-naming` is rejected on an `openapi:` spec, and AsyncAPI specs are rejected anyway."
    },
    "source.apiImportSettings.coerceEnumsToLiterals": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.coerceOptionalSchemasToNullable": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.defaultIntegerFormat": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.disambiguateRequestNames": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.discriminatedUnionV2": {
        treatment: "Warn",
        note: "No `generators.yml` key: Fern derives both internal options from `prefer-undiscriminated-unions-with-literals`."
    },
    "source.apiImportSettings.groupMultiApiEnvironments": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.idiomaticRequestNames": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.ignoreTags": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.inlineAllOfSchemas": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.objectQueryParameters": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.onlyIncludeReferencedSchemas": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.pathParameterOrder": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.resolveSchemaCollisions": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.respectNullableSchemas": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.respectReadonlySchemas": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.titleAsSchemaName": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.typeDatesAsStrings": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.undiscriminatedUnionsWithLiterals": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.apiImportSettings.wrapReferencesToNullableInOptional": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.asyncApiMessageNaming": {
        treatment: "Warn",
        note: "`message-naming` is rejected on an `openapi:` spec, and AsyncAPI specs are rejected anyway."
    },
    "source.specs[].apiImportSettings.coerceEnumsToLiterals": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.coerceOptionalSchemasToNullable": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.defaultIntegerFormat": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.disambiguateRequestNames": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.discriminatedUnionV2": {
        treatment: "Warn",
        note: "No `generators.yml` key: Fern derives both internal options from `prefer-undiscriminated-unions-with-literals`."
    },
    "source.specs[].apiImportSettings.groupMultiApiEnvironments": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.idiomaticRequestNames": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.ignoreTags": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.inlineAllOfSchemas": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.objectQueryParameters": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.onlyIncludeReferencedSchemas": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.pathParameterOrder": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.resolveSchemaCollisions": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.respectNullableSchemas": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.respectReadonlySchemas": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.titleAsSchemaName": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.typeDatesAsStrings": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.undiscriminatedUnionsWithLiterals": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].apiImportSettings.wrapReferencesToNullableInOptional": {
        treatment: "Map",
        note: "kebab-case `settings` keys (for example `title-as-schema-name`; `undiscriminatedUnionsWithLiterals` is `prefer-undiscriminated-unions-with-literals`). Write every key under **each spec's** `settings` and also root `api.settings`: root alone silently drops 9 OpenAPI-only keys, while `path-parameter-order` works only at root. Spec values win. Settings act through the IR, so they change the typed SDK/types crates, not the CLI's own commands. `idiomaticRequestNames`, `respectNullableSchemas`, `wrapReferencesToNullableInOptional`, `resolveSchemaCollisions` change the IR but produced no output change in testing."
    },
    "source.specs[].id": { treatment: "Ignore", note: "Used only in diagnostics." },
    "source.specs[].name": { treatment: "Ignore", note: "Used only in diagnostics." },
    "source.specs[].namespace": { treatment: "Map", note: "Spec `namespace`." },
    "source.specs[].overlays": { treatment: "Map", note: "Spec `overlay`. Several overlays are merged into one file." },
    "source.specs[].overrides": { treatment: "Map", note: "Spec `overrides`." },
    "source.specs[].specType": {
        treatment: "Map",
        note: "`openapi` and `swagger` map under `openapi:`. `asyncapi` and `graphql` are rejected: FCG writes no output without an OpenAPI spec."
    },
    "source.specs[].specUrl": {
        treatment: "Ignore",
        note: "Never read. Specs are paired with manifest entries by position."
    },
    "target.apiName": { treatment: "Map", note: "`config.json` `workspaceName`." },
    "target.apiVersion": { treatment: "Warn", note: "No FCG input." },
    "target.generatorVersion": { treatment: "Map", note: "Must be 0.49.0; checked in preflight." },
    "target.language": { treatment: "Map", note: "Must be `cli`." },
    "target.organization": {
        treatment: "Ignore",
        note: "No FCG input. The binary name comes from `invocation.customConfig.binaryName`, else the spec title."
    },
    "target.organizationName": { treatment: "Map", note: "`config.json` and `fern.config.json` `organization`." },
    "target.sdkName": {
        treatment: "Ignore",
        note: "No FCG input. The binary name comes from `invocation.customConfig.binaryName`, else the spec title."
    },
    "target.sdkVersion": {
        treatment: "Ignore",
        note: "The hosted CLI version is always `0.0.0`: the listener forces `downloadFiles`, and FCG reads the version only in GitHub and publish modes."
    },
    "target.sourceOrigin": {
        treatment: "Ignore",
        note: "No FCG input. The binary name comes from `invocation.customConfig.binaryName`, else the spec title."
    }
};
