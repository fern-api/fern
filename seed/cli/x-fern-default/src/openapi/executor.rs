//! API Request Execution
//!
//! Handles building and dispatching HTTP requests to APIs.
//! Responsibilities include multipart file uploads, response pagination,
//! and error mapping.

use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

use anyhow::Context;
use futures_util::stream::TryStreamExt;
use futures_util::StreamExt;
use serde_json::{json, Map, Value};
use tokio::io::AsyncWriteExt;

use crate::auth::{handle_error_response, DynAuthProvider, EndpointAuthMetadata};
use crate::error::CliError;
use crate::openapi::discovery::{
    MethodParameter, PaginationConfig as EndpointPagination, RestDescription, RestMethod,
    RetriesConfig, StreamingConfig,
};

/// Resolved source for a binary request body (octet-stream uploads etc.).
///
/// Driven by the value passed on the CLI's binary-body flag (`--file`, `--body`,
/// or whatever name the spec dictates). Accepts three forms:
///
/// - `<PATH>` — plain filesystem path. Sent with `Content-Length`.
/// - `@<PATH>` — same path, curl-style prefix. Sent with `Content-Length`.
/// - `-` — read from stdin. Sent with `Transfer-Encoding: chunked` (no length).
pub enum BinaryBodySource<'a> {
    /// Stream from a file on disk. Content-Length comes from file metadata.
    File(&'a str),
    /// Read from stdin. Body is streamed with chunked transfer encoding.
    Stdin,
}

impl<'a> BinaryBodySource<'a> {
    /// Parse a raw flag value into one of the three accepted forms. Stripping
    /// the optional `@` prefix happens here so the rest of the pipeline only
    /// sees a clean path or `Stdin`.
    pub fn parse(raw: &'a str) -> Self {
        let stripped = raw.strip_prefix('@').unwrap_or(raw);
        if stripped == "-" {
            Self::Stdin
        } else {
            Self::File(stripped)
        }
    }
}

/// Source for media upload content.
///
/// Two mutually exclusive strategies: upload from a file on disk (for Drive,
/// Chat, etc.) or from in-memory bytes (for Gmail's constructed RFC 5322
/// messages). Using an enum makes illegal states (both set, or mismatched
/// content types) unrepresentable.
pub enum UploadSource<'a> {
    /// Stream from a file on disk. Content type is inferred from the file
    /// extension, overridden by metadata mimeType, or explicitly set.
    File {
        path: &'a str,
        content_type: Option<&'a str>,
    },
    /// Upload from in-memory bytes with an explicit content type.
    Bytes {
        data: &'a [u8],
        content_type: &'a str,
    },
}

/// Configuration for auto-pagination.
#[derive(Debug, Clone)]
pub struct PaginationConfig {
    /// Whether to auto-paginate through all pages.
    pub page_all: bool,
    /// Maximum number of pages to fetch (default: 10).
    pub page_limit: u32,
    /// Delay between page fetches in milliseconds (default: 100).
    pub page_delay_ms: u64,
    /// Query parameter name for the page token (default: "pageToken").
    pub token_query_param: String,
    /// Dotted path in JSON response to find the next page token (default: "nextPageToken").
    /// Supports nested paths like "pagination.next_page_token".
    pub token_response_path: String,
}

impl Default for PaginationConfig {
    fn default() -> Self {
        Self {
            page_all: false,
            page_limit: 10,
            page_delay_ms: 100,
            token_query_param: "pageToken".to_string(),
            token_response_path: "nextPageToken".to_string(),
        }
    }
}

/// Outcome of a single retry-loop iteration.
///
/// Captures everything the retry policy needs to make its next decision:
/// the HTTP status (or `None` for transport-layer failures), the
/// `Retry-After` header value if any, and the wall-clock timestamp the
/// header should be interpreted against. Keeping the timestamp on the
/// outcome lets unit tests pin `SystemTime::now` to a known instant
/// without monkey-patching the global clock.
#[derive(Debug)]
pub(crate) struct RetryOutcome<'a> {
    pub status: Option<u16>,
    pub retry_after: Option<&'a str>,
}

/// Returns the default set of retryable HTTP status codes.
///
/// Matches fern's TypeScript SDK `retryStatusCodes: recommended` mode
/// ([fern PR](https://github.com/fern-api/fern/blob/main/generators/typescript/sdk/changes/3.67.0/feat-retry-status-codes.yml)):
///
///   - 408 Request Timeout      — server gave up before reading; safe.
///   - 429 Too Many Requests    — backoff signal; safe.
///   - 502 Bad Gateway          — upstream layer failed; transient.
///   - 503 Service Unavailable  — explicitly transient by spec.
///   - 504 Gateway Timeout      — upstream timeout; transient.
///
/// Deliberately *excludes* 500 Internal Server Error — a 500 often
/// indicates a non-transient bug on the server (bad input shape, app
/// crash) where retrying just masks the underlying issue. Servers that
/// genuinely want us to retry a 500 can still surface a `Retry-After`
/// header and the executor will honor it.
///
/// Also excludes 425 Too Early (TLS 1.3 0-RTT replay protection) —
/// never seen in practice from reqwest's HTTP/1.1 client.
pub(crate) fn is_retryable_status(status: u16) -> bool {
    matches!(status, 408 | 429 | 502 | 503 | 504)
}

/// Whether the per-method retry policy allows retrying *non-idempotent*
/// HTTP responses (e.g. a 503 on a POST). GET / HEAD / OPTIONS / DELETE
/// / PUT are idempotent by the HTTP spec; `x-fern-idempotent` on the
/// operation marks an otherwise-unsafe method (POST / PATCH) as
/// safe-to-retry, which mirrors fern's per-method retry policy.
pub(crate) fn method_allows_retry(http_method: &str, marked_idempotent: bool) -> bool {
    if marked_idempotent {
        return true;
    }
    matches!(
        http_method.to_ascii_uppercase().as_str(),
        "GET" | "HEAD" | "OPTIONS" | "DELETE" | "PUT"
    )
}

/// Whether the given `binary_body_path` raw string designates stdin
/// (`-` or `@-`). Stdin-sourced bodies cannot be replayed on retry —
/// the pipe is consumed by the first send — so callers must disable
/// retries when this returns `true`. Mirrors `BinaryBodySource::parse`
/// without the lifetime gymnastics needed at the call site.
pub(crate) fn binary_body_is_stdin(binary_body_path: Option<&str>) -> bool {
    match binary_body_path {
        Some(raw) => matches!(BinaryBodySource::parse(raw), BinaryBodySource::Stdin),
        None => false,
    }
}

/// Parse a `Retry-After` header value into a `Duration`.
///
/// HTTP/1.1 allows two forms (RFC 7231 §7.1.3): a non-negative integer
/// number of seconds, or an HTTP-date. We accept either. Past dates
/// (the server's clock is ahead, or `Retry-After: 0`) collapse to
/// zero so callers don't underflow.
pub(crate) fn parse_retry_after(value: &str, now: std::time::SystemTime) -> Option<std::time::Duration> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return None;
    }
    // Numeric seconds first — cheaper and far more common in practice.
    if let Ok(secs) = trimmed.parse::<u64>() {
        return Some(std::time::Duration::from_secs(secs));
    }
    // HTTP-date (IMF-fixdate / RFC 850 / asctime). `httpdate::parse_http_date`
    // accepts all three formats per RFC 7231.
    if let Ok(target) = httpdate::parse_http_date(trimmed) {
        return Some(target.duration_since(now).unwrap_or(std::time::Duration::ZERO));
    }
    None
}

/// Compute the delay for the *next* retry attempt (i.e. the wait
/// between attempt `attempt` and attempt `attempt + 1`).
///
/// Math: `base * factor^attempt`, with deterministic jitter in
/// `[1 - jitter/2, 1 + jitter/2]` applied to the result. The jitter
/// factor is sampled from a fast LCG so test runs are deterministic
/// when seeded — see [`compute_backoff_delay_with_rand`] below.
pub(crate) fn compute_backoff_delay(
    attempt: u32,
    config: &RetriesConfig,
) -> std::time::Duration {
    // Use system entropy for the random sample. Unit tests use
    // `compute_backoff_delay_with_rand` to pin the sample.
    let jitter_sample = if config.jitter > 0.0 {
        // Sub-second component of wall-clock time as cheap entropy.
        // We don't care about cryptographic quality here — just enough
        // variance to de-correlate retries from competing clients
        // (i.e. avoid the thundering-herd problem during an outage).
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .subsec_nanos() as u64;
        ((nanos.wrapping_mul(2654435761)) & 0xFFFF) as f64 / 65535.0
    } else {
        0.5
    };
    compute_backoff_delay_with_rand(attempt, config, jitter_sample)
}

/// Test-friendly variant of [`compute_backoff_delay`]. `rand_unit` is
/// any value in `[0.0, 1.0]`; pass `0.5` for the "exact" backoff
/// (no jitter offset).
pub(crate) fn compute_backoff_delay_with_rand(
    attempt: u32,
    config: &RetriesConfig,
    rand_unit: f64,
) -> std::time::Duration {
    if !config.enabled {
        return std::time::Duration::ZERO;
    }
    let exponent = attempt as i32;
    let raw_ms = (config.base_delay_ms as f64) * config.factor.powi(exponent);

    // Jitter spreads the delay symmetrically around `raw_ms` to
    // de-correlate clients all retrying off the same server outage.
    let jitter_span = raw_ms * config.jitter;
    let offset = (rand_unit.clamp(0.0, 1.0) - 0.5) * jitter_span;
    let ms = (raw_ms + offset).max(0.0);

    // Cap at u64 to avoid panics on absurd configs (e.g. factor=1e9).
    let capped = if ms > u64::MAX as f64 {
        u64::MAX
    } else {
        ms as u64
    };
    std::time::Duration::from_millis(capped)
}

/// Decide whether to retry after an HTTP outcome.
///
/// Returns `Some(delay)` to schedule a retry, or `None` to surface the
/// outcome to the caller. Encapsulates the precedence rules in one
/// place so the wire executor stays a thin loop body.
pub(crate) fn decide_retry(
    attempt: u32,
    outcome: &RetryOutcome<'_>,
    config: &RetriesConfig,
    http_method: &str,
    marked_idempotent: bool,
    no_retry: bool,
) -> Option<std::time::Duration> {
    // Hard opt-outs first.
    if no_retry || !config.enabled || config.max_attempts == 0 {
        return None;
    }
    // attempt is 0-indexed (the request just completed was attempt
    // `attempt`); we retry while we still have room before
    // `max_attempts` total sends.
    if attempt + 1 >= config.max_attempts {
        return None;
    }

    match outcome.status {
        // Network / transport failure (no response at all).
        None => {
            // Network errors are always treated as transient. GET-like
            // methods retry per default; POST/PATCH only when the
            // operation is explicitly marked idempotent.
            if !method_allows_retry(http_method, marked_idempotent) {
                return None;
            }
            Some(compute_backoff_delay(attempt, config))
        }
        Some(status) => {
            if !is_retryable_status(status) {
                return None;
            }
            // 408/429 are safe to retry on any method (the request
            // didn't reach business logic). 5xx on non-idempotent
            // methods *could* have been processed — respect per-method
            // policy unless the op is marked idempotent.
            let always_safe = matches!(status, 408 | 429);
            if !always_safe && !method_allows_retry(http_method, marked_idempotent) {
                return None;
            }
            // Honor `Retry-After` when present, fall back to backoff.
            if let Some(raw) = outcome.retry_after {
                if let Some(d) = parse_retry_after(raw, std::time::SystemTime::now()) {
                    return Some(d);
                }
            }
            Some(compute_backoff_delay(attempt, config))
        }
    }
}

/// Parsed and validated inputs ready for request execution.
#[derive(Debug)]
struct ExecutionInput {
    body: Option<Value>,
    full_url: String,
    query_params: Vec<(String, String)>,
    header_params: Vec<(String, String)>,
    is_upload: bool,
}

/// Parse parameters and body JSON, validate against schema, check required params, and build the URL.
fn parse_and_validate_inputs(
    doc: &RestDescription,
    method: &RestMethod,
    params_json: Option<&str>,
    body_json: Option<&str>,
    is_media_upload: bool,
    base_url_override: Option<&str>,
    extra_headers: &[(String, String)],
) -> Result<ExecutionInput, CliError> {
    let params: Map<String, Value> = if let Some(p) = params_json {
        serde_json::from_str(p)
            .map_err(|e| CliError::Validation(format!("Invalid --params JSON: {e}")))?
    } else {
        Map::new()
    };

    // Helper: build the `Provide it via …` hint listing every channel a
    // user can satisfy this parameter through. Mirrors `commands.rs`'s
    // flag-name resolution so the suggested `--<flag>` is the actual flag
    // the user can pass: `flag_name_override` wins verbatim (synthetic
    // injections that already encode the wire name); otherwise kebab the
    // `display_name` from `x-fern-parameter-name`, falling back to the
    // wire name. Body fields also accept `--json`; every other location
    // only accepts the per-field flag or `--params`.
    let missing_param_hint = |param_def: &MethodParameter, param_name: &str| -> String {
        let flag = if let Some(override_flag) = param_def.flag_name_override.as_deref() {
            override_flag.to_string()
        } else {
            crate::text::to_kebab_flag(
                param_def.display_name.as_deref().unwrap_or(param_name),
            )
        };
        if param_def.location.as_deref() == Some("body") {
            format!("Provide it via --{flag}, --json, or --params")
        } else {
            format!("Provide it via --{flag} or --params")
        }
    };

    for param_name in &method.parameter_order {
        if let Some(param_def) = method.parameters.get(param_name) {
            if param_def.required
                && param_def.location.as_deref() == Some("path")
                && !params.contains_key(param_name)
            {
                let hint = missing_param_hint(param_def, param_name);
                return Err(CliError::Validation(format!(
                    "Required path parameter '{param_name}' is missing. {hint}"
                )));
            }
        }
    }

    for (param_name, param_def) in &method.parameters {
        if param_def.required && !params.contains_key(param_name) {
            let hint = missing_param_hint(param_def, param_name);
            return Err(CliError::Validation(format!(
                "Required parameter '{param_name}' is missing. {hint}"
            )));
        }
    }

    // Split params by `location` into header / body / non-header buckets.
    // Body-located params are coerced by type and merged into the JSON body
    // (with --json overriding any individual flag values).
    let mut header_params: Vec<(String, String)> = Vec::new();
    let mut body_from_flags = Map::new();
    let mut non_header_params = Map::new();

    for (key, value) in &params {
        let location = method.parameters.get(key).and_then(|p| p.location.as_deref());
        match location {
            Some("header") => {
                let str_value = match value {
                    Value::String(s) => s.clone(),
                    other => other.to_string(),
                };
                header_params.push((key.clone(), str_value));
            }
            Some("body") => {
                let coerced = coerce_body_param_value(
                    value,
                    method.parameters.get(key).and_then(|p| p.param_type.as_deref()),
                )?;
                set_nested_value(&mut body_from_flags, key, coerced);
            }
            _ => {
                non_header_params.insert(key.clone(), value.clone());
            }
        }
    }

    // Append spec-root `x-fern-global-headers` last so per-operation
    // headers (already populated above from `params`) override globals
    // with the same wire-name. Resolution of CLI flag / env / default
    // happens upstream in `run_async`; the executor's job here is just
    // to stamp the resolved value on the request when no per-op
    // parameter already supplied it.
    for (name, value) in extra_headers {
        if !header_params.iter().any(|(k, _)| k == name) {
            header_params.push((name.clone(), value.clone()));
        }
    }

    let body: Option<Value> = match (body_json, body_from_flags.is_empty()) {
        (None, true) => None,
        (None, false) => Some(Value::Object(body_from_flags)),
        (Some(b), flags_empty) => {
            let json_val: Value = serde_json::from_str(b)
                .map_err(|e| CliError::Validation(format!("Invalid --json body: {e}")))?;
            // Object `--json` merges per-field flag values, with `--json`
            // winning on overlapping keys (documented "--json > flag"
            // precedence). Non-object `--json` (top-level array or scalar)
            // replaces the body wholesale — there is no sensible way to
            // merge per-field fields into it. The full precedence chain is
            // `--json` > `--params` > per-field flag.
            let merged = match json_val {
                Value::Object(json_map) if !flags_empty => {
                    let mut merged = body_from_flags;
                    for (k, v) in json_map {
                        merged.insert(k, v);
                    }
                    Value::Object(merged)
                }
                other => other,
            };
            Some(merged)
        }
    };

    // Validate the assembled body against the request schema regardless of
    // how it was built (per-field flags, `--json`, or both). The previous
    // version only validated on the `--json` path, which let per-field-flag
    // bodies skip schema checks even though those values arrive as
    // CLI-typed strings and are more likely to violate the schema.
    if let Some(ref body_val) = body {
        if let Some(ref req_ref) = method.request {
            if let Some(ref schema_name) = req_ref.schema_ref {
                validate_body_against_schema(body_val, schema_name, doc)?;
            }
        }
    }

    let (full_url, query_params) = build_url(doc, method, &non_header_params, is_media_upload, base_url_override)?;
    let is_upload = is_media_upload && method.supports_media_upload;

    Ok(ExecutionInput {
        body,
        full_url,
        query_params,
        header_params,
        is_upload,
    })
}

/// Build the per-operation auth metadata from the lowered security
/// requirements. Computed once per execute_method call and reused across
/// pagination iterations — the requirements don't change page to page.
fn endpoint_metadata_for(method: &RestMethod) -> EndpointAuthMetadata {
    EndpointAuthMetadata {
        security_requirements: method.security_requirements.clone(),
    }
}

/// Pagination loop state tracked across page fetches.
///
/// Each variant matches one of the five `x-fern-pagination` forms, plus
/// the document-level heuristic (which uses [`PageState::Cursor`]):
///
/// - [`PageState::Cursor`] — token threaded through a request query param
/// - [`PageState::Offset`] — running offset counter sent as a query param
/// - [`PageState::NextUrl`] — server-returned absolute URL (uri form) or
///   resolved relative path (path form) used verbatim for the next page
/// - [`PageState::Custom`] — single-shot; the executor never continues
///
/// Encoded as a discriminated union rather than several `Option`s so that
/// callers can't accidentally mix semantics from different forms.
#[derive(Debug)]
enum PageState {
    Cursor(Option<String>),
    Offset(u64),
    /// `None` on the first page, `Some(url)` once the previous response
    /// supplied a next URL/path. The string is always a fully-qualified
    /// URL — relative `next_path` values are resolved against the
    /// previous request's URL before being stored here.
    NextUrl(Option<String>),
    Custom,
}

impl PageState {
    /// Pick the initial state from the resolved per-operation pagination
    /// config. Operations without explicit `x-fern-pagination` (or with
    /// cursor-style config) start with no token; offset-style starts at
    /// 0; uri/path/custom forms start in their respective first-page
    /// states.
    fn initial(endpoint: Option<&EndpointPagination>) -> Self {
        match endpoint {
            Some(EndpointPagination::Offset { .. }) => PageState::Offset(0),
            Some(EndpointPagination::Uri { .. } | EndpointPagination::Path { .. }) => {
                PageState::NextUrl(None)
            }
            Some(EndpointPagination::Custom { .. }) => PageState::Custom,
            // Cursor + heuristic + None all use the cursor-style state.
            _ => PageState::Cursor(None),
        }
    }

    /// Override the outgoing URL when the pagination form does so (uri /
    /// path). `None` means leave the request's URL untouched.
    fn url_override(&self) -> Option<&str> {
        match self {
            PageState::NextUrl(Some(url)) => Some(url.as_str()),
            _ => None,
        }
    }

    /// Convert the state into the (query-param name, value) pair to inject
    /// on the next outgoing request, or `None` when the state represents
    /// "first page, no extra param yet" or "URL is fully self-contained".
    fn injection(
        &self,
        endpoint: Option<&EndpointPagination>,
        heuristic_param: &str,
    ) -> Option<(String, String)> {
        match self {
            PageState::Cursor(None) => None,
            PageState::Cursor(Some(token)) => {
                let name = match endpoint {
                    Some(EndpointPagination::Cursor { cursor, .. }) => cursor.clone(),
                    _ => heuristic_param.to_string(),
                };
                Some((name, token.clone()))
            }
            PageState::Offset(0) => None,
            PageState::Offset(n) => {
                let name = match endpoint {
                    Some(EndpointPagination::Offset { offset, .. }) => offset.clone(),
                    _ => heuristic_param.to_string(),
                };
                Some((name, n.to_string()))
            }
            // Uri / Path embed the cursor in the URL itself.
            PageState::NextUrl(_) | PageState::Custom => None,
        }
    }
}

/// Build an HTTP request with auth, query params, page token, and body/multipart attachment.
#[allow(clippy::too_many_arguments)]
async fn build_http_request(
    client: &reqwest::Client,
    method: &RestMethod,
    input: &ExecutionInput,
    auth_provider: &DynAuthProvider,
    auth_metadata: &EndpointAuthMetadata,
    page_state: &PageState,
    pages_fetched: u32,
    upload: &Option<UploadSource<'_>>,
    binary_body_path: Option<&str>,
    pagination: &PaginationConfig,
) -> Result<reqwest::RequestBuilder, CliError> {
    // Uri / Path pagination supplies a fully-resolved next URL in the
    // page state; use it verbatim so that the server's cursor / query
    // params travel as-is.
    let target_url = page_state.url_override().unwrap_or(&input.full_url);

    let mut request = match method.http_method.as_str() {
        "GET" => client.get(target_url),
        "POST" => client.post(target_url),
        "PUT" => client.put(target_url),
        "PATCH" => client.patch(target_url),
        "DELETE" => client.delete(target_url),
        other => {
            return Err(CliError::Other(anyhow::anyhow!(
                "Unsupported HTTP method: {other}"
            )))
        }
    };

    // `security: []` in the spec means the operation opts out of auth.
    // Short-circuit before involving the provider so leaf providers
    // (Bearer/Basic/Header) and composition wrappers that don't inspect
    // the endpoint (AnyAuthProvider, AllAuthProvider, user-built custom
    // providers) can't leak credentials onto an explicitly anonymous
    // endpoint. RoutingAuthProvider already honors this internally; the
    // executor-side check makes it universal.
    if !auth_metadata.is_explicit_anonymous() {
        request = auth_provider.apply(request, auth_metadata)?;
    }

    // Prefer JSON when the API supports content negotiation (some providers
    // return XML otherwise). Only inject when the operation doesn't already
    // set an Accept header.
    if !input
        .header_params
        .iter()
        .any(|(k, _)| k.eq_ignore_ascii_case("accept"))
    {
        request = request.header("Accept", "application/json");
    }

    // Send header parameters as HTTP headers
    for (name, value) in &input.header_params {
        if let Ok(header_value) = reqwest::header::HeaderValue::from_str(value) {
            request = request.header(name.as_str(), header_value);
        }
    }

    // When the URL is supplied by the server (uri / path pagination)
    // the URL already carries every query param the server cares about
    // — re-appending the user's initial filters would either double them
    // up or fight the server's own cursor. Honor the server's URL as-is.
    if page_state.url_override().is_none() {
        let mut all_query_params = input.query_params.clone();
        if let Some((name, value)) =
            page_state.injection(method.pagination.as_ref(), &pagination.token_query_param)
        {
            all_query_params.push((name, value));
        }
        if !all_query_params.is_empty() {
            request = request.query(&all_query_params);
        }
    }

    if pages_fetched == 0 {
        if let Some(upload_source) = upload {
            request = request.query(&[("uploadType", "multipart")]);
            let (body, content_type, content_length) = match upload_source {
                UploadSource::Bytes { data, content_type } => {
                    if content_type.contains('\r') || content_type.contains('\n') {
                        return Err(CliError::Validation(
                            "Upload content type must not contain CR or LF".to_string(),
                        ));
                    }
                    build_multipart_bytes(&input.body, data, content_type)?
                }
                UploadSource::File { path, content_type } => {
                    let file_meta = tokio::fs::metadata(path).await.map_err(|e| {
                        CliError::Validation(format!(
                            "Failed to get metadata for upload file '{path}': {e}"
                        ))
                    })?;
                    let file_size = file_meta.len();
                    let media_mime = resolve_upload_mime(*content_type, Some(path), &input.body);
                    build_multipart_stream(&input.body, path, file_size, &media_mime)?
                }
            };
            request = request.header("Content-Type", content_type);
            request = request.header("Content-Length", content_length);
            request = request.body(body);
        } else if let Some(raw) = binary_body_path {
            let binary = method.binary_request_body.as_ref().ok_or_else(|| {
                CliError::Validation(
                    "binary body path was provided but the operation has no binary request body declared"
                        .to_string(),
                )
            })?;
            request = request.header("Content-Type", &binary.content_type);
            match BinaryBodySource::parse(raw) {
                BinaryBodySource::File(path) => {
                    let file_meta = tokio::fs::metadata(path).await.map_err(|e| {
                        CliError::Validation(format!(
                            "Failed to read --{} '{path}': {e}",
                            binary.flag_name
                        ))
                    })?;
                    let (body, content_length) =
                        build_binary_file_stream(path, file_meta.len(), &binary.flag_name);
                    request = request.header("Content-Length", content_length);
                    request = request.body(body);
                }
                BinaryBodySource::Stdin => {
                    // No Content-Length — reqwest emits Transfer-Encoding: chunked.
                    // Memory stays at O(64 KB) regardless of input size.
                    request = request.body(build_stdin_body_stream());
                }
            }
        } else if let Some(ref body_val) = input.body {
            request = request.header("Content-Type", "application/json");
            request = request.json(body_val);
        } else if matches!(method.http_method.as_str(), "POST" | "PUT" | "PATCH") {
            request = request.header("Content-Length", "0");
        }
    } else if let Some(ref body_val) = input.body {
        request = request.header("Content-Type", "application/json");
        request = request.json(body_val);
    }

    Ok(request)
}

/// Walk a dotted path like "pagination.next_page_token" through nested JSON objects.
fn get_nested_str<'a>(val: &'a Value, dotted_path: &str) -> Option<&'a str> {
    let mut current = val;
    for segment in dotted_path.split('.') {
        current = current.get(segment)?;
    }
    current.as_str()
}

/// Resolve a dot-separated path (`data`, `result.items`, `users.0.name`)
/// against a JSON value, returning a reference to the addressed subvalue.
///
/// Empty / pure-dot paths are treated as "no path" and return `None` so the
/// caller can decide between "use the whole value" and "this is an error".
/// A non-empty path that doesn't resolve also returns `None` — callers
/// that need to surface a user-facing error (like
/// `x-fern-sdk-return-value` extraction) check for that case and emit a
/// `CliError::Validation` explaining which path missed.
///
/// Segments are matched against object keys (`Value::get(&str)`); a
/// segment that parses as a non-negative integer additionally indexes
/// into arrays at the corresponding position (`Value::get(usize)`).
/// Object-key lookup wins when the same segment is ambiguous — JSON
/// object keys can be the literal string `"0"`, and surfacing the
/// matching key is what a user reading the spec expects. Falling back
/// to array indexing only when the value is actually an array keeps
/// the dot-path grammar a strict superset of upstream's
/// `RESPONSE_PROPERTY` (object-only) behavior.
fn get_nested_value<'a>(val: &'a Value, dotted_path: &str) -> Option<&'a Value> {
    let trimmed = dotted_path.trim();
    if trimmed.is_empty() {
        return None;
    }
    let mut current = val;
    for segment in trimmed.split('.') {
        if segment.is_empty() {
            return None;
        }
        // Object-key lookup first, then numeric-array-index fallback so
        // an object with a literal `"0"` key still resolves there. The
        // array path only triggers when the current value is actually
        // a JSON array — otherwise the segment was meant as an object
        // key and was simply missing, which the `?` propagates.
        if let Some(next) = current.get(segment) {
            current = next;
            continue;
        }
        if current.is_array() {
            if let Ok(idx) = segment.parse::<usize>() {
                current = current.get(idx)?;
                continue;
            }
        }
        return None;
    }
    Some(current)
}

/// Apply `x-fern-sdk-return-value` extraction to a single response value.
///
/// `return_path` is the dot-separated key path declared by the spec (e.g.
/// `data`, `result.items`). When the path resolves, the addressed subvalue
/// is returned for downstream printing / capture. A non-empty path that
/// resolves to JSON `null` is preserved as `Value::Null` (the field was
/// in the response, just null — typed SDKs surface this identically).
/// A path that fails to resolve *at all* (missing key, intermediate
/// non-object, out-of-range index) is a hard error — the spec promised
/// that subvalue and the server didn't deliver it. `no_extract = true`
/// bypasses the extraction entirely so callers (typically via
/// `--no-extract`) can see the full response for debugging.
///
/// TODO(error-variant): `CliError::Validation` is the closest existing
/// variant but conceptually this is *response-contract* validation, not
/// input validation. Worth introducing a `CliError::ResponseContract`
/// variant once another response-side validation error needs the same
/// classification.
fn extract_return_value(
    body: &Value,
    return_path: Option<&str>,
    no_extract: bool,
    method_descriptor: &str,
) -> Result<Value, CliError> {
    match return_path {
        Some(path) if !no_extract && !path.trim().is_empty() => {
            match get_nested_value(body, path) {
                Some(v) => Ok(v.clone()),
                None => Err(CliError::Validation(format!(
                    "x-fern-sdk-return-value path '{path}' did not resolve in response for \
                     operation {method_descriptor}. Pass --no-extract to see the full response."
                ))),
            }
        }
        _ => Ok(body.clone()),
    }
}

/// Resolve the offset-pagination `step` value used for the
/// "did we get a full page?" check that gates pagination on short pages.
///
/// `step_field` is the post-prefix-stripped field name from the spec (e.g.
/// `step: $request.limit` becomes `"limit"`). Resolution order:
///
/// 1. Look up the field name in the request's outgoing query params and
///    parse the value as an integer — the canonical `$request.<name>`
///    interpretation, matching fern-api/fern's SDK generators.
/// 2. If the field is itself a parseable integer literal (e.g. `step: "50"`),
///    use that.
/// 3. Otherwise return `None` — the caller falls back to the legacy
///    `items.len() > 0` check.
///
/// Mirrors upstream `fern-api/fern`'s SDK generators: the step value is
/// used **only** for the `hasNextPage` full-page comparison
/// (`items.length >= step`) — never as the increment amount. The increment
/// is always `len(items)` in item-index semantics, which is what the
/// executor's offset loop already does. See:
/// - `generators/python/.../client_generator/pagination/offset.py`
/// - `generators/typescript/.../GeneratedThrowingEndpointResponse.ts`
fn resolve_step_target(
    step_field: Option<&str>,
    request_query_params: &[(String, String)],
) -> Option<u64> {
    let name = step_field?;
    if let Some((_, value)) = request_query_params.iter().find(|(k, _)| k == name) {
        if let Ok(parsed) = value.parse::<u64>() {
            return Some(parsed);
        }
    }
    name.parse::<u64>().ok()
}

/// Resolve a `next_path` value from `x-fern-pagination` against the URL of
/// the request that produced it. Mirrors browser-style URL resolution:
/// absolute URLs (`https://…`) replace the base; absolute paths (`/foo`)
/// keep the scheme + host; relative paths inherit the base's directory.
fn resolve_next_path(base_url: &str, next_path: &str) -> Result<String, String> {
    let base = reqwest::Url::parse(base_url)
        .map_err(|e| format!("base URL `{base_url}` is not a valid URL: {e}"))?;
    let resolved = base
        .join(next_path)
        .map_err(|e| format!("could not join next_path `{next_path}` to `{base_url}`: {e}"))?;
    Ok(resolved.to_string())
}

/// Handle a JSON response: parse, output, and check pagination.
/// Returns `Ok(true)` if the pagination loop should continue.
///
/// `return_path` is the operation's resolved `x-fern-sdk-return-value`
/// extension (a dot-separated key path into the JSON body). When set and
/// `no_extract` is false, only the addressed subvalue is printed /
/// captured — but the full response is still used for pagination
/// continuation checks, since pagination paths (`next_cursor`,
/// `results`, …) are declared relative to the whole body and would
/// silently break if extracted away.
#[allow(clippy::too_many_arguments)]
async fn handle_json_response(
    body_text: &str,
    pagination: &PaginationConfig,
    endpoint_pag: Option<&EndpointPagination>,
    pipeline: &crate::formatter::OutputPipeline,
    pages_fetched: &mut u32,
    page_state: &mut PageState,
    capture_output: bool,
    captured: &mut Vec<Value>,
    request_url: &str,
    request_query_params: &[(String, String)],
    return_path: Option<&str>,
    no_extract: bool,
    method_descriptor: &str,
) -> Result<bool, CliError> {
    if let Ok(json_val) = serde_json::from_str::<Value>(body_text) {
        let output_val =
            extract_return_value(&json_val, return_path, no_extract, method_descriptor)?;

        *pages_fetched += 1;

        // The three branches below are mutually exclusive (one consumes
        // `output_val`), so the unconditional move into `captured.push`
        // is safe. If a future change adds a side-effect that also
        // needs `output_val` outside this if/else chain, the compiler
        // will flag it — clone there rather than reintroducing a
        // speculative `.clone()` here.
        if capture_output {
            captured.push(output_val);
        } else if pagination.page_all {
            let is_first_page = *pages_fetched == 1;
            let mut out = std::io::stdout().lock();
            pipeline
                .emit(&mut out, &output_val, true, is_first_page)
                .context("Failed to write output")?;
        } else {
            let mut out = std::io::stdout().lock();
            pipeline
                .emit(&mut out, &output_val, false, true)
                .context("Failed to write output")?;
        }

        // Check whether to fetch a next page. Per-op `x-fern-pagination`
        // overrides the document heuristic when present.
        if pagination.page_all && *pages_fetched < pagination.page_limit {
            let should_continue = match endpoint_pag {
                Some(EndpointPagination::Cursor { next_cursor, .. }) => {
                    match get_nested_str(&json_val, next_cursor) {
                        Some(token) if !token.is_empty() => {
                            *page_state = PageState::Cursor(Some(token.to_string()));
                            true
                        }
                        _ => false,
                    }
                }
                Some(EndpointPagination::Offset {
                    results,
                    has_next_page,
                    step,
                    ..
                }) => {
                    let still_more = match has_next_page {
                        Some(path) => json_val
                            .pointer(&format!("/{}", path.replace('.', "/")))
                            .and_then(Value::as_bool)
                            .unwrap_or(true),
                        None => true,
                    };
                    let page_size = json_val
                        .pointer(&format!("/{}", results.replace('.', "/")))
                        .and_then(Value::as_array)
                        .map(|a| a.len() as u64)
                        .unwrap_or(0);
                    // When `step` is wired, gate the next page on whether
                    // the server returned a *full* page. Matches upstream
                    // fern-api/fern's `items.length >= step` check — a
                    // server returning a short page signals end-of-data
                    // even if `has_next_page` was omitted, preventing the
                    // executor from over-advancing past the last record.
                    let got_full_page =
                        match resolve_step_target(step.as_deref(), request_query_params) {
                            Some(target) => page_size >= target,
                            None => page_size > 0,
                        };
                    if still_more && got_full_page {
                        let current = match page_state {
                            PageState::Offset(n) => *n,
                            _ => 0,
                        };
                        // Advance by the number of items actually returned
                        // — item-index semantics, matching upstream's
                        // default `offsetSemantics`. The `step` field
                        // controls only the full-page gate above, not the
                        // increment amount.
                        *page_state = PageState::Offset(current + page_size);
                        true
                    } else {
                        false
                    }
                }
                Some(EndpointPagination::Uri { next_uri, .. }) => {
                    match get_nested_str(&json_val, next_uri) {
                        Some(url) if !url.is_empty() => {
                            *page_state = PageState::NextUrl(Some(url.to_string()));
                            true
                        }
                        _ => false,
                    }
                }
                Some(EndpointPagination::Path { next_path, .. }) => {
                    match get_nested_str(&json_val, next_path) {
                        Some(path) if !path.is_empty() => {
                            // Resolve relative paths (e.g. `/v1/things?cursor=…`)
                            // against the previous request's URL so the host
                            // + scheme are preserved across pages.
                            let base = page_state
                                .url_override()
                                .unwrap_or(request_url)
                                .to_string();
                            match resolve_next_path(&base, path) {
                                Ok(resolved) => {
                                    *page_state = PageState::NextUrl(Some(resolved));
                                    true
                                }
                                Err(e) => {
                                    tracing::warn!(
                                        next_path = %path,
                                        base_url = %base,
                                        error = %e,
                                        "failed to resolve x-fern-pagination next_path; halting pagination"
                                    );
                                    false
                                }
                            }
                        }
                        _ => false,
                    }
                }
                // Custom: caller-driven. The executor never auto-continues;
                // it issues exactly one request, surfaces the `results`
                // selection like the others, and stops.
                Some(EndpointPagination::Custom { .. }) => false,
                None => match get_nested_str(&json_val, &pagination.token_response_path) {
                    Some(token) if !token.is_empty() => {
                        *page_state = PageState::Cursor(Some(token.to_string()));
                        true
                    }
                    _ => false,
                },
            };

            if should_continue {
                if pagination.page_delay_ms > 0 {
                    tokio::time::sleep(std::time::Duration::from_millis(
                        pagination.page_delay_ms,
                    ))
                    .await;
                }
                return Ok(true);
            }
        }
    } else {
        // Not valid JSON, output as-is
        if !capture_output && !body_text.is_empty() {
            println!("{body_text}");
        }
    }

    Ok(false)
}

/// Handle a binary response by streaming it to a file.
async fn handle_binary_response(
    response: reqwest::Response,
    content_type: &str,
    output_path: Option<&str>,
    pipeline: &crate::formatter::OutputPipeline,
    capture_output: bool,
) -> Result<Option<Value>, CliError> {
    let file_path = if let Some(p) = output_path {
        PathBuf::from(p)
    } else {
        let ext = mime_to_extension(content_type);
        PathBuf::from(format!("download.{ext}"))
    };

    let mut file = tokio::fs::File::create(&file_path)
        .await
        .context("Failed to create output file")?;

    let mut stream = response.bytes_stream();
    let mut total_bytes: u64 = 0;

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.context("Failed to read response chunk")?;
        file.write_all(&chunk)
            .await
            .context("Failed to write to file")?;
        total_bytes += chunk.len() as u64;
    }

    file.flush().await.context("Failed to flush file")?;

    let result = json!({
        "status": "success",
        "saved_file": file_path.display().to_string(),
        "mimeType": content_type,
        "bytes": total_bytes,
    });

    if capture_output {
        return Ok(Some(result));
    }

    let mut out = std::io::stdout().lock();
    pipeline
        .emit(&mut out, &result, false, true)
        .context("Failed to write output")?;

    Ok(None)
}

// ---------------------------------------------------------------------------
// x-fern-streaming response handling.
//
// Two entry points:
// - `stream_response` — consume the response body line-by-line and emit
//   each event to stdout as it arrives. Used by the default CLI path
//   (no `--no-stream`, not `capture_output`).
// - `buffer_streaming_response` — collect every event into one JSON value
//   (single object when only one event arrived, array otherwise) and
//   return it for downstream printing / capture. Used when the caller
//   passed `--no-stream` (pretty-print to stdout) or is a programmatic
//   `AppContext::invoke` caller that needs a typed value back.
//
// Line decoding is delegated to `decode_stream_event`, which is a pure
// function over (config, raw_line) — exercised directly by unit tests
// without spinning up a wiremock server.
// ---------------------------------------------------------------------------

/// Outcome of decoding a single raw stream line.
#[derive(Debug, PartialEq, Eq)]
enum StreamEvent {
    /// A complete event payload was decoded (post-`data:` strip for
    /// SSE; the line verbatim for NDJSON). The caller emits this.
    Event(String),
    /// The line was framing-only and carries no payload (blank lines,
    /// `event:`/`id:`/`retry:` SSE field lines, SSE comments starting
    /// with `:`, or an empty JSON line). Skip and keep reading.
    Skip,
    /// The terminator sentinel was reached. The caller stops reading.
    Terminate,
}

/// Decode a single raw line of streaming response body against the
/// configured wire format. Pure / synchronous so unit tests can hit
/// every decoding branch (with and without `data:` prefix, comment
/// lines, terminator handling) without setting up a mock HTTP server.
///
/// The `line` is expected to already have its trailing newline / CR
/// stripped — the caller (the line-reading loop) handles framing.
///
/// Only the line-at-a-time formats (NDJSON, text) flow through here.
/// SSE framing is stateful (multi-line `data:` payloads are joined
/// with `\n` and dispatched on a blank-line separator per the WHATWG
/// spec), so the SSE path uses [`SseLineDecoder`] instead.
fn decode_stream_event(config: &StreamingConfig, line: &str) -> StreamEvent {
    match config {
        StreamingConfig::Sse { .. } => {
            // SSE is decoded statefully via `SseLineDecoder`; reaching
            // this arm is a bug in the caller.
            debug_assert!(false, "SSE lines must flow through SseLineDecoder");
            StreamEvent::Skip
        }
        StreamingConfig::Json { terminator } => {
            // NDJSON / JSONL framing: empty lines are skipped (some
            // servers emit blank keepalive lines between records).
            if line.is_empty() {
                return StreamEvent::Skip;
            }

            if let Some(sentinel) = terminator.as_deref() {
                if line == sentinel {
                    return StreamEvent::Terminate;
                }
            }

            StreamEvent::Event(line.to_string())
        }
        StreamingConfig::Text => {
            // Plain-text line stream: empty lines are dropped per the
            // C# generator (`if(!string.IsNullOrEmpty(line)) yield
            // return line` — see `HttpEndpointGenerator.ts:815-825`).
            // No JSON parse, no SSE prefix strip, no terminator.
            if line.is_empty() {
                return StreamEvent::Skip;
            }
            StreamEvent::Event(line.to_string())
        }
    }
}

/// Stateful SSE event accumulator. Buffers `data:` payloads across
/// multiple lines (joined with `\n` per the WHATWG SSE spec
/// <https://html.spec.whatwg.org/multipage/server-sent-events.html#dispatchMessage>)
/// and dispatches the joined payload as one event on a blank-line
/// separator or at stream EOF. Mirrors the TS runtime's
/// `iterSseEvents` loop in
/// `generators/typescript/utils/core-utilities/src/core/stream/Stream.template.ts:123-165`.
///
/// Unknown SSE field lines (`id:`, `retry:`, or anything else) are
/// ignored per spec; `event:` is tracked across the same event
/// boundary for parity even though the CLI surface does not yet
/// route on it (no `eventDiscriminator` support — a deliberate
/// non-feature, left out of this parity sweep).
#[derive(Default)]
struct SseLineDecoder {
    data_buf: Option<String>,
    event_type: Option<String>,
}

impl SseLineDecoder {
    /// Process one raw line. Returns `Some(payload)` when a blank
    /// line dispatches a buffered event (the joined `data:`
    /// payload); `None` otherwise.
    fn push_line(&mut self, line: &str) -> Option<String> {
        if line.is_empty() {
            // Blank line: dispatch the buffered event if any, then
            // reset event_type either way (matches TS, which clears
            // both fields on dispatch regardless of whether one was
            // actually emitted).
            let dispatched = self.data_buf.take();
            self.event_type = None;
            return dispatched;
        }
        if line.starts_with(':') {
            // SSE comment / heartbeat — framing only, no payload.
            return None;
        }
        if let Some(rest) = line.strip_prefix("event:") {
            self.event_type = Some(rest.trim().to_string());
            return None;
        }
        if let Some(rest) = line.strip_prefix("data:") {
            // Strip exactly one optional leading space per the SSE
            // spec ("If value starts with a U+0020 SPACE, remove it").
            let val = rest.strip_prefix(' ').unwrap_or(rest);
            match &mut self.data_buf {
                Some(buf) => {
                    buf.push('\n');
                    buf.push_str(val);
                }
                None => {
                    self.data_buf = Some(val.to_string());
                }
            }
            return None;
        }
        // Unknown SSE fields (`id:`, `retry:`, anything else) are
        // ignored per spec.
        None
    }

    /// Flush the final partial event at stream EOF. Mirrors the TS
    /// runtime's post-loop `if (dataValue != null) yield ...` block
    /// — servers commonly close the connection without a trailing
    /// blank line on the last event.
    fn flush(&mut self) -> Option<String> {
        let dispatched = self.data_buf.take();
        self.event_type = None;
        dispatched
    }
}

/// Apply `x-fern-sdk-return-value` to a decoded event payload. Each
/// event is parsed as JSON, the configured path is projected, and the
/// printable form (a JSON-encoded string) is returned. When the JSON
/// fails to parse (servers occasionally emit a non-JSON keepalive
/// frame), the raw event string is emitted verbatim so the caller can
/// still see what came over the wire.
///
/// Text streams ([`StreamingConfig::Text`]) bypass this projection
/// entirely — their event payload is a raw line, not a JSON value,
/// so `x-fern-sdk-return-value` and `--no-extract` are both no-ops
/// (mirrors the C# generator, which `yield return line` directly).
fn project_stream_event(
    streaming: &StreamingConfig,
    event_payload: &str,
    return_path: Option<&str>,
    no_extract: bool,
    method_descriptor: &str,
) -> Result<Value, CliError> {
    if matches!(streaming, StreamingConfig::Text) {
        return Ok(Value::String(event_payload.to_string()));
    }
    match serde_json::from_str::<Value>(event_payload) {
        Ok(parsed) => extract_return_value(&parsed, return_path, no_extract, method_descriptor),
        // Bare strings, numbers, or partial frames flow through as
        // strings so the caller's output stream isn't blocked by
        // upstream noise. The user can `--no-extract` to inspect the
        // raw frames when debugging unexpected shapes.
        Err(_) => Ok(Value::String(event_payload.to_string())),
    }
}

/// Stream the response body line-by-line, emitting one formatted event
/// per dispatched payload to stdout. Stops at the configured
/// terminator (when the spec declared one) or at end-of-body.
async fn stream_response(
    response: reqwest::Response,
    streaming: &StreamingConfig,
    return_path: Option<&str>,
    no_extract: bool,
    pipeline: &crate::formatter::OutputPipeline,
    method_descriptor: &str,
) -> Result<(), CliError> {
    read_stream_events(response, streaming, |payload| {
        let value = project_stream_event(
            streaming,
            &payload,
            return_path,
            no_extract,
            method_descriptor,
        )?;
        let mut out = std::io::stdout().lock();
        pipeline
            .emit(&mut out, &value, false, true)
            .context("Failed to write output")?;
        Ok(())
    })
    .await
}

/// Buffer the streaming response into a single JSON value: a lone event
/// is returned as-is so downstream consumers see the unary shape; two
/// or more events are collected into a JSON array. An empty stream
/// returns `Value::Null` — the body finished without emitting any
/// payload, which is what the typed SDKs surface back to callers.
async fn buffer_streaming_response(
    response: reqwest::Response,
    streaming: &StreamingConfig,
    return_path: Option<&str>,
    no_extract: bool,
    method_descriptor: &str,
) -> Result<Value, CliError> {
    let mut events: Vec<Value> = Vec::new();
    read_stream_events(response, streaming, |payload| {
        events.push(project_stream_event(
            streaming,
            &payload,
            return_path,
            no_extract,
            method_descriptor,
        )?);
        Ok(())
    })
    .await?;
    Ok(match events.len() {
        0 => Value::Null,
        1 => events.into_iter().next().unwrap(),
        _ => Value::Array(events),
    })
}

/// Drive the response body through the format-appropriate line
/// decoder, invoking `emit` for each dispatched event payload. SSE
/// uses [`SseLineDecoder`] (stateful multi-line `data:` buffering);
/// NDJSON and text use [`decode_stream_event`] line-by-line. The
/// configured terminator (if any) is checked here, before `emit`, so
/// callers don't need to know about format-specific framing rules.
async fn read_stream_events<F>(
    response: reqwest::Response,
    streaming: &StreamingConfig,
    mut emit: F,
) -> Result<(), CliError>
where
    F: FnMut(String) -> Result<(), CliError>,
{
    let mut line_stream = ResponseLineStream::new(response);
    match streaming {
        StreamingConfig::Sse { terminator } => {
            let mut decoder = SseLineDecoder::default();
            while let Some(line) = line_stream.next_line().await? {
                if let Some(payload) = decoder.push_line(&line) {
                    if let Some(sentinel) = terminator.as_deref() {
                        if payload == sentinel {
                            return Ok(());
                        }
                    }
                    emit(payload)?;
                }
            }
            // EOF: flush any final unterminated event — matches the
            // TS runtime's post-loop dispatch (see Stream.template.ts).
            if let Some(payload) = decoder.flush() {
                if let Some(sentinel) = terminator.as_deref() {
                    if payload == sentinel {
                        return Ok(());
                    }
                }
                emit(payload)?;
            }
            Ok(())
        }
        StreamingConfig::Json { .. } | StreamingConfig::Text => {
            while let Some(line) = line_stream.next_line().await? {
                match decode_stream_event(streaming, &line) {
                    StreamEvent::Skip => continue,
                    StreamEvent::Terminate => return Ok(()),
                    StreamEvent::Event(payload) => emit(payload)?,
                }
            }
            Ok(())
        }
    }
}

/// Adapt a `reqwest::Response`'s byte stream into a line iterator. Keeps
/// a small in-memory buffer of bytes received but not yet terminated
/// by a newline; reads stop at LF and emit the preceding bytes (CR is
/// also stripped) as a UTF-8 string. The terminating line of a
/// response that doesn't end with a newline is still emitted from
/// `next_line` before the stream returns `None`.
struct ResponseLineStream {
    stream: futures_util::stream::BoxStream<'static, reqwest::Result<bytes::Bytes>>,
    buf: Vec<u8>,
    done: bool,
}

impl ResponseLineStream {
    fn new(response: reqwest::Response) -> Self {
        Self {
            stream: Box::pin(response.bytes_stream()),
            buf: Vec::with_capacity(4096),
            done: false,
        }
    }

    async fn next_line(&mut self) -> Result<Option<String>, CliError> {
        loop {
            // Emit a buffered line if a newline has already been received.
            if let Some(idx) = self.buf.iter().position(|&b| b == b'\n') {
                let mut line: Vec<u8> = self.buf.drain(..=idx).collect();
                line.pop(); // drop the trailing '\n'
                if line.last() == Some(&b'\r') {
                    line.pop();
                }
                return Ok(Some(decode_line_lossy(line)));
            }

            // If the stream is exhausted, flush any trailing bytes that
            // didn't end with a newline (servers commonly omit the final
            // newline on the last event of an NDJSON stream).
            if self.done {
                if self.buf.is_empty() {
                    return Ok(None);
                }
                let mut line: Vec<u8> = std::mem::take(&mut self.buf);
                if line.last() == Some(&b'\r') {
                    line.pop();
                }
                return Ok(Some(decode_line_lossy(line)));
            }

            // Pull the next chunk off the wire.
            match self.stream.next().await {
                Some(Ok(chunk)) => self.buf.extend_from_slice(&chunk),
                Some(Err(err)) => {
                    return Err(anyhow::Error::from(err)
                        .context("Failed to read streaming response chunk")
                        .into());
                }
                None => self.done = true,
            }
        }
    }
}

/// Decode a single line as UTF-8, replacing invalid sequences with
/// U+FFFD so a malformed byte (e.g. truncated multibyte from a flaky
/// proxy) doesn't crash the stream.
fn decode_line_lossy(bytes: Vec<u8>) -> String {
    match String::from_utf8(bytes) {
        Ok(s) => s,
        Err(e) => String::from_utf8_lossy(&e.into_bytes()).into_owned(),
    }
}

/// Executes an API method call.
///
/// This is the core function of the CLI that handles:
/// 1. Parameter validation and URL construction.
/// 2. Request body validation against the Discovery Document schema.
/// 3. Authentication (OAuth or none).
/// 4. Sending the HTTP request (GET/POST/etc).
/// 5. Handling various response types (JSON, binary).
/// 6. Auto-pagination for list endpoints.
#[allow(clippy::too_many_arguments)]
pub async fn execute_method(
    doc: &RestDescription,
    method: &RestMethod,
    params_json: Option<&str>,
    body_json: Option<&str>,
    auth_provider: &DynAuthProvider,
    output_path: Option<&str>,
    upload: Option<UploadSource<'_>>,
    binary_body_path: Option<&str>,
    dry_run: bool,
    pagination: &PaginationConfig,
    pipeline: &crate::formatter::OutputPipeline,
    capture_output: bool,
    base_url_override: Option<&str>,
    http_config: &crate::http::HttpConfig,
    no_extract: bool,
    no_retry: bool,
    no_stream: bool,
    extra_headers: &[(String, String)],
) -> Result<Option<Value>, CliError> {
    let binary_flag = method
        .binary_request_body
        .as_ref()
        .map(|b| b.flag_name.as_str());
    if binary_body_path.is_some() && binary_flag.is_none() {
        return Err(CliError::Validation(
            "binary body path is only valid for operations with a binary request body"
                .to_string(),
        ));
    }
    if binary_body_path.is_some() && body_json.is_some() {
        return Err(CliError::Validation(format!(
            "--{} and --json are mutually exclusive",
            binary_flag.unwrap_or("file"),
        )));
    }

    let input = parse_and_validate_inputs(doc, method, params_json, body_json, upload.is_some(), base_url_override, extra_headers)?;

    // Human-readable identifier for the operation, used in
    // `x-fern-sdk-return-value` extraction errors so the user can find
    // the offending op when the response shape disagrees with the
    // spec. Prefer the `operationId` (matches the spec text) and fall
    // back to `GET /things` when it's absent.
    let method_descriptor = match method.id.as_deref() {
        Some(id) => format!("'{id}'"),
        None => format!(
            "{} {}",
            method.http_method.to_ascii_uppercase(),
            method.path
        ),
    };

    if dry_run {
        let mut dry_run_info = json!({
            "dry_run": true,
            "url": input.full_url,
            "method": method.http_method,
            "query_params": input.query_params,
            "headers": input.header_params,
            "body": input.body,
            "is_multipart_upload": input.is_upload,
        });
        if let Some(raw) = binary_body_path {
            let (content_type, flag_name) = method
                .binary_request_body
                .as_ref()
                .map(|b| (b.content_type.as_str(), b.flag_name.as_str()))
                .unwrap_or(("", ""));
            let (source, transfer) = match BinaryBodySource::parse(raw) {
                BinaryBodySource::File(p) => (json!({ "file": p }), "content-length"),
                BinaryBodySource::Stdin => (json!({ "stdin": true }), "chunked"),
            };
            dry_run_info["binary_body"] = json!({
                "source": source,
                "content_type": content_type,
                "transfer_encoding": transfer,
                "flag": flag_name,
            });
        }
        if capture_output {
            return Ok(Some(dry_run_info));
        }
        let mut out = std::io::stdout().lock();
        pipeline
            .emit(&mut out, &dry_run_info, false, true)
            .context("Failed to write output")?;
        return Ok(None);
    }

    let endpoint_pag = method.pagination.as_ref();
    let mut page_state: PageState = PageState::initial(endpoint_pag);
    let mut pages_fetched: u32 = 0;
    let mut captured_values = Vec::new();
    let auth_metadata = endpoint_metadata_for(method);

    // Build the client once outside the pagination loop. Client construction
    // reads env vars and (with TLS) builds a connection pool; rebuilding per
    // page would defeat connection reuse and emit any one-time warnings
    // (e.g. insecure-mode) once per page.
    let client = http_config.build_client()?;

    loop {
        // Snapshot the URL we are about to hit so the response handler can
        // resolve relative `next_path` values against it. Captured before
        // `page_state` is borrowed mutably below.
        let current_url = page_state
            .url_override()
            .unwrap_or(&input.full_url)
            .to_string();

        let method_id = method.id.as_deref().unwrap_or("unknown");
        let start = std::time::Instant::now();

        // Retry loop. Each iteration rebuilds the request (so streaming
        // bodies start fresh) and dispatches it. `retry_attempt` is
        // 0-indexed and counts *prior* sends — we increment it after
        // each retry, then re-check the policy before the next send.
        //
        // Stdin-sourced binary bodies are *not* replayable: the first
        // attempt consumes the pipe and any retry would silently send
        // an empty body. Disable retries for that case so we preserve
        // the pre-retry behavior (a single attempt, surface whatever
        // the server returns) rather than masking the original failure.
        let retries_cfg = if binary_body_is_stdin(binary_body_path) {
            None
        } else {
            method.retries.as_ref()
        };
        let mut retry_attempt: u32 = 0;
        let response = loop {
            let request = build_http_request(
                &client,
                method,
                &input,
                auth_provider,
                &auth_metadata,
                &page_state,
                pages_fetched,
                &upload,
                binary_body_path,
                pagination,
            )
            .await?;

            match request.send().await {
                Ok(resp) => {
                    let status = resp.status();
                    let retry_after_header = resp
                        .headers()
                        .get("retry-after")
                        .and_then(|v| v.to_str().ok())
                        .map(|s| s.to_string());
                    if let Some(cfg) = retries_cfg {
                        let outcome = RetryOutcome {
                            status: Some(status.as_u16()),
                            retry_after: retry_after_header.as_deref(),
                        };
                        if let Some(delay) = decide_retry(
                            retry_attempt,
                            &outcome,
                            cfg,
                            &method.http_method,
                            method.idempotent,
                            no_retry,
                        ) {
                            tracing::warn!(
                                api_method = method_id,
                                http_method = %method.http_method,
                                status = status.as_u16(),
                                attempt = retry_attempt + 1,
                                delay_ms = delay.as_millis() as u64,
                                "retrying after retryable HTTP status",
                            );
                            // Drain the body so the connection can be
                            // returned to the pool. We don't surface
                            // the body on retried responses; the final
                            // response (success or terminal failure)
                            // is what the user sees.
                            let _ = resp.bytes().await;
                            tokio::time::sleep(delay).await;
                            retry_attempt += 1;
                            continue;
                        }
                    }
                    break resp;
                }
                Err(e) => {
                    if let Some(cfg) = retries_cfg {
                        let outcome = RetryOutcome {
                            status: None,
                            retry_after: None,
                        };
                        if let Some(delay) = decide_retry(
                            retry_attempt,
                            &outcome,
                            cfg,
                            &method.http_method,
                            method.idempotent,
                            no_retry,
                        ) {
                            tracing::warn!(
                                api_method = method_id,
                                http_method = %method.http_method,
                                attempt = retry_attempt + 1,
                                delay_ms = delay.as_millis() as u64,
                                error = %e,
                                "retrying after network/transport failure",
                            );
                            tokio::time::sleep(delay).await;
                            retry_attempt += 1;
                            continue;
                        }
                    }
                    // Surface a human-readable hint to stderr if this looks like
                    // a TLS failure — the most common debugging hump for users
                    // behind corporate proxies / interception tools. The hint is
                    // a side effect; the error then propagates up like any other.
                    crate::http::maybe_emit_tls_hint(http_config, &e);
                    return Err(anyhow::Error::from(e).context("HTTP request failed").into());
                }
            }
        };
        let latency_ms = start.elapsed().as_millis() as u64;

        let status = response.status();
        let content_type = response
            .headers()
            .get("content-type")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("")
            .to_string();

        if !status.is_success() {
            let error_body = response.text().await.unwrap_or_default();
            tracing::warn!(
                api_method = method_id,
                http_method = %method.http_method,
                status = status.as_u16(),
                latency_ms = latency_ms,
                "API error"
            );
            return handle_error_response(
                status,
                &error_body,
                auth_provider.as_ref(),
                &auth_metadata,
            );
        }

        tracing::debug!(
            api_method = method_id,
            http_method = %method.http_method,
            status = status.as_u16(),
            latency_ms = latency_ms,
            content_type = %content_type,
            is_upload = input.is_upload,
            page = pages_fetched,
            "API request"
        );

        // Streaming response branch. Selected when:
        // - the operation declares `x-fern-streaming`, AND
        // - the caller hasn't explicitly opted out via `--no-stream`,
        //   AND
        // - we aren't capturing into a single `Value` for a
        //   programmatic caller (those need a unary shape and treat
        //   `--no-stream` as implicit).
        //
        // `--no-stream` and `capture_output` both fall through to the
        // existing buffered path below: the body is read once and
        // either pretty-printed (no_stream from the CLI) or decoded
        // into a `Value` (capture_output from `AppContext::invoke`).
        if let Some(streaming) = method.streaming.as_ref() {
            if !no_stream && !capture_output {
                // Note: `pages_fetched` is intentionally left untouched
                // here. Streaming endpoints are single-request by
                // construction (see the parse-time mutual exclusion
                // with `x-fern-pagination`), so the pagination loop
                // never re-enters; bumping the counter would only
                // confuse the unrelated request-tracing in `debug!`.
                stream_response(
                    response,
                    streaming,
                    method.return_value.as_deref(),
                    no_extract,
                    pipeline,
                    &method_descriptor,
                )
                .await?;
                break;
            }
            // Buffered fallback: collect every event into a single
            // JSON array (or unwrap the lone event when only one
            // arrived) so the downstream printer / capture path sees
            // the kind of value it expects from a unary endpoint. The
            // server may legitimately send a non-streaming body, so we
            // still parse it line-by-line and fall back to a
            // single-value array when the body holds one JSON object.
            let buffered = buffer_streaming_response(
                response,
                streaming,
                method.return_value.as_deref(),
                no_extract,
                &method_descriptor,
            )
            .await?;
            if capture_output {
                captured_values.push(buffered);
            } else {
                let mut out = std::io::stdout().lock();
                pipeline
                    .emit(&mut out, &buffered, false, true)
                    .context("Failed to write output")?;
            }
            break;
        }

        let is_json =
            content_type.contains("application/json") || content_type.contains("text/json");

        if is_json || content_type.is_empty() {
            let body_text = response
                .text()
                .await
                .context("Failed to read response body")?;

            let response_body = body_text;
            let should_continue = handle_json_response(
                &response_body,
                pagination,
                endpoint_pag,
                pipeline,
                &mut pages_fetched,
                &mut page_state,
                capture_output,
                &mut captured_values,
                &current_url,
                &input.query_params,
                method.return_value.as_deref(),
                no_extract,
                &method_descriptor,
            )
            .await?;

            if should_continue {
                continue;
            }
        } else if let Some(res) = handle_binary_response(
            response,
            &content_type,
            output_path,
            pipeline,
            capture_output,
        )
        .await?
        {
            captured_values.push(res);
        }

        break;
    }

    if capture_output && !captured_values.is_empty() {
        if captured_values.len() == 1 {
            return Ok(Some(captured_values.pop().unwrap()));
        } else {
            return Ok(Some(Value::Array(captured_values)));
        }
    }

    Ok(None)
}

/// Serialize a query parameter value according to its OpenAPI style.
fn serialize_query_param(
    key: &str,
    value: &Value,
    param_def: Option<&crate::openapi::discovery::MethodParameter>,
) -> Vec<(String, String)> {
    let style = param_def
        .and_then(|p| p.style.as_deref())
        .unwrap_or("form");
    let explode = param_def
        .and_then(|p| p.explode)
        .unwrap_or(style == "form");

    match style {
        "deepObject" => serialize_deep_object(key, value),
        _ => serialize_form(key, value, explode),
    }
}

fn serialize_deep_object(key: &str, value: &Value) -> Vec<(String, String)> {
    match value {
        Value::Object(_) => {
            // Wrap as {key: value} so serde-qs produces key[...]=... pairs.
            // ArrayFormat::Unindexed gives filter[tags]=a&filter[tags]=b,
            // consistent with the Fern Python and C# SDKs.
            let wrapped = serde_json::json!({ key: value });
            let config = serde_qs::Config::new()
                .array_format(serde_qs::ArrayFormat::Unindexed);
            match config.serialize_string(&wrapped) {
                Ok(qs) => {
                    // serde-qs URL-encodes the output; decode each pair
                    qs.split('&')
                        .filter(|s| !s.is_empty())
                        .filter_map(|pair| {
                            let (k, v) = pair.split_once('=')?;
                            let decoded_k = percent_encoding::percent_decode_str(k)
                                .decode_utf8_lossy()
                                .into_owned();
                            let decoded_v = percent_encoding::percent_decode_str(v)
                                .decode_utf8_lossy()
                                .into_owned();
                            Some((decoded_k, decoded_v))
                        })
                        .collect()
                }
                Err(_) => vec![(key.to_string(), value_to_query_string(value))],
            }
        }
        _ => vec![(key.to_string(), value_to_query_string(value))],
    }
}

fn serialize_form(key: &str, value: &Value, explode: bool) -> Vec<(String, String)> {
    match value {
        Value::Array(arr) if explode => arr
            .iter()
            .map(|v| (key.to_string(), value_to_query_string(v)))
            .collect(),
        Value::Array(arr) => {
            let joined = arr
                .iter()
                .map(value_to_query_string)
                .collect::<Vec<_>>()
                .join(",");
            vec![(key.to_string(), joined)]
        }
        _ => vec![(key.to_string(), value_to_query_string(value))],
    }
}

fn value_to_query_string(v: &Value) -> String {
    match v {
        Value::String(s) => s.clone(),
        Value::Number(n) => n.to_string(),
        Value::Bool(b) => b.to_string(),
        Value::Null => String::new(),
        other => other.to_string(),
    }
}

fn effective_root_url(method: &RestMethod, doc: &RestDescription) -> String {
    if !method.root_url.is_empty() { method.root_url.clone() } else { doc.root_url.clone() }
}

/// Prepend `doc.base_path` (sourced from `x-fern-base-path`) to `base`,
/// inserting exactly one slash between the two segments regardless of
/// whether either side already has a slash on its boundary. Returns
/// `base` unchanged when `doc.base_path` is `None` or normalizes to
/// empty.
///
/// Examples (server URL × base_path slash matrix):
/// - `"https://x/"` + `"/v1"`  → `"https://x/v1"`
/// - `"https://x"`  + `"/v1"`  → `"https://x/v1"`
/// - `"https://x/"` + `"v1"`   → `"https://x/v1"`
/// - `"https://x"`  + `"v1"`   → `"https://x/v1"`
/// - `"https://x"`  + `"/v1/"` → `"https://x/v1"` (trailing slash on
///   base_path is stripped; `build_url` re-adds one before the path)
///
/// `build_url` calls this helper uniformly across all three URL sources
/// — `--base-url` override, `doc.base_url`, and `effective_root_url +
/// service_path` — so the base path is applied *additively* on top of
/// any one of them. In particular, `--base-url https://staging/v2` on a
/// spec with `x-fern-base-path: /v1` produces `https://staging/v2/v1/...`,
/// not `https://staging/v2/...`: `x-fern-base-path` is part of the spec's
/// logical URL structure, not a property of any specific host.
///
/// Mirrors fern-api/fern's openapi-ir-parser:
/// `packages/cli/api-importers/openapi/openapi-ir-parser/src/openapi/v3/extensions/getFernBasePath.ts`.
///
/// The base path passed in is expected to already have any `{param}`
/// placeholders substituted — `build_url` calls `render_path_template`
/// on `doc.base_path` first so this helper only deals with the
/// post-substitution slash-edge logic.
fn apply_base_path(base: &str, base_path: Option<&str>) -> String {
    let Some(bp) = base_path else {
        return base.to_string();
    };
    let bp_trimmed = bp.trim_matches('/');
    if bp_trimmed.is_empty() {
        return base.to_string();
    }
    let base_trimmed = base.trim_end_matches('/');
    format!("{base_trimmed}/{bp_trimmed}")
}

fn build_url(
    doc: &RestDescription,
    method: &RestMethod,
    params: &Map<String, Value>,
    is_upload: bool,
    base_url_override: Option<&str>,
) -> Result<(String, Vec<(String, String)>), CliError> {
    // Build URL base and path. The base_url here is just the server (or
    // override) plus any Discovery `service_path`; x-fern-base-path is
    // applied as a separate step below so the slash-edge logic stays in
    // one place and applies to all three base sources (override, explicit
    // `base_url`, and effective root_url + service_path).
    let raw_base_url = if let Some(b) = base_url_override {
        b.trim_end_matches('/').to_string()
    } else if let Some(b) = &doc.base_url {
        b.clone()
    } else {
        format!("{}{}", effective_root_url(method, doc), doc.service_path)
    };
    // Render any `{param}` placeholders in `x-fern-base-path` (e.g.
    // `/{tenant}/v1`) against the operation's parameters. The placeholder
    // names are also collected so we can exclude them from the query
    // string below — the param has been consumed by the URL path and
    // must not leak as `?tenant=acme`. Mirrors upstream Fern where base
    // path placeholders are baked into endpoint paths at Definition build
    // time and then resolved by the SDK's path-parameter renderer at
    // request time.
    let rendered_base_path = doc
        .base_path
        .as_deref()
        .map(|bp| render_path_template(bp, params))
        .transpose()?;
    let base_path_parameters: HashSet<&str> = doc
        .base_path
        .as_deref()
        .map(extract_template_path_parameters)
        .unwrap_or_default();
    let base_url = apply_base_path(&raw_base_url, rendered_base_path.as_deref());

    // Prefer flatPath when its placeholders match the method's path parameters.
    // Some Discovery Documents (e.g., Slides presentations.get) have flatPath
    // placeholders that don't match parameter names ({presentationsId} vs
    // {presentationId}). In those cases, fall back to path which uses RFC 6570
    // operators ({+var}) that this function already handles.
    let path_template = match method.flat_path.as_deref() {
        Some(fp) => {
            let all_match = method
                .parameters
                .iter()
                .filter(|(_, p)| p.location.as_deref() == Some("path"))
                .all(|(name, _)| {
                    let plain = format!("{{{name}}}");
                    let plus = format!("{{+{name}}}");
                    fp.contains(&plain) || fp.contains(&plus)
                });
            if all_match {
                fp
            } else {
                method.path.as_str()
            }
        }
        None => method.path.as_str(),
    };

    // Substitute path parameters and separate query parameters
    let path_parameters = extract_template_path_parameters(path_template);
    let mut query_params: Vec<(String, String)> = Vec::new();

    for (key, value) in params {
        if path_parameters.contains(key.as_str()) {
            continue;
        }
        // Params that backfill placeholders in `x-fern-base-path` have
        // already been consumed by the URL path; they must not also
        // appear as query string entries.
        if base_path_parameters.contains(key.as_str()) {
            continue;
        }

        let is_path_param = method
            .parameters
            .get(key)
            .and_then(|p| p.location.as_deref())
            == Some("path");

        if is_path_param {
            return Err(CliError::Validation(format!(
                "Path parameter '{key}' was provided but is not present in URL template '{path_template}'"
            )));
        }

        // Use style-aware serialization for query parameters.
        // For backward compatibility, `repeated` params still use the legacy
        // expansion (equivalent to form+explode).
        let param_def = method.parameters.get(key);
        let is_repeated = param_def.map(|p| p.repeated).unwrap_or(false);

        if is_repeated {
            if let Value::Array(arr) = value {
                for item in arr {
                    let val_str = match item {
                        Value::String(s) => s.clone(),
                        other => other.to_string(),
                    };
                    query_params.push((key.clone(), val_str));
                }
                continue;
            }
        }

        let pairs = serialize_query_param(key, value, param_def);
        query_params.extend(pairs);
    }

    let url_path = render_path_template(path_template, params)?;

    let full_url = if is_upload {
        // Use the upload endpoint from the Discovery Document
        let upload_endpoint = method
            .media_upload
            .as_ref()
            .and_then(|mu| mu.protocols.as_ref())
            .and_then(|p| p.simple.as_ref())
            .map(|s| s.path.as_str())
            .ok_or_else(|| {
                CliError::Validation(
                    "Method supports media upload but no upload path found in Discovery Document"
                        .to_string(),
                )
            })?;
        let upload_path = render_path_template(upload_endpoint, params)?;
        // Compose the upload host with the spec-level base_path the same
        // way the non-upload branch does, so x-fern-base-path is applied
        // uniformly. This branch is currently unreachable from OpenAPI
        // specs (only Google Discovery sets `media_upload`, and Discovery
        // specs don't carry `base_path`), but keeping the wiring
        // symmetric prevents a silent gap if either side ever changes.
        let root = base_url_override
            .map(|b| b.trim_end_matches('/').to_string())
            .unwrap_or_else(|| effective_root_url(method, doc).trim_end_matches('/').to_string());
        let root = apply_base_path(&root, rendered_base_path.as_deref());
        format!("{root}{upload_path}")
    } else {
        match (base_url.ends_with('/'), url_path.starts_with('/')) {
            (true, true) => format!("{}{}", base_url.trim_end_matches('/'), url_path),
            (false, false) => format!("{base_url}/{url_path}"),
            _ => format!("{base_url}{url_path}"),
        }
    };

    Ok((full_url, query_params))
}

fn extract_template_path_parameters(path_template: &str) -> HashSet<&str> {
    let mut found = HashSet::new();
    let mut cursor = 0;

    while let Some(open_idx) = path_template[cursor..].find('{') {
        let token_start = cursor + open_idx;
        let Some(close_idx) = path_template[token_start..].find('}') else {
            break;
        };

        let token_end = token_start + close_idx;
        let token = &path_template[token_start + 1..token_end];
        if let Some(key) = token.strip_prefix('+') {
            found.insert(key);
        } else {
            found.insert(token);
        }
        cursor = token_end + 1;
    }

    found
}

fn render_path_template(
    path_template: &str,
    params: &Map<String, Value>,
) -> Result<String, CliError> {
    let mut rendered = String::with_capacity(path_template.len());
    let mut cursor = 0;

    while let Some(open_idx) = path_template[cursor..].find('{') {
        let token_start = cursor + open_idx;
        rendered.push_str(&path_template[cursor..token_start]);

        let Some(close_idx) = path_template[token_start..].find('}') else {
            rendered.push_str(&path_template[token_start..]);
            return Ok(rendered);
        };

        let token_end = token_start + close_idx;
        let token = &path_template[token_start + 1..token_end];
        let (is_plus, key) = if let Some(key) = token.strip_prefix('+') {
            (true, key)
        } else {
            (false, token)
        };

        if let Some(value) = params.get(key) {
            let val_str = match value {
                Value::String(s) => s.clone(),
                other => other.to_string(),
            };
            let encoded = if is_plus {
                let validated = crate::validate::validate_resource_name(&val_str)?;
                crate::validate::encode_path_preserving_slashes(validated)
            } else {
                crate::validate::encode_path_segment(&val_str)
            };
            rendered.push_str(&encoded);
        } else {
            rendered.push_str(&path_template[token_start..=token_end]);
        }

        cursor = token_end + 1;
    }

    rendered.push_str(&path_template[cursor..]);
    Ok(rendered)
}

/// Resolves the MIME type for the uploaded media content.
///
/// Priority:
/// 1. `--upload-content-type` flag (explicit override)
/// 2. File extension inference (common extensions mapped to MIME types)
/// 3. Metadata `mimeType` (fallback for backward compatibility)
/// 4. `application/octet-stream`
///
/// All returned MIME types have control characters stripped to prevent
/// MIME header injection via user-controlled metadata.
fn resolve_upload_mime(
    explicit: Option<&str>,
    upload_path: Option<&str>,
    metadata: &Option<Value>,
) -> String {
    let raw = explicit
        .map(|s| s.to_string())
        .or_else(|| upload_path.and_then(mime_from_extension))
        .or_else(|| {
            metadata
                .as_ref()
                .and_then(|m| m.get("mimeType"))
                .and_then(|v| v.as_str())
                .map(|s| s.to_string())
        })
        .unwrap_or_else(|| "application/octet-stream".to_string());

    // Strip CR/LF and other control characters to prevent MIME header injection.
    let sanitized: String = raw.chars().filter(|c| !c.is_control()).collect();
    if sanitized.is_empty() {
        "application/octet-stream".to_string()
    } else {
        sanitized
    }
}

/// Simple MIME type inference from file extension.
/// Returns `None` for unrecognized extensions.
fn mime_from_extension(path: &str) -> Option<String> {
    let ext = path.rsplit('.').next()?.to_lowercase();
    let mime = match ext.as_str() {
        "txt" => "text/plain",
        "html" | "htm" => "text/html",
        "css" => "text/css",
        "csv" => "text/csv",
        "xml" => "application/xml",
        "json" => "application/json",
        "js" => "application/javascript",
        "pdf" => "application/pdf",
        "zip" => "application/zip",
        "gz" | "gzip" => "application/gzip",
        "tar" => "application/x-tar",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "svg" => "image/svg+xml",
        "webp" => "image/webp",
        "ico" => "image/x-icon",
        "mp3" => "audio/mpeg",
        "wav" => "audio/wav",
        "mp4" => "video/mp4",
        "webm" => "video/webm",
        "md" | "markdown" => "text/markdown",
        "yaml" | "yml" => "application/yaml",
        "toml" => "application/toml",
        "doc" => "application/msword",
        "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "xls" => "application/vnd.ms-excel",
        "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "ppt" => "application/vnd.ms-powerpoint",
        "pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "wasm" => "application/wasm",
        _ => return None,
    };
    Some(mime.to_string())
}

/// Streams stdin as a raw request body via chunked transfer encoding.
/// Used when the user passes `-` to the binary-body flag.
fn build_stdin_body_stream() -> reqwest::Body {
    let stream = tokio_util::io::ReaderStream::new(tokio::io::stdin());
    reqwest::Body::wrap_stream(stream)
}

/// Streams a file as a raw request body. Used for operations whose request
/// body is declared as a binary content type (e.g. `application/octet-stream`).
/// Memory usage stays at O(64 KB) regardless of file size.
///
/// `flag_name` is the spec-derived CLI flag (`file`, `body`, or whatever
/// `x-fern-parameter-name` set) — surfaced in the error message if the file
/// disappears between the upfront `metadata()` check and stream open (TOCTOU).
fn build_binary_file_stream(
    file_path: &str,
    file_size: u64,
    flag_name: &str,
) -> (reqwest::Body, u64) {
    let file_path_owned = file_path.to_owned();
    let flag_owned = flag_name.to_owned();
    let stream = futures_util::stream::once(async move {
        tokio::fs::File::open(&file_path_owned).await.map_err(|e| {
            std::io::Error::new(
                e.kind(),
                format!("failed to open --{flag_owned} '{file_path_owned}': {e}"),
            )
        })
    })
    .map_ok(tokio_util::io::ReaderStream::new)
    .try_flatten();

    (reqwest::Body::wrap_stream(stream), file_size)
}

/// Builds a streaming multipart/related body for media upload requests.
///
/// Instead of reading the entire file into memory, this streams the file in
/// chunks via `ReaderStream`, keeping memory usage at O(64 KB) regardless of
/// file size. The `Content-Length` is pre-computed from file metadata so APIs
/// Generate a unique boundary ID for multipart requests using timestamp.
fn generate_boundary_id() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos() as u64
}

/// still receive the correct header without buffering.
///
/// Returns `(body, content_type, content_length)`.
fn build_multipart_stream(
    metadata: &Option<Value>,
    file_path: &str,
    file_size: u64,
    media_mime: &str,
) -> Result<(reqwest::Body, String, u64), CliError> {
    let boundary = format!("fern_boundary_{:016x}", generate_boundary_id());

    let media_mime = media_mime.to_string();

    let metadata_json = match metadata {
        Some(m) => serde_json::to_string(m).map_err(|e| {
            CliError::Validation(format!("Failed to serialize upload metadata: {e}"))
        })?,
        None => "{}".to_string(),
    };

    let preamble = format!(
        "--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{metadata_json}\r\n\
         --{boundary}\r\nContent-Type: {media_mime}\r\n\r\n"
    );
    let postamble = format!("\r\n--{boundary}--\r\n");

    let content_length = preamble.len() as u64 + file_size + postamble.len() as u64;
    let content_type = format!("multipart/related; boundary={boundary}");

    let preamble_bytes: bytes::Bytes = preamble.into_bytes().into();
    let postamble_bytes: bytes::Bytes = postamble.into_bytes().into();

    let file_path_owned = file_path.to_owned();
    let file_stream = futures_util::stream::once(async move {
        tokio::fs::File::open(&file_path_owned).await.map_err(|e| {
            std::io::Error::new(
                e.kind(),
                format!("failed to open upload file '{file_path_owned}': {e}"),
            )
        })
    })
    .map_ok(tokio_util::io::ReaderStream::new)
    .try_flatten();

    let stream = futures_util::stream::once(async { Ok::<_, std::io::Error>(preamble_bytes) })
        .chain(file_stream)
        .chain(futures_util::stream::once(async {
            Ok::<_, std::io::Error>(postamble_bytes)
        }));

    Ok((
        reqwest::Body::wrap_stream(stream),
        content_type,
        content_length,
    ))
}

/// Builds a multipart/related body from in-memory bytes.
///
/// Used when the upload content is constructed in memory (e.g., a Gmail RFC 5322
/// message with attachments) rather than read from a file on disk.
fn build_multipart_bytes(
    metadata: &Option<Value>,
    data: &[u8],
    media_mime: &str,
) -> Result<(reqwest::Body, String, u64), CliError> {
    let boundary = format!("fern_boundary_{:016x}", generate_boundary_id());

    let metadata_json = match metadata {
        Some(m) => serde_json::to_string(m).map_err(|e| {
            CliError::Validation(format!("Failed to serialize upload metadata: {e}"))
        })?,
        None => "{}".to_string(),
    };

    let preamble = format!(
        "--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{metadata_json}\r\n\
         --{boundary}\r\nContent-Type: {media_mime}\r\n\r\n"
    );
    let postamble = format!("\r\n--{boundary}--\r\n");

    let mut body = Vec::with_capacity(preamble.len() + data.len() + postamble.len());
    body.extend_from_slice(preamble.as_bytes());
    body.extend_from_slice(data);
    body.extend_from_slice(postamble.as_bytes());

    let content_length = body.len() as u64;
    let content_type = format!("multipart/related; boundary={boundary}");

    Ok((reqwest::Body::from(body), content_type, content_length))
}

/// Builds a buffered multipart/related body for media upload requests.
///
/// This is the legacy implementation retained for unit tests that need
/// a fully materialized body to assert against.
///
/// Returns the body bytes and the Content-Type header value (with boundary).
#[cfg(test)]
fn build_multipart_body(
    metadata: &Option<Value>,
    file_bytes: &[u8],
    media_mime: &str,
) -> Result<(Vec<u8>, String), CliError> {
    let boundary = format!("fern_boundary_{:016x}", generate_boundary_id());

    // Build multipart/related body
    let metadata_json = metadata
        .as_ref()
        .map(|m| serde_json::to_string(m).unwrap_or_else(|_| "{}".to_string()))
        .unwrap_or_else(|| "{}".to_string());

    let mut body = Vec::new();
    // Part 1: JSON metadata
    body.extend_from_slice(format!("--{boundary}\r\n").as_bytes());
    body.extend_from_slice(b"Content-Type: application/json; charset=UTF-8\r\n\r\n");
    body.extend_from_slice(metadata_json.as_bytes());
    body.extend_from_slice(b"\r\n");
    // Part 2: File content
    body.extend_from_slice(format!("--{boundary}\r\n").as_bytes());
    body.extend_from_slice(format!("Content-Type: {media_mime}\r\n\r\n").as_bytes());
    body.extend_from_slice(file_bytes);
    body.extend_from_slice(b"\r\n");
    // Closing boundary
    body.extend_from_slice(format!("--{boundary}--\r\n").as_bytes());

    let content_type = format!("multipart/related; boundary={boundary}");
    Ok((body, content_type))
}

/// Intentional duplication from `graphql/executor.rs` — no shared module by design.
fn set_nested_value(obj: &mut Map<String, Value>, path: &str, value: Value) {
    match path.split_once('.') {
        None => {
            obj.insert(path.to_string(), value);
        }
        Some((head, tail)) => {
            let nested = obj
                .entry(head.to_string())
                .or_insert_with(|| Value::Object(Map::new()));
            if let Value::Object(nested_map) = nested {
                set_nested_value(nested_map, tail, value);
            }
        }
    }
}

///
/// CLI flags arrive as `Value::String` (clap stores them as `String`), but a
/// body field declared `integer` / `number` / `boolean` should land in the
/// JSON body with the right runtime type, not as a quoted string. Values
/// supplied via `--params` are already typed by `serde_json` and pass through
/// unchanged. `object` and `array` types are JSON-decoded so callers can pass
/// nested structures via individual flags (e.g. `--addresses '[{"city":"SF"}]'`).
fn coerce_body_param_value(value: &Value, param_type: Option<&str>) -> Result<Value, CliError> {
    let Value::String(raw) = value else {
        return Ok(value.clone());
    };
    match param_type {
        Some("integer") => raw
            .parse::<i64>()
            .map(|n| Value::Number(n.into()))
            .map_err(|e| CliError::Validation(format!("Invalid integer body value '{raw}': {e}"))),
        Some("number") => {
            let n = raw.parse::<f64>().map_err(|e| {
                CliError::Validation(format!("Invalid number body value '{raw}': {e}"))
            })?;
            serde_json::Number::from_f64(n)
                .map(Value::Number)
                .ok_or_else(|| CliError::Validation(format!("Non-finite number body value '{raw}'")))
        }
        Some("boolean") => match raw.as_str() {
            "true" | "1" => Ok(Value::Bool(true)),
            "false" | "0" => Ok(Value::Bool(false)),
            _ => Err(CliError::Validation(format!(
                "Invalid boolean body value '{raw}' (expected true/false)"
            ))),
        },
        Some("object") | Some("array") => serde_json::from_str(raw).map_err(|e| {
            CliError::Validation(format!("Invalid JSON body value for nested field: {e}"))
        }),
        _ => Ok(Value::String(raw.clone())),
    }
}

/// Validates a JSON body against a Discovery Document schema.
fn validate_body_against_schema(
    body: &Value,
    schema_name: &str,
    doc: &RestDescription,
) -> Result<(), CliError> {
    let mut errors = Vec::new();
    validate_value(body, schema_name, doc, "$", &mut errors);

    if !errors.is_empty() {
        return Err(CliError::Validation(format!(
            "Request body failed schema validation:\n- {}",
            errors.join("\n- ")
        )));
    }

    Ok(())
}

fn validate_value(
    value: &Value,
    schema_ref_name: &str,
    doc: &RestDescription,
    path: &str,
    errors: &mut Vec<String>,
) {
    let schema = match doc.schemas.get(schema_ref_name) {
        Some(s) => s,
        None => {
            errors.push(format!("{path}: Schema '{schema_ref_name}' not found"));
            return;
        }
    };

    // If the top-level schema is an object
    if schema.schema_type.as_deref() == Some("object") || !schema.properties.is_empty() {
        if let Value::Object(obj) = value {
            validate_properties(obj, &schema.properties, &schema.required, doc, path, errors);
        } else {
            errors.push(format!("{path}: Expected object"));
        }
    }
}

fn validate_properties(
    obj: &Map<String, Value>,
    properties: &HashMap<String, crate::openapi::discovery::JsonSchemaProperty>,
    required_keys: &[String],
    doc: &RestDescription,
    path: &str,
    errors: &mut Vec<String>,
) {
    // Check required keys first
    for req_key in required_keys {
        if !obj.contains_key(req_key) {
            errors.push(format!("{path}: Missing required property '{req_key}'"));
        }
    }

    // An empty properties map means "any additional properties are allowed"
    // (JSON Schema default when additionalProperties is not explicitly false).
    if properties.is_empty() {
        return;
    }

    let valid_keys: std::collections::HashSet<&String> = properties.keys().collect();

    for (key, val) in obj {
        let current_path = if path == "$" {
            key.clone()
        } else {
            format!("{path}.{key}")
        };

        if !valid_keys.contains(key) {
            errors.push(format!(
                "{current_path}: Unknown property. Valid properties: {:?}",
                valid_keys.iter().map(|k| k.as_str()).collect::<Vec<_>>()
            ));
            continue;
        }

        let prop_schema = &properties[key];
        validate_property(val, prop_schema, doc, &current_path, errors);
    }
}

fn validate_property(
    value: &Value,
    prop_schema: &crate::openapi::discovery::JsonSchemaProperty,
    doc: &RestDescription,
    path: &str,
    errors: &mut Vec<String>,
) {
    // 1. Resolve $ref if present
    if let Some(ref_name) = &prop_schema.schema_ref {
        validate_value(value, ref_name, doc, path, errors);
        return;
    }

    // 2. Type checking
    if let Some(expected_type) = &prop_schema.prop_type {
        let type_matches = match (expected_type.as_str(), value) {
            ("string", Value::String(_)) => true,
            ("integer", Value::Number(n)) => n.is_i64() || n.is_u64(),
            ("number", Value::Number(_)) => true,
            ("boolean", Value::Bool(_)) => true,
            ("array", Value::Array(_)) => true,
            ("object", Value::Object(_)) => true,
            ("any", _) => true,
            _ => false,
        };

        if !type_matches {
            errors.push(format!(
                "{path}: Expected type '{expected_type}', found {}",
                get_value_type(value)
            ));
            return; // Stop further validation for this property if the type is wrong
        }
    }

    // 3. Array items validation
    if prop_schema.prop_type.as_deref() == Some("array") {
        if let Some(items_schema) = &prop_schema.items {
            if let Value::Array(arr) = value {
                for (i, item) in arr.iter().enumerate() {
                    let item_path = format!("{path}[{i}]");
                    validate_property(item, items_schema, doc, &item_path, errors);
                }
            }
        }
    }

    // 4. Object properties validation
    if prop_schema.prop_type.as_deref() == Some("object") && !prop_schema.properties.is_empty() {
        if let Value::Object(obj) = value {
            validate_properties(obj, &prop_schema.properties, &[], doc, path, errors);
        }
    }

    // 5. Enum validation
    if let Some(enum_values) = &prop_schema.enum_values {
        if let Value::String(s) = value {
            if !enum_values.contains(s) {
                errors.push(format!(
                    "{path}: Value '{s}' is not a valid enum member. Valid options: {enum_values:?}"
                ));
            }
        }
    }
}

fn get_value_type(val: &Value) -> &'static str {
    match val {
        Value::Null => "null",
        Value::Bool(_) => "boolean",
        Value::Number(n) if n.is_f64() => "number (float)",
        Value::Number(_) => "integer",
        Value::String(_) => "string",
        Value::Array(_) => "array",
        Value::Object(_) => "object",
    }
}

/// Maps a MIME type to a file extension.
pub fn mime_to_extension(mime: &str) -> &str {
    if mime.contains("pdf") {
        "pdf"
    } else if mime.contains("png") {
        "png"
    } else if mime.contains("jpeg") || mime.contains("jpg") {
        "jpg"
    } else if mime.contains("gif") {
        "gif"
    } else if mime.contains("csv") {
        "csv"
    } else if mime.contains("zip") {
        "zip"
    } else if mime.contains("xml") {
        "xml"
    } else if mime.contains("html") {
        "html"
    } else if mime.contains("plain") {
        "txt"
    } else if mime.contains("octet-stream") {
        "bin"
    } else if mime.contains("spreadsheet") || mime.contains("xlsx") {
        "xlsx"
    } else if mime.contains("document") || mime.contains("docx") {
        "docx"
    } else if mime.contains("presentation") || mime.contains("pptx") {
        "pptx"
    } else if mime.contains("script") {
        "json"
    } else {
        "bin"
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::openapi::discovery::{
        JsonSchema, JsonSchemaProperty, MethodParameter, RestDescription, RestMethod,
    };
    use serde_json::json;

    // ---------------------------------------------------------------
    // Retry helpers (`x-fern-retries`)
    // ---------------------------------------------------------------

    fn enabled_cfg() -> RetriesConfig {
        RetriesConfig::default()
    }

    #[test]
    fn test_is_retryable_status_set_matches_docs() {
        // Matches fern TS SDK retryStatusCodes: recommended set:
        // 408 / 429 / 502 / 503 / 504.
        for s in [408u16, 429, 502, 503, 504] {
            assert!(is_retryable_status(s), "{s} should retry");
        }
        // 500 is deliberately NOT retried \u2014 see is_retryable_status
        // docstring. 425 (Too Early), 501 Not Implemented, and other
        // 5xx outside the recommended set are terminal. 4xx client
        // errors won't change on retry, so they're terminal too.
        for s in [200u16, 301, 400, 401, 403, 404, 422, 425, 500, 501, 505] {
            assert!(!is_retryable_status(s), "{s} should NOT retry");
        }
    }

    #[test]
    fn test_method_allows_retry_idempotent_methods() {
        // HTTP-spec-idempotent methods retry regardless of the
        // `x-fern-idempotent` extension.
        for m in ["GET", "HEAD", "OPTIONS", "DELETE", "PUT"] {
            assert!(method_allows_retry(m, false), "{m} should retry by default");
        }
    }

    #[test]
    fn test_method_allows_retry_non_idempotent_methods_only_when_marked() {
        // POST/PATCH only retry when the spec marks the op idempotent.
        for m in ["POST", "PATCH"] {
            assert!(!method_allows_retry(m, false), "{m} should NOT retry by default");
            assert!(method_allows_retry(m, true), "{m} retries when x-fern-idempotent");
        }
    }

    #[test]
    fn test_binary_body_is_stdin() {
        // Stdin sentinels — retries must be disabled.
        assert!(binary_body_is_stdin(Some("-")));
        assert!(binary_body_is_stdin(Some("@-")));
        // File paths — retries are safe (re-opens the file).
        assert!(!binary_body_is_stdin(Some("/tmp/audio.mp3")));
        assert!(!binary_body_is_stdin(Some("@/tmp/audio.mp3")));
        // No binary body at all — retries decided by other policy.
        assert!(!binary_body_is_stdin(None));
    }

    #[test]
    fn test_parse_retry_after_numeric_seconds() {
        let now = std::time::SystemTime::now();
        let d = parse_retry_after("5", now).expect("numeric form");
        assert_eq!(d, std::time::Duration::from_secs(5));
    }

    #[test]
    fn test_parse_retry_after_zero() {
        // `Retry-After: 0` means "retry now".
        let d = parse_retry_after("0", std::time::SystemTime::now()).unwrap();
        assert_eq!(d, std::time::Duration::ZERO);
    }

    #[test]
    fn test_parse_retry_after_whitespace_and_empty() {
        assert!(parse_retry_after("", std::time::SystemTime::now()).is_none());
        // Common server spelling has surrounding whitespace; we trim.
        let d = parse_retry_after("  10  ", std::time::SystemTime::now()).unwrap();
        assert_eq!(d, std::time::Duration::from_secs(10));
    }

    #[test]
    fn test_parse_retry_after_http_date_future() {
        // 60 seconds in the future expressed as IMF-fixdate.
        let now = std::time::SystemTime::now();
        let target = now + std::time::Duration::from_secs(60);
        let fmt = httpdate::fmt_http_date(target);
        let d = parse_retry_after(&fmt, now).expect("http-date form parses");
        // Allow slight skew because `fmt_http_date` rounds to seconds.
        assert!(d.as_secs() >= 59 && d.as_secs() <= 60, "got {d:?}");
    }

    #[test]
    fn test_parse_retry_after_http_date_in_the_past_clamps_to_zero() {
        // A server that emits a past timestamp \u2014 either clock-skew or
        // an unusual "you can retry now" gesture \u2014 should collapse to
        // an immediate retry rather than underflow.
        let now = std::time::SystemTime::now();
        let target = now - std::time::Duration::from_secs(60);
        let fmt = httpdate::fmt_http_date(target);
        let d = parse_retry_after(&fmt, now).expect("past http-date parses");
        assert_eq!(d, std::time::Duration::ZERO);
    }

    #[test]
    fn test_parse_retry_after_garbage_returns_none() {
        assert!(
            parse_retry_after("nonsense", std::time::SystemTime::now()).is_none(),
            "bad header surfaces None so the backoff fallback applies"
        );
    }

    #[test]
    fn test_compute_backoff_delay_no_jitter_is_deterministic() {
        let cfg = RetriesConfig {
            enabled: true,
            max_attempts: 5,
            base_delay_ms: 100,
            factor: 2.0,
            jitter: 0.0,
        };
        // attempt=0 \u2192 100ms; attempt=1 \u2192 200; attempt=2 \u2192 400; ...
        assert_eq!(
            compute_backoff_delay_with_rand(0, &cfg, 0.5),
            std::time::Duration::from_millis(100)
        );
        assert_eq!(
            compute_backoff_delay_with_rand(1, &cfg, 0.5),
            std::time::Duration::from_millis(200)
        );
        assert_eq!(
            compute_backoff_delay_with_rand(2, &cfg, 0.5),
            std::time::Duration::from_millis(400)
        );
        assert_eq!(
            compute_backoff_delay_with_rand(3, &cfg, 0.5),
            std::time::Duration::from_millis(800)
        );
    }

    #[test]
    fn test_compute_backoff_delay_jitter_symmetric_around_raw() {
        let cfg = RetriesConfig {
            enabled: true,
            max_attempts: 5,
            base_delay_ms: 100,
            factor: 2.0,
            jitter: 0.5,
        };
        // rand=0.5 \u2192 offset is zero \u2192 raw delay.
        assert_eq!(
            compute_backoff_delay_with_rand(0, &cfg, 0.5),
            std::time::Duration::from_millis(100)
        );
        // rand=0.0 \u2192 subtract half the jitter span.
        // span = 100 * 0.5 = 50; offset = (0 - 0.5) * 50 = -25 \u2192 75ms
        assert_eq!(
            compute_backoff_delay_with_rand(0, &cfg, 0.0),
            std::time::Duration::from_millis(75)
        );
        // rand=1.0 \u2192 add half the jitter span. offset = +25 \u2192 125ms
        assert_eq!(
            compute_backoff_delay_with_rand(0, &cfg, 1.0),
            std::time::Duration::from_millis(125)
        );
    }

    #[test]
    fn test_compute_backoff_delay_disabled_returns_zero() {
        let cfg = RetriesConfig::disabled();
        assert_eq!(
            compute_backoff_delay_with_rand(0, &cfg, 0.5),
            std::time::Duration::ZERO
        );
    }

    #[test]
    fn test_compute_backoff_delay_default_entropy_produces_jitter() {
        // Regression: an earlier implementation sampled entropy from
        // `Instant::now().elapsed()`, which always returns ~0 nanos and
        // pinned the jitter sample to a constant — defeating jitter.
        // Sample the live `compute_backoff_delay` 64 times with a wide
        // jitter band and assert we see at least two distinct values.
        let cfg = RetriesConfig {
            enabled: true,
            max_attempts: 3,
            base_delay_ms: 1000,
            factor: 1.0,
            jitter: 1.0,
        };
        let mut samples = std::collections::HashSet::new();
        for _ in 0..64 {
            samples.insert(compute_backoff_delay(0, &cfg).as_millis());
            // Tiny pause so the wall-clock sub-second component
            // advances between samples in fast CI environments.
            std::thread::sleep(std::time::Duration::from_micros(50));
        }
        assert!(
            samples.len() > 1,
            "expected variance in jitter samples, got {samples:?}",
        );
    }

    #[test]
    fn test_decide_retry_no_retry_flag_short_circuits() {
        // `--no-retry` is the user-facing debug opt-out. Mirrors the
        // PR description's open design question: yes, full opt-out
        // even for network errors so users can debug.
        let cfg = enabled_cfg();
        let outcome = RetryOutcome {
            status: None,
            retry_after: None,
        };
        let d = decide_retry(0, &outcome, &cfg, "GET", false, /*no_retry=*/ true);
        assert!(d.is_none(), "--no-retry disables all retries");
    }

    #[test]
    fn test_decide_retry_disabled_config_no_retry() {
        let cfg = RetriesConfig::disabled();
        let outcome = RetryOutcome {
            status: Some(503),
            retry_after: None,
        };
        let d = decide_retry(0, &outcome, &cfg, "GET", false, false);
        assert!(d.is_none(), "disabled config never retries");
    }

    #[test]
    fn test_decide_retry_max_attempts_cap() {
        let cfg = RetriesConfig {
            enabled: true,
            max_attempts: 3,
            base_delay_ms: 1,
            factor: 1.0,
            jitter: 0.0,
        };
        let outcome = RetryOutcome {
            status: Some(503),
            retry_after: None,
        };
        // attempt 0 -> retry (allowed)
        assert!(decide_retry(0, &outcome, &cfg, "GET", false, false).is_some());
        // attempt 1 -> retry (allowed)
        assert!(decide_retry(1, &outcome, &cfg, "GET", false, false).is_some());
        // attempt 2 -> done; we've used all 3 attempts. Stop.
        assert!(decide_retry(2, &outcome, &cfg, "GET", false, false).is_none());
        // attempt 3+ -> never. Defensive.
        assert!(decide_retry(3, &outcome, &cfg, "GET", false, false).is_none());
    }

    #[test]
    fn test_decide_retry_retryable_status_get_retries() {
        let cfg = enabled_cfg();
        let outcome = RetryOutcome {
            status: Some(503),
            retry_after: None,
        };
        let d = decide_retry(0, &outcome, &cfg, "GET", false, false);
        assert!(d.is_some());
    }

    #[test]
    fn test_decide_retry_non_retryable_status_no_retry() {
        // 401 Unauthorized never retries \u2014 wait won't make creds valid.
        let cfg = enabled_cfg();
        let outcome = RetryOutcome {
            status: Some(401),
            retry_after: None,
        };
        let d = decide_retry(0, &outcome, &cfg, "GET", false, false);
        assert!(d.is_none());
    }

    #[test]
    fn test_decide_retry_post_503_without_idempotent_no_retry() {
        // Plain POST got 503 \u2014 the server may have processed it.
        // Don't retry without an explicit idempotent marker.
        let cfg = enabled_cfg();
        let outcome = RetryOutcome {
            status: Some(503),
            retry_after: None,
        };
        let d = decide_retry(0, &outcome, &cfg, "POST", false, false);
        assert!(d.is_none());
    }

    #[test]
    fn test_decide_retry_post_503_with_idempotent_retries() {
        // POST marked idempotent (x-fern-idempotent) is safe to retry.
        let cfg = enabled_cfg();
        let outcome = RetryOutcome {
            status: Some(503),
            retry_after: None,
        };
        let d = decide_retry(0, &outcome, &cfg, "POST", true, false);
        assert!(d.is_some());
    }

    #[test]
    fn test_decide_retry_post_429_always_safe() {
        // 429 means the server *didn't* process the request \u2014 always
        // safe to retry regardless of method idempotency.
        let cfg = enabled_cfg();
        let outcome = RetryOutcome {
            status: Some(429),
            retry_after: None,
        };
        let d = decide_retry(0, &outcome, &cfg, "POST", false, false);
        assert!(d.is_some(), "429 retries on non-idempotent methods");
    }

    #[test]
    fn test_decide_retry_network_error_get_retries() {
        let cfg = enabled_cfg();
        let outcome = RetryOutcome {
            status: None,
            retry_after: None,
        };
        let d = decide_retry(0, &outcome, &cfg, "GET", false, false);
        assert!(d.is_some());
    }

    #[test]
    fn test_decide_retry_network_error_post_without_idempotent_no_retry() {
        // Network failure on a POST: ambiguous whether the server got
        // the request. Mirror the per-method policy here too.
        let cfg = enabled_cfg();
        let outcome = RetryOutcome {
            status: None,
            retry_after: None,
        };
        let d = decide_retry(0, &outcome, &cfg, "POST", false, false);
        assert!(d.is_none());
    }

    #[test]
    fn test_decide_retry_honors_retry_after_numeric() {
        // When the server provides Retry-After, honor it instead of
        // the computed backoff (the server knows better than we do).
        let cfg = enabled_cfg();
        let outcome = RetryOutcome {
            status: Some(503),
            retry_after: Some("7"),
        };
        let d = decide_retry(0, &outcome, &cfg, "GET", false, false)
            .expect("should retry");
        assert_eq!(d, std::time::Duration::from_secs(7));
    }

    #[test]
    fn test_decide_retry_falls_back_to_backoff_when_retry_after_invalid() {
        let cfg = enabled_cfg();
        let outcome = RetryOutcome {
            status: Some(503),
            retry_after: Some("not-a-number"),
        };
        let d = decide_retry(0, &outcome, &cfg, "GET", false, false)
            .expect("should retry");
        // Falls back to backoff math \u2014 not zero, not the parsed value.
        assert!(d > std::time::Duration::ZERO);
    }

    #[test]
    fn test_binary_body_source_plain_path() {
        match BinaryBodySource::parse("/tmp/audio.mp3") {
            BinaryBodySource::File(p) => assert_eq!(p, "/tmp/audio.mp3"),
            BinaryBodySource::Stdin => panic!("expected File"),
        }
    }

    #[test]
    fn test_binary_body_source_at_path_strips_prefix() {
        match BinaryBodySource::parse("@/tmp/audio.mp3") {
            BinaryBodySource::File(p) => assert_eq!(p, "/tmp/audio.mp3"),
            BinaryBodySource::Stdin => panic!("expected File"),
        }
    }

    #[test]
    fn test_binary_body_source_dash_is_stdin() {
        assert!(matches!(BinaryBodySource::parse("-"), BinaryBodySource::Stdin));
    }

    #[test]
    fn test_binary_body_source_at_dash_is_stdin() {
        // curl's spelling for stdin is `@-`; we accept it as an alias for `-`.
        assert!(matches!(BinaryBodySource::parse("@-"), BinaryBodySource::Stdin));
    }

    #[test]
    fn test_binary_body_source_double_at_is_literal_at_path() {
        // Only the first `@` is stripped — matches curl's behavior for filenames
        // that legitimately start with `@`.
        match BinaryBodySource::parse("@@weird-name.mp3") {
            BinaryBodySource::File(p) => assert_eq!(p, "@weird-name.mp3"),
            BinaryBodySource::Stdin => panic!("expected File"),
        }
    }

    #[test]
    fn test_header_params_not_in_query_string() {
        let mut parameters = std::collections::HashMap::new();
        parameters.insert(
            "user_id".to_string(),
            MethodParameter {
                location: Some("path".to_string()),
                required: true,
                ..Default::default()
            },
        );
        parameters.insert(
            "X-Custom-Header".to_string(),
            MethodParameter {
                location: Some("header".to_string()),
                ..Default::default()
            },
        );
        parameters.insert(
            "limit".to_string(),
            MethodParameter {
                location: Some("query".to_string()),
                ..Default::default()
            },
        );

        let method = RestMethod {
            http_method: "GET".to_string(),
            path: "users/{user_id}".to_string(),
            parameters,
            parameter_order: vec!["user_id".to_string()],
            ..Default::default()
        };

        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };

        let params_json =
            r#"{"user_id": "123", "X-Custom-Header": "my-value", "limit": "10"}"#;
        let input =
            parse_and_validate_inputs(&doc, &method, Some(params_json), None, false, None, &[]).unwrap();

        // Header param should be in header_params
        assert_eq!(input.header_params.len(), 1);
        assert_eq!(input.header_params[0].0, "X-Custom-Header");
        assert_eq!(input.header_params[0].1, "my-value");

        // Header param should NOT be in query_params
        assert!(
            !input
                .query_params
                .iter()
                .any(|(k, _)| k == "X-Custom-Header"),
            "Header param should not appear in query_params"
        );

        // Query param should still be in query_params
        assert!(
            input.query_params.iter().any(|(k, _)| k == "limit"),
            "Query param should appear in query_params"
        );
    }

    #[tokio::test]
    async fn test_header_params_sent_as_http_headers() {
        let client = reqwest::Client::new();
        let method = RestMethod {
            http_method: "GET".to_string(),
            path: "users".to_string(),
            ..Default::default()
        };
        let input = ExecutionInput {
            full_url: "https://example.com/users".to_string(),
            body: None,
            query_params: Vec::new(),
            header_params: vec![(
                "X-Custom-Header".to_string(),
                "header-value".to_string(),
            )],
            is_upload: false,
        };

        let request = build_http_request(
            &client,
            &method,
            &input,
            &crate::auth::no_auth_provider(),
            &EndpointAuthMetadata::unspecified(),
            &PageState::Cursor(None),
            0,
            &None,
            None,
            &PaginationConfig::default(),
        )
        .await
        .unwrap();

        let built = request.build().unwrap();
        assert_eq!(
            built
                .headers()
                .get("X-Custom-Header")
                .map(|v| v.to_str().unwrap()),
            Some("header-value"),
            "Header params should be sent as HTTP headers"
        );
        assert_eq!(
            built.headers().get("Accept").map(|v| v.to_str().unwrap()),
            Some("application/json"),
            "Default Accept prefers JSON for content negotiation"
        );
    }

    #[tokio::test]
    async fn test_default_accept_skipped_when_accept_in_params() {
        let client = reqwest::Client::new();
        let method = RestMethod {
            http_method: "GET".to_string(),
            path: "users".to_string(),
            ..Default::default()
        };
        let input = ExecutionInput {
            full_url: "https://example.com/users".to_string(),
            body: None,
            query_params: Vec::new(),
            header_params: vec![("Accept".to_string(), "application/xml".to_string())],
            is_upload: false,
        };

        let request = build_http_request(
            &client,
            &method,
            &input,
            &crate::auth::no_auth_provider(),
            &EndpointAuthMetadata::unspecified(),
            &PageState::Cursor(None),
            0,
            &None,
            None,
            &PaginationConfig::default(),
        )
        .await
        .unwrap();

        let built = request.build().unwrap();
        assert_eq!(
            built.headers().get("Accept").map(|v| v.to_str().unwrap()),
            Some("application/xml"),
            "Explicit Accept in header params should not be overridden"
        );
    }

    #[tokio::test]
    async fn test_explicit_anonymous_endpoint_skips_auth() {
        // `security: []` on an operation means "this endpoint is explicitly
        // unauthenticated" — the executor must not attach credentials even
        // when a credential-bearing provider is configured. Regression for
        // the leaf/Any/All path: only RoutingAuthProvider honored this
        // before; now the executor short-circuits universally.
        let client = reqwest::Client::new();
        let method = RestMethod {
            http_method: "GET".to_string(),
            path: "public/ping".to_string(),
            ..Default::default()
        };
        let input = ExecutionInput {
            full_url: "https://example.com/public/ping".to_string(),
            body: None,
            query_params: Vec::new(),
            header_params: Vec::new(),
            is_upload: false,
        };
        // A bare bearer leaf — would normally attach Authorization.
        let provider: crate::auth::DynAuthProvider = std::sync::Arc::new(
            crate::auth::BearerAuthProvider::new(
                "bearerAuth",
                crate::auth::AuthCredentialSource::literal("tok"),
            ),
        );

        let request = build_http_request(
            &client,
            &method,
            &input,
            &provider,
            &EndpointAuthMetadata::explicit_anonymous(),
            &PageState::Cursor(None),
            0,
            &None,
            None,
            &PaginationConfig::default(),
        )
        .await
        .unwrap();

        let built = request.build().unwrap();
        assert!(
            built.headers().get(reqwest::header::AUTHORIZATION).is_none(),
            "security: [] must opt out of auth even with a bearer provider"
        );
    }

    #[test]
    fn test_coerce_body_param_value_scalar_types() {
        // CLI flags arrive as Value::String; coerce them per the schema's type.
        assert_eq!(
            coerce_body_param_value(&Value::String("42".into()), Some("integer")).unwrap(),
            json!(42)
        );
        assert_eq!(
            coerce_body_param_value(&Value::String("2.5".into()), Some("number")).unwrap(),
            json!(2.5)
        );
        assert_eq!(
            coerce_body_param_value(&Value::String("true".into()), Some("boolean")).unwrap(),
            Value::Bool(true)
        );
        assert_eq!(
            coerce_body_param_value(&Value::String("false".into()), Some("boolean")).unwrap(),
            Value::Bool(false)
        );
        // String type passes through unchanged.
        assert_eq!(
            coerce_body_param_value(&Value::String("hello".into()), Some("string")).unwrap(),
            json!("hello")
        );
        // Already-typed values from `--params` JSON pass through.
        assert_eq!(
            coerce_body_param_value(&json!(99), Some("integer")).unwrap(),
            json!(99)
        );
    }

    #[test]
    fn test_coerce_body_param_value_nested_decodes_json() {
        // Object/array body fields accept a JSON string from the CLI flag.
        let arr = coerce_body_param_value(
            &Value::String(r#"["a","b"]"#.into()),
            Some("array"),
        )
        .unwrap();
        assert_eq!(arr, json!(["a", "b"]));

        let obj = coerce_body_param_value(
            &Value::String(r#"{"city":"SF"}"#.into()),
            Some("object"),
        )
        .unwrap();
        assert_eq!(obj, json!({ "city": "SF" }));
    }

    #[test]
    fn test_coerce_body_param_value_rejects_bad_input() {
        let err = coerce_body_param_value(
            &Value::String("not-an-int".into()),
            Some("integer"),
        )
        .unwrap_err();
        match err {
            CliError::Validation(msg) => assert!(msg.contains("Invalid integer")),
            _ => panic!("Expected Validation error"),
        }

        let err = coerce_body_param_value(
            &Value::String("yes".into()),
            Some("boolean"),
        )
        .unwrap_err();
        match err {
            CliError::Validation(msg) => assert!(msg.contains("Invalid boolean")),
            _ => panic!("Expected Validation error"),
        }
    }

    #[test]
    fn test_body_params_merge_into_body_via_params_json() {
        // `--params` is the JSON-blob fallback that mirrors per-flag values;
        // body-located params should land in the JSON body, not the query string.
        let mut parameters = std::collections::HashMap::new();
        parameters.insert(
            "name".to_string(),
            MethodParameter {
                location: Some("body".to_string()),
                param_type: Some("string".to_string()),
                ..Default::default()
            },
        );
        parameters.insert(
            "count".to_string(),
            MethodParameter {
                location: Some("body".to_string()),
                param_type: Some("integer".to_string()),
                ..Default::default()
            },
        );

        let method = RestMethod {
            http_method: "POST".to_string(),
            path: "things".to_string(),
            parameters,
            ..Default::default()
        };
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };

        let params_json = r#"{"name": "Acme", "count": "3"}"#;
        let input = parse_and_validate_inputs(&doc, &method, Some(params_json), None, false, None, &[])
            .unwrap();

        // Body must contain both fields, with `count` coerced to a JSON integer.
        let body = input.body.expect("body should be populated from body params");
        assert_eq!(body, json!({ "name": "Acme", "count": 3 }));

        // Body fields must NOT bleed into the query string or headers.
        assert!(input.query_params.is_empty(), "no query params expected");
        assert!(input.header_params.is_empty(), "no header params expected");
    }

    #[test]
    fn test_json_flag_overrides_body_field_flags() {
        // When both per-field flags AND `--json` are set, `--json` wins on
        // overlapping keys (mirrors `--params` overriding individual flags).
        let mut parameters = std::collections::HashMap::new();
        parameters.insert(
            "name".to_string(),
            MethodParameter {
                location: Some("body".to_string()),
                param_type: Some("string".to_string()),
                ..Default::default()
            },
        );
        parameters.insert(
            "description".to_string(),
            MethodParameter {
                location: Some("body".to_string()),
                param_type: Some("string".to_string()),
                ..Default::default()
            },
        );

        let method = RestMethod {
            http_method: "POST".to_string(),
            path: "things".to_string(),
            parameters,
            ..Default::default()
        };
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };

        let params_json = r#"{"name": "from-flag", "description": "kept-from-flag"}"#;
        let body_json = r#"{"name": "from-json"}"#;
        let input = parse_and_validate_inputs(
            &doc,
            &method,
            Some(params_json),
            Some(body_json),
            false,
            None,
            &[],
        )
        .unwrap();

        let body = input.body.expect("body should be populated");
        assert_eq!(
            body,
            json!({ "name": "from-json", "description": "kept-from-flag" }),
            "--json overrides overlapping per-field values, leaves the rest alone"
        );
    }

    #[test]
    fn test_required_body_field_missing_mentions_flag_json_and_params() {
        // A required body field that isn't supplied at all should produce a
        // validation error that names the per-field flag, --json, and
        // --params, so the user knows every way to fix it. The previous
        // message only mentioned --params, which was misleading once
        // per-field body flags shipped.
        let mut parameters = std::collections::HashMap::new();
        parameters.insert(
            "name".to_string(),
            MethodParameter {
                location: Some("body".to_string()),
                param_type: Some("string".to_string()),
                required: true,
                ..Default::default()
            },
        );

        let method = RestMethod {
            http_method: "POST".to_string(),
            path: "things".to_string(),
            parameters,
            ..Default::default()
        };
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };

        let err = parse_and_validate_inputs(&doc, &method, None, None, false, None, &[])
            .unwrap_err();
        match err {
            CliError::Validation(msg) => {
                assert!(msg.contains("'name'"), "error names the missing field: {msg}");
                assert!(msg.contains("--name"), "error names the per-field flag: {msg}");
                assert!(msg.contains("--json"), "error names --json for body fields: {msg}");
                assert!(msg.contains("--params"), "error names --params: {msg}");
            }
            other => panic!("expected Validation error, got {other:?}"),
        }
    }

    #[test]
    fn test_required_param_missing_uses_flag_name_override() {
        // When a parameter has `flag_name_override` set (e.g. synthetic
        // idempotency-key flags inject the wire name verbatim), the error
        // message must suggest THAT flag — not a kebab of the wire name.
        // Otherwise the suggestion points at a flag the user can't pass.
        let mut parameters = std::collections::HashMap::new();
        parameters.insert(
            "Idempotency-Key".to_string(),
            MethodParameter {
                location: Some("header".to_string()),
                param_type: Some("string".to_string()),
                required: true,
                flag_name_override: Some("idempotency-key".to_string()),
                ..Default::default()
            },
        );

        let method = RestMethod {
            http_method: "POST".to_string(),
            path: "things".to_string(),
            parameters,
            ..Default::default()
        };
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };

        let err = parse_and_validate_inputs(&doc, &method, None, None, false, None, &[])
            .unwrap_err();
        match err {
            CliError::Validation(msg) => {
                assert!(
                    msg.contains("--idempotency-key"),
                    "error must point at the actual flag name from flag_name_override: {msg}"
                );
            }
            other => panic!("expected Validation error, got {other:?}"),
        }
    }

    #[test]
    fn test_non_object_json_replaces_body_and_drops_per_field_flags() {
        // A top-level non-object `--json` (array/scalar) has no shape to
        // merge per-field flag values into, so flags are dropped and the
        // `--json` payload is used wholesale. Lock in that behavior so
        // future refactors of the body-assembly match don't accidentally
        // start emitting nonsense (e.g. wrapping the array in an object
        // with the flag values).
        let mut parameters = std::collections::HashMap::new();
        parameters.insert(
            "name".to_string(),
            MethodParameter {
                location: Some("body".to_string()),
                param_type: Some("string".to_string()),
                ..Default::default()
            },
        );

        let method = RestMethod {
            http_method: "POST".to_string(),
            path: "things".to_string(),
            parameters,
            ..Default::default()
        };
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };

        // `--name` is supplied via params; `--json` is a bare array.
        let params_json = r#"{"name": "from-flag-loses"}"#;
        let body_json = r#"[1, 2, 3]"#;
        let input = parse_and_validate_inputs(
            &doc,
            &method,
            Some(params_json),
            Some(body_json),
            false,
            None,
            &[],
        )
        .unwrap();

        let body = input.body.expect("body should be populated");
        assert_eq!(
            body,
            json!([1, 2, 3]),
            "non-object --json must replace the body wholesale, not be merged"
        );
    }

    #[test]
    fn test_required_non_body_param_missing_omits_json_hint() {
        // The --json hint is body-specific. A missing required query/path/
        // header param should NOT suggest --json — it would mislead the
        // user into thinking the body matters here.
        let mut parameters = std::collections::HashMap::new();
        parameters.insert(
            "limit".to_string(),
            MethodParameter {
                location: Some("query".to_string()),
                param_type: Some("integer".to_string()),
                required: true,
                ..Default::default()
            },
        );

        let method = RestMethod {
            http_method: "GET".to_string(),
            path: "things".to_string(),
            parameters,
            ..Default::default()
        };
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };

        let err = parse_and_validate_inputs(&doc, &method, None, None, false, None, &[])
            .unwrap_err();
        match err {
            CliError::Validation(msg) => {
                assert!(msg.contains("--limit"), "error names the per-field flag: {msg}");
                assert!(msg.contains("--params"), "error names --params: {msg}");
                assert!(!msg.contains("--json"), "non-body error should not mention --json: {msg}");
            }
            other => panic!("expected Validation error, got {other:?}"),
        }
    }

    #[test]
    fn test_per_field_body_flags_path_runs_schema_validation() {
        // Schema validation must run regardless of whether the body was
        // built from --json or from per-field flags. The previous version
        // only validated on the --json path, letting flag-only bodies skip
        // schema checks even though clap-typed strings are more likely to
        // produce shape mismatches than hand-written JSON.
        let mut parameters = std::collections::HashMap::new();
        parameters.insert(
            "name".to_string(),
            MethodParameter {
                location: Some("body".to_string()),
                param_type: Some("string".to_string()),
                ..Default::default()
            },
        );

        // Schema declares `name` as an integer — a string value from the
        // per-field flag should be rejected by the schema validator.
        let mut schema_props = std::collections::HashMap::new();
        schema_props.insert(
            "name".to_string(),
            crate::openapi::discovery::JsonSchemaProperty {
                prop_type: Some("integer".to_string()),
                ..Default::default()
            },
        );
        let mut schemas = std::collections::HashMap::new();
        schemas.insert(
            "ThingRequest".to_string(),
            crate::openapi::discovery::JsonSchema {
                schema_type: Some("object".to_string()),
                properties: schema_props,
                ..Default::default()
            },
        );

        let method = RestMethod {
            http_method: "POST".to_string(),
            path: "things".to_string(),
            parameters,
            request: Some(crate::openapi::discovery::SchemaRef {
                schema_ref: Some("ThingRequest".to_string()),
                ..Default::default()
            }),
            ..Default::default()
        };
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            schemas,
            ..Default::default()
        };

        let params_json = r#"{"name": "not-an-integer"}"#;
        let err = parse_and_validate_inputs(&doc, &method, Some(params_json), None, false, None, &[])
            .unwrap_err();
        match err {
            CliError::Validation(msg) => {
                assert!(
                    msg.contains("schema validation"),
                    "schema validator should fire on flag-only body: {msg}"
                );
            }
            other => panic!("expected Validation error, got {other:?}"),
        }
    }

    #[test]
    fn test_pagination_config_default() {
        let config = PaginationConfig::default();
        assert!(!config.page_all);
        assert_eq!(config.page_limit, 10);
        assert_eq!(config.page_delay_ms, 100);
    }

    #[test]
    fn test_mime_to_extension_more_types() {
        assert_eq!(mime_to_extension("text/plain"), "txt");
        assert_eq!(mime_to_extension("text/csv"), "csv");
        assert_eq!(mime_to_extension("application/zip"), "zip");
        assert_eq!(mime_to_extension("application/xml"), "xml");
        assert_eq!(mime_to_extension("text/html"), "html");
        assert_eq!(mime_to_extension("application/json"), "bin"); // Default for unknown specific json types if not scripts
        assert_eq!(
            mime_to_extension("application/vnd.google-apps.script"),
            "json"
        );
        assert_eq!(
            mime_to_extension("application/vnd.google-apps.presentation"),
            "pptx"
        );
    }

    #[test]
    fn test_validate_body_valid() {
        let mut properties = HashMap::new();
        properties.insert(
            "name".to_string(),
            JsonSchemaProperty {
                prop_type: Some("string".to_string()),
                ..Default::default()
            },
        );

        let mut schemas = HashMap::new();
        schemas.insert(
            "File".to_string(),
            JsonSchema {
                properties,
                ..Default::default()
            },
        );

        let doc = RestDescription {
            schemas,
            ..Default::default()
        };

        let body = json!({ "name": "My File" });
        assert!(validate_body_against_schema(&body, "File", &doc).is_ok());
    }

    #[test]
    fn test_validate_body_open_schema_allows_any_properties() {
        // A schema with type=object but no properties defined is an open schema:
        // any properties are allowed (JSON Schema default).
        let schemas = HashMap::from([(
            "Body".to_string(),
            JsonSchema {
                schema_type: Some("object".to_string()),
                properties: HashMap::new(),
                ..Default::default()
            },
        )]);
        let doc = RestDescription { schemas, ..Default::default() };
        let body = json!({ "name": "foo", "count": 3, "nested": {"x": 1} });
        assert!(
            validate_body_against_schema(&body, "Body", &doc).is_ok(),
            "open object schema should accept any properties"
        );
    }

    #[test]
    fn test_validate_body_unknown_field() {
        let mut properties = HashMap::new();
        properties.insert(
            "name".to_string(),
            JsonSchemaProperty {
                prop_type: Some("string".to_string()),
                ..Default::default()
            },
        );

        let mut schemas = HashMap::new();
        schemas.insert(
            "File".to_string(),
            JsonSchema {
                schema_type: Some("object".to_string()),
                properties,
                ..Default::default()
            },
        );

        let doc = RestDescription {
            schemas,
            ..Default::default()
        };

        let body = json!({ "name": "My File", "invalidField": 123 });
        let result = validate_body_against_schema(&body, "File", &doc);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Unknown property"));
    }

    #[test]
    fn test_validate_body_deep_validation() {
        let mut properties = HashMap::new();
        properties.insert(
            "name".to_string(),
            JsonSchemaProperty {
                prop_type: Some("string".to_string()),
                ..Default::default()
            },
        );
        properties.insert(
            "status".to_string(),
            JsonSchemaProperty {
                prop_type: Some("string".to_string()),
                enum_values: Some(vec!["ACTIVE".to_string(), "INACTIVE".to_string()]),
                ..Default::default()
            },
        );
        properties.insert(
            "count".to_string(),
            JsonSchemaProperty {
                prop_type: Some("integer".to_string()),
                ..Default::default()
            },
        );
        properties.insert(
            "tags".to_string(),
            JsonSchemaProperty {
                prop_type: Some("array".to_string()),
                items: Some(Box::new(JsonSchemaProperty {
                    prop_type: Some("string".to_string()),
                    ..Default::default()
                })),
                ..Default::default()
            },
        );
        properties.insert(
            "parent".to_string(),
            JsonSchemaProperty {
                schema_ref: Some("Parent".to_string()),
                ..Default::default()
            },
        );

        let mut parent_props = HashMap::new();
        parent_props.insert(
            "id".to_string(),
            JsonSchemaProperty {
                prop_type: Some("string".to_string()),
                ..Default::default()
            },
        );

        let mut schemas = HashMap::new();
        schemas.insert(
            "File".to_string(),
            JsonSchema {
                schema_type: Some("object".to_string()),
                required: vec!["name".to_string(), "status".to_string()],
                properties,
                ..Default::default()
            },
        );
        schemas.insert(
            "Parent".to_string(),
            JsonSchema {
                schema_type: Some("object".to_string()),
                properties: parent_props,
                ..Default::default()
            },
        );

        let doc = RestDescription {
            schemas,
            ..Default::default()
        };

        // Valid Request
        let body = json!({
            "name": "My File",
            "status": "ACTIVE",
            "count": 10,
            "tags": ["one", "two"],
            "parent": { "id": "123" }
        });
        assert!(validate_body_against_schema(&body, "File", &doc).is_ok());

        // Missing Required Field
        let body_missing = json!({ "name": "My File" });
        let err = validate_body_against_schema(&body_missing, "File", &doc).unwrap_err();
        assert!(err
            .to_string()
            .contains("Missing required property 'status'"));

        // Invalid Enum Value
        let body_bad_enum = json!({ "name": "My File", "status": "UNKNOWN" });
        let err = validate_body_against_schema(&body_bad_enum, "File", &doc).unwrap_err();
        assert!(err.to_string().contains("not a valid enum member"));

        // Invalid Type
        let body_bad_type = json!({ "name": "My File", "status": "ACTIVE", "count": "10" });
        let err = validate_body_against_schema(&body_bad_type, "File", &doc).unwrap_err();
        assert!(err
            .to_string()
            .contains("Expected type 'integer', found string"));

        // Deep Schema Reference Validation Failure
        let body_bad_ref = json!({
            "name": "My File",
            "status": "ACTIVE",
            "parent": { "invalidField": "123" }
        });
        let err = validate_body_against_schema(&body_bad_ref, "File", &doc).unwrap_err();
        assert!(err.to_string().contains("Unknown property"));

        // Expected Object Type Failure
        let body_not_object = json!([]);
        let err = validate_body_against_schema(&body_not_object, "File", &doc).unwrap_err();
        assert!(err.to_string().contains("Expected object"));
    }
    #[tokio::test]
    async fn test_build_multipart_body() {
        let metadata = Some(json!({ "name": "test.txt", "mimeType": "text/plain" }));
        let content = b"Hello world";

        let (body, content_type) = build_multipart_body(&metadata, content, "text/plain").unwrap();

        // Check content type has boundary
        assert!(content_type.starts_with("multipart/related; boundary="));
        let boundary = content_type.split("boundary=").nth(1).unwrap();

        let body_str = String::from_utf8(body).unwrap();

        // Verify structure
        assert!(body_str.contains(boundary));
        assert!(body_str.contains("Content-Type: application/json"));
        assert!(body_str.contains("{\"mimeType\":\"text/plain\",\"name\":\"test.txt\"}"));
        assert!(body_str.contains("Content-Type: text/plain"));
        assert!(body_str.contains("Hello world"));
    }

    #[tokio::test]
    async fn test_build_multipart_body_no_metadata() {
        let metadata = None;
        let content = b"Binary data";

        let (body, content_type) =
            build_multipart_body(&metadata, content, "application/octet-stream").unwrap();
        let boundary = content_type.split("boundary=").nth(1).unwrap();
        let body_str = String::from_utf8(body).unwrap();

        assert!(body_str.contains(boundary));
        assert!(body_str.contains("application/octet-stream"));
        assert!(body_str.contains("Binary data"));
    }

    #[test]
    fn test_resolve_upload_mime_explicit_flag() {
        let metadata = Some(json!({ "mimeType": "image/png" }));
        let mime = resolve_upload_mime(Some("text/markdown"), Some("file.txt"), &metadata);
        assert_eq!(mime, "text/markdown", "explicit flag takes top priority");
    }

    #[test]
    fn test_resolve_upload_mime_extension_beats_metadata() {
        let metadata = Some(json!({ "mimeType": "application/vnd.google-apps.document" }));
        let mime = resolve_upload_mime(None, Some("notes.md"), &metadata);
        assert_eq!(
            mime, "text/markdown",
            "extension inference ranks above metadata mimeType"
        );
    }

    #[test]
    fn test_resolve_upload_mime_metadata_fallback_for_unknown_extension() {
        let metadata = Some(json!({ "mimeType": "text/plain" }));
        let mime = resolve_upload_mime(None, Some("file.unknown"), &metadata);
        assert_eq!(
            mime, "text/plain",
            "metadata mimeType is used when extension is unrecognized"
        );
    }

    #[test]
    fn test_resolve_upload_mime_extension_when_no_metadata() {
        let mime = resolve_upload_mime(None, Some("notes.md"), &None);
        assert_eq!(mime, "text/markdown");

        let mime = resolve_upload_mime(None, Some("page.html"), &None);
        assert_eq!(mime, "text/html");

        let mime = resolve_upload_mime(None, Some("data.csv"), &None);
        assert_eq!(mime, "text/csv");
    }

    #[test]
    fn test_resolve_upload_mime_fallback() {
        let mime = resolve_upload_mime(None, Some("file.unknown"), &None);
        assert_eq!(mime, "application/octet-stream");
    }

    #[test]
    fn test_resolve_upload_mime_explicit_enables_import_conversion() {
        let metadata = Some(json!({ "mimeType": "application/vnd.google-apps.document" }));
        let mime = resolve_upload_mime(Some("text/markdown"), Some("impact.md"), &metadata);
        assert_eq!(
            mime, "text/markdown",
            "--upload-content-type overrides metadata for media part"
        );
    }

    #[test]
    fn test_build_multipart_bytes_with_metadata() {
        let metadata = Some(json!({ "threadId": "thread-123" }));
        let data = b"From: test@example.com\r\nSubject: Test\r\n\r\nBody";
        let (_, content_type, content_length) =
            build_multipart_bytes(&metadata, data, "message/rfc822").unwrap();

        assert!(
            content_type.starts_with("multipart/related; boundary=fern_boundary_"),
            "content_type should be multipart/related: {content_type}",
        );
        // Content-length should cover: preamble + data + postamble
        assert!(
            content_length > data.len() as u64,
            "content_length should exceed raw data size: {content_length}",
        );
    }

    #[test]
    fn test_build_multipart_bytes_without_metadata() {
        let (_, content_type, content_length) =
            build_multipart_bytes(&None, b"test body", "message/rfc822").unwrap();

        assert!(content_type.starts_with("multipart/related; boundary="));
        assert!(content_length > 0);
    }

    #[tokio::test]
    async fn test_build_multipart_stream_content_length() {
        let dir = tempfile::tempdir().unwrap();
        let file_path = dir.path().join("small.txt");
        let file_content = b"Hello stream";
        std::fs::write(&file_path, file_content).unwrap();

        let metadata_value = json!({ "name": "small.txt" });
        let metadata = Some(metadata_value.clone());
        let file_size = file_content.len() as u64;

        let (_body, content_type, declared_len) = build_multipart_stream(
            &metadata,
            file_path.to_str().unwrap(),
            file_size,
            "text/plain",
        )
        .unwrap();

        assert!(content_type.starts_with("multipart/related; boundary="));
        let boundary = content_type.split("boundary=").nth(1).unwrap();

        // Manually compute expected content length:
        // preamble = "--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{json}\r\n--{boundary}\r\nContent-Type: text/plain\r\n\r\n"
        // postamble = "\r\n--{boundary}--\r\n"
        let metadata_json = serde_json::to_string(&metadata_value).unwrap();
        let preamble = format!(
            "--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{metadata_json}\r\n\
             --{boundary}\r\nContent-Type: text/plain\r\n\r\n"
        );
        let postamble = format!("\r\n--{boundary}--\r\n");
        let expected = preamble.len() as u64 + file_size + postamble.len() as u64;
        assert_eq!(
            declared_len, expected,
            "declared Content-Length must match expected preamble + file + postamble"
        );
    }

    #[tokio::test]
    async fn test_build_multipart_stream_large_file() {
        let dir = tempfile::tempdir().unwrap();
        let file_path = dir.path().join("large.bin");
        // 256 KB — larger than the default 64 KB ReaderStream chunk size
        let data = vec![0xABu8; 256 * 1024];
        std::fs::write(&file_path, &data).unwrap();

        let metadata = None;
        let file_size = data.len() as u64;

        let (_body, _content_type, declared_len) = build_multipart_stream(
            &metadata,
            file_path.to_str().unwrap(),
            file_size,
            "application/octet-stream",
        )
        .unwrap();

        // Content-Length must account for the empty-metadata preamble + large file + postamble
        assert!(
            declared_len > file_size,
            "Content-Length ({declared_len}) must be larger than file size ({file_size}) due to multipart framing"
        );

        // Verify exact arithmetic: preamble overhead + file_size + postamble
        let boundary = _content_type.split("boundary=").nth(1).unwrap();
        let preamble = format!(
            "--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{{}}\r\n\
             --{boundary}\r\nContent-Type: application/octet-stream\r\n\r\n"
        );
        let postamble = format!("\r\n--{boundary}--\r\n");
        let expected = preamble.len() as u64 + file_size + postamble.len() as u64;
        assert_eq!(
            declared_len, expected,
            "Content-Length must match for multi-chunk files"
        );
    }

    #[test]
    fn test_build_url_basic() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        let method = RestMethod {
            path: "files".to_string(),
            flat_path: Some("files".to_string()),
            ..Default::default()
        };
        let params = Map::new();

        let (url, _) = build_url(&doc, &method, &params, false, None).unwrap();
        assert_eq!(url, "https://api.example.com/files");
    }

    #[test]
    fn test_build_url_override_replaces_spec_base() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        // Use a leading-slash path matching real OpenAPI spec output
        let method = RestMethod {
            path: "/files".to_string(),
            flat_path: Some("/files".to_string()),
            ..Default::default()
        };
        let params = Map::new();

        let (url, _) = build_url(&doc, &method, &params, false, Some("http://localhost:9000")).unwrap();
        assert_eq!(url, "http://localhost:9000/files");
    }

    #[test]
    fn test_build_url_override_trailing_slash_normalized() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        // Use a leading-slash path matching real OpenAPI spec output
        let method = RestMethod {
            path: "/users/me".to_string(),
            flat_path: Some("/users/me".to_string()),
            ..Default::default()
        };
        let params = Map::new();

        // With trailing slash on override
        let (url_with, _) = build_url(&doc, &method, &params, false, Some("http://localhost:9000/")).unwrap();
        // Without trailing slash on override
        let (url_without, _) = build_url(&doc, &method, &params, false, Some("http://localhost:9000")).unwrap();
        assert_eq!(url_with, url_without);
        assert_eq!(url_with, "http://localhost:9000/users/me");
    }

    #[test]
    fn test_build_url_override_no_double_slash_with_leading_slash_path() {
        // Regression test: OpenAPI paths start with /, override must not produce //
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        let method = RestMethod {
            path: "/users/me".to_string(),
            flat_path: Some("/users/me".to_string()),
            ..Default::default()
        };
        let params = Map::new();

        let (url, _) = build_url(&doc, &method, &params, false, Some("http://localhost:9000")).unwrap();
        assert_eq!(url, "http://localhost:9000/users/me");
    }

    // -----------------------------------------------------------------------
    // x-fern-base-path
    //
    // Exhaustive 2x2 matrix over the spec's `x-fern-base-path` value
    // (with/without leading slash) and the base URL's trailing slash. The
    // wire tests in tests/openapi_fixture_wire.rs exercise the same matrix
    // end-to-end through the HTTP stack.
    // -----------------------------------------------------------------------

    fn base_path_doc(base_path: &str) -> RestDescription {
        RestDescription {
            base_path: Some(base_path.to_string()),
            ..Default::default()
        }
    }

    fn things_method() -> RestMethod {
        RestMethod {
            path: "/things".to_string(),
            flat_path: Some("/things".to_string()),
            ..Default::default()
        }
    }

    #[test]
    fn test_build_url_base_path_leading_slash_x_server_trailing_slash() {
        let doc = base_path_doc("/v1");
        let method = things_method();
        let (url, _) = build_url(
            &doc,
            &method,
            &Map::new(),
            false,
            Some("http://server.example/"),
        )
        .unwrap();
        assert_eq!(url, "http://server.example/v1/things");
    }

    #[test]
    fn test_build_url_base_path_leading_slash_x_server_no_trailing_slash() {
        let doc = base_path_doc("/v1");
        let method = things_method();
        let (url, _) = build_url(
            &doc,
            &method,
            &Map::new(),
            false,
            Some("http://server.example"),
        )
        .unwrap();
        assert_eq!(url, "http://server.example/v1/things");
    }

    #[test]
    fn test_build_url_base_path_no_leading_slash_x_server_trailing_slash() {
        let doc = base_path_doc("v1");
        let method = things_method();
        let (url, _) = build_url(
            &doc,
            &method,
            &Map::new(),
            false,
            Some("http://server.example/"),
        )
        .unwrap();
        assert_eq!(url, "http://server.example/v1/things");
    }

    #[test]
    fn test_build_url_base_path_no_leading_slash_x_server_no_trailing_slash() {
        let doc = base_path_doc("v1");
        let method = things_method();
        let (url, _) = build_url(
            &doc,
            &method,
            &Map::new(),
            false,
            Some("http://server.example"),
        )
        .unwrap();
        assert_eq!(url, "http://server.example/v1/things");
    }

    #[test]
    fn test_build_url_base_path_applies_to_spec_root_url() {
        // No base_url override, no doc.base_url — base_path applies on top
        // of the effective root_url (which is what OpenAPI's `servers[0].url`
        // becomes after parsing).
        let doc = RestDescription {
            root_url: "https://api.example.com".to_string(),
            base_path: Some("/api/public".to_string()),
            ..Default::default()
        };
        let method = things_method();
        let (url, _) = build_url(&doc, &method, &Map::new(), false, None).unwrap();
        assert_eq!(url, "https://api.example.com/api/public/things");
    }

    #[test]
    fn test_build_url_base_path_composes_with_per_operation_server() {
        // Per-operation `servers[]` override is captured in `method.root_url`
        // by the parser. `effective_root_url` returns it (taking precedence
        // over the spec-level `doc.root_url`), and `apply_base_path` then
        // prepends the base path on top of the per-op server. This test
        // pins that composition — without it, a per-op upload-host override
        // would silently lose the base path prefix.
        let doc = RestDescription {
            root_url: "https://api.example.com".to_string(),
            base_path: Some("/v1".to_string()),
            ..Default::default()
        };
        let method = RestMethod {
            path: "/uploads".to_string(),
            flat_path: Some("/uploads".to_string()),
            root_url: "https://upload.example.com".to_string(),
            ..Default::default()
        };
        let (url, _) = build_url(&doc, &method, &Map::new(), false, None).unwrap();
        assert_eq!(url, "https://upload.example.com/v1/uploads");
    }

    #[test]
    fn test_build_url_base_path_per_op_server_with_trailing_slash() {
        // Same composition as the test above, but the per-op server URL
        // carries a trailing slash — the slash-edge normalization runs at
        // the per-op + base_path boundary too, not just at the doc.root_url
        // + base_path boundary.
        let doc = RestDescription {
            root_url: "https://api.example.com".to_string(),
            base_path: Some("v1".to_string()),
            ..Default::default()
        };
        let method = RestMethod {
            path: "/uploads".to_string(),
            flat_path: Some("/uploads".to_string()),
            root_url: "https://upload.example.com/".to_string(),
            ..Default::default()
        };
        let (url, _) = build_url(&doc, &method, &Map::new(), false, None).unwrap();
        assert_eq!(url, "https://upload.example.com/v1/uploads");
    }

    #[test]
    fn test_build_url_base_path_applies_to_doc_base_url() {
        // doc.base_url (set when the spec's server includes a path
        // component) is also augmented by base_path.
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            base_path: Some("/v1".to_string()),
            ..Default::default()
        };
        let method = things_method();
        let (url, _) = build_url(&doc, &method, &Map::new(), false, None).unwrap();
        assert_eq!(url, "https://api.example.com/v1/things");
    }

    #[test]
    fn test_build_url_base_path_with_trailing_slash_normalized() {
        // Authoring quirk: `x-fern-base-path: /v1/` should not produce
        // double slashes against the operation path.
        let doc = base_path_doc("/v1/");
        let method = things_method();
        let (url, _) = build_url(
            &doc,
            &method,
            &Map::new(),
            false,
            Some("http://server.example"),
        )
        .unwrap();
        assert_eq!(url, "http://server.example/v1/things");
    }

    #[test]
    fn test_build_url_base_path_multi_segment() {
        // Multi-segment base paths (e.g. `/api/v1`) are emitted verbatim;
        // only the boundary slashes against the server URL and operation
        // path are normalized.
        let doc = base_path_doc("/api/v1");
        let method = things_method();
        let (url, _) = build_url(
            &doc,
            &method,
            &Map::new(),
            false,
            Some("http://server.example"),
        )
        .unwrap();
        assert_eq!(url, "http://server.example/api/v1/things");
    }

    #[test]
    fn test_build_url_base_path_none_unchanged() {
        // When `base_path` is None the URL is identical to the pre-feature
        // behavior — this protects existing specs that don't use the
        // extension from any drift.
        let doc = RestDescription {
            base_path: None,
            ..Default::default()
        };
        let method = things_method();
        let (url, _) = build_url(
            &doc,
            &method,
            &Map::new(),
            false,
            Some("http://server.example"),
        )
        .unwrap();
        assert_eq!(url, "http://server.example/things");
    }

    #[test]
    fn test_build_url_base_path_preserves_path_substitution() {
        // Path parameter substitution still happens against the operation
        // path after base_path is prepended.
        let doc = base_path_doc("/v1");
        let method = RestMethod {
            path: "/things/{thingId}".to_string(),
            flat_path: Some("/things/{thingId}".to_string()),
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("thingId".to_string(), json!("abc"));
        let (url, _) = build_url(
            &doc,
            &method,
            &params,
            false,
            Some("http://server.example"),
        )
        .unwrap();
        assert_eq!(url, "http://server.example/v1/things/abc");
    }

    #[test]
    fn test_apply_base_path_helper_handles_edge_cases() {
        // None → base returned verbatim.
        assert_eq!(apply_base_path("http://x", None), "http://x");
        assert_eq!(apply_base_path("http://x/", None), "http://x/");

        // Empty / slash-only base_path is a no-op — the helper returns
        // the base verbatim and leaves trailing-slash normalization to
        // build_url's existing operation-path joining logic.
        assert_eq!(apply_base_path("http://x", Some("")), "http://x");
        assert_eq!(apply_base_path("http://x", Some("/")), "http://x");
        assert_eq!(apply_base_path("http://x/", Some("/")), "http://x/");
    }

    /// `x-fern-base-path` with a templated path parameter (e.g.
    /// `/{tenant}/v1`) substitutes the placeholder from the operation's
    /// parameters at request time, and the consumed parameter is NOT
    /// echoed in the query string. Mirrors upstream Fern's behavior of
    /// baking the base path into endpoint paths at Definition build
    /// time and resolving placeholders uniformly with the rest of the
    /// path-parameter renderer.
    #[test]
    fn test_build_url_base_path_templated_param_substitutes_and_does_not_leak_to_query() {
        let doc = RestDescription {
            root_url: "https://api.example.com".to_string(),
            base_path: Some("/{tenant}/v1".to_string()),
            ..Default::default()
        };
        let method = RestMethod {
            path: "/things".to_string(),
            flat_path: Some("/things".to_string()),
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("tenant".to_string(), json!("acme"));
        let (url, qs) = build_url(&doc, &method, &params, false, None).unwrap();
        assert_eq!(url, "https://api.example.com/acme/v1/things");
        assert!(qs.is_empty(), "tenant must be consumed by base_path, not leaked as query: {qs:?}");
    }

    /// Multi-placeholder base paths (e.g. `/{region}/{tenant}/v1`) are
    /// rendered uniformly; both placeholder params are consumed by the
    /// URL path and neither leaks to the query string.
    #[test]
    fn test_build_url_base_path_multi_templated_params_substitute() {
        let doc = RestDescription {
            root_url: "https://api.example.com".to_string(),
            base_path: Some("/{region}/{tenant}/v1".to_string()),
            ..Default::default()
        };
        let method = RestMethod {
            path: "/things".to_string(),
            flat_path: Some("/things".to_string()),
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("region".to_string(), json!("us-east-1"));
        params.insert("tenant".to_string(), json!("acme"));
        let (url, qs) = build_url(&doc, &method, &params, false, None).unwrap();
        assert_eq!(url, "https://api.example.com/us-east-1/acme/v1/things");
        assert!(qs.is_empty(), "both placeholders must be consumed: {qs:?}");
    }

    /// A templated base path composes with operation-level path
    /// parameters: the base path placeholder and the endpoint path
    /// placeholder both substitute, and only non-path params survive
    /// as query string entries.
    #[test]
    fn test_build_url_base_path_templated_with_operation_path_param_and_query() {
        let doc = RestDescription {
            root_url: "https://api.example.com".to_string(),
            base_path: Some("/{tenant}/v1".to_string()),
            ..Default::default()
        };
        let mut method_params: HashMap<String, crate::openapi::discovery::MethodParameter> =
            HashMap::new();
        method_params.insert(
            "tenant".to_string(),
            crate::openapi::discovery::MethodParameter {
                location: Some("query".to_string()),
                ..Default::default()
            },
        );
        method_params.insert(
            "id".to_string(),
            crate::openapi::discovery::MethodParameter {
                location: Some("path".to_string()),
                ..Default::default()
            },
        );
        method_params.insert(
            "verbose".to_string(),
            crate::openapi::discovery::MethodParameter {
                location: Some("query".to_string()),
                ..Default::default()
            },
        );
        let method = RestMethod {
            path: "/things/{id}".to_string(),
            flat_path: Some("/things/{id}".to_string()),
            parameters: method_params,
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("tenant".to_string(), json!("acme"));
        params.insert("id".to_string(), json!("thing-1"));
        params.insert("verbose".to_string(), json!("true"));
        let (url, qs) = build_url(&doc, &method, &params, false, None).unwrap();
        assert_eq!(url, "https://api.example.com/acme/v1/things/thing-1");
        assert_eq!(qs, vec![("verbose".to_string(), "true".to_string())]);
    }

    /// A templated base path composes additively with `--base-url`
    /// override, just like a literal base path does. The override
    /// supplies the host; the templated base path still applies.
    #[test]
    fn test_build_url_base_path_templated_param_with_base_url_override() {
        let doc = RestDescription {
            root_url: "https://api.example.com".to_string(),
            base_path: Some("/{tenant}/v1".to_string()),
            ..Default::default()
        };
        let method = RestMethod {
            path: "/things".to_string(),
            flat_path: Some("/things".to_string()),
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("tenant".to_string(), json!("acme"));
        let (url, qs) = build_url(&doc, &method, &params, false, Some("https://staging.example.com")).unwrap();
        assert_eq!(url, "https://staging.example.com/acme/v1/things");
        assert!(qs.is_empty());
    }

    /// A param declared as `in: path` on the operation but whose
    /// placeholder lives only in `x-fern-base-path` (not in the
    /// operation's URL template) must NOT trigger the "path parameter
    /// not in URL template" validation error — it's still a path
    /// parameter, just one that the base path consumes. This is the
    /// most natural customer pattern when their OpenAPI declares a
    /// shared prefix param like `{tenant}` at the path-item level.
    #[test]
    fn test_build_url_base_path_templated_param_declared_as_path_param_does_not_error() {
        let doc = RestDescription {
            root_url: "https://api.example.com".to_string(),
            base_path: Some("/{tenant}/v1".to_string()),
            ..Default::default()
        };
        let mut method_params: HashMap<String, crate::openapi::discovery::MethodParameter> =
            HashMap::new();
        method_params.insert(
            "tenant".to_string(),
            crate::openapi::discovery::MethodParameter {
                location: Some("path".to_string()),
                required: true,
                ..Default::default()
            },
        );
        let method = RestMethod {
            path: "/things".to_string(),
            flat_path: Some("/things".to_string()),
            parameters: method_params,
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("tenant".to_string(), json!("acme"));
        let (url, qs) = build_url(&doc, &method, &params, false, None).unwrap();
        assert_eq!(url, "https://api.example.com/acme/v1/things");
        assert!(qs.is_empty());
    }

    /// When a placeholder in `x-fern-base-path` has no corresponding
    /// parameter, the placeholder is left literal in the URL — same
    /// fallback behavior as `render_path_template` on endpoint paths.
    /// This avoids a hard error for partial fills (e.g. callers that
    /// stub the base path) while still making the missing param
    /// visible in the outgoing URL.
    #[test]
    fn test_build_url_base_path_templated_param_missing_value_leaves_placeholder() {
        let doc = RestDescription {
            root_url: "https://api.example.com".to_string(),
            base_path: Some("/{tenant}/v1".to_string()),
            ..Default::default()
        };
        let method = RestMethod {
            path: "/things".to_string(),
            flat_path: Some("/things".to_string()),
            ..Default::default()
        };
        let (url, qs) = build_url(&doc, &method, &Map::new(), false, None).unwrap();
        assert_eq!(url, "https://api.example.com/{tenant}/v1/things");
        assert!(qs.is_empty());
    }

    /// `doc.base_url` with a *path component* (i.e. the spec's
    /// `servers[].url` includes a path) composes with `base_path` —
    /// `apply_base_path` doesn't care whether the base is a bare host or
    /// host+path; it just joins with one slash.
    #[test]
    fn test_build_url_base_path_doc_base_url_with_path_component() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/v2".to_string()),
            base_path: Some("/v1".to_string()),
            ..Default::default()
        };
        let method = things_method();
        let (url, _) = build_url(&doc, &method, &Map::new(), false, None).unwrap();
        assert_eq!(url, "https://api.example.com/v2/v1/things");
    }

    /// `base_path` is applied uniformly to the `is_upload` codepath too,
    /// not just to the regular path. Currently unreachable for OpenAPI
    /// specs (the OpenAPI parser never populates `media_upload`), but
    /// pinning the wiring makes the code self-consistent — if a future
    /// change ever exposes media uploads to OpenAPI, base_path won't
    /// silently be dropped.
    #[test]
    fn test_build_url_base_path_applies_to_media_upload_branch() {
        let doc = RestDescription {
            root_url: "https://api.example.com".to_string(),
            base_path: Some("/v1".to_string()),
            ..Default::default()
        };
        let method = RestMethod {
            path: "/files".to_string(),
            flat_path: Some("/files".to_string()),
            supports_media_upload: true,
            media_upload: Some(crate::openapi::discovery::MediaUpload {
                protocols: Some(crate::openapi::discovery::MediaUploadProtocols {
                    simple: Some(crate::openapi::discovery::MediaUploadProtocol {
                        path: "/upload/files".to_string(),
                        ..Default::default()
                    }),
                }),
                ..Default::default()
            }),
            ..Default::default()
        };
        let (url, _) = build_url(&doc, &method, &Map::new(), true, None).unwrap();
        assert_eq!(url, "https://api.example.com/v1/upload/files");
    }

    #[test]
    fn test_build_url_substitution() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        let method = RestMethod {
            path: "files/{fileId}".to_string(),
            flat_path: Some("files/{fileId}".to_string()),
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("fileId".to_string(), json!("123"));

        let (url, _) = build_url(&doc, &method, &params, false, None).unwrap();
        assert_eq!(url, "https://api.example.com/files/123");
    }

    #[test]
    fn test_build_url_query_params() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        let method = RestMethod {
            path: "files".to_string(),
            flat_path: Some("files".to_string()),
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("q".to_string(), json!("search term"));

        let (url, query) = build_url(&doc, &method, &params, false, None).unwrap();
        assert_eq!(url, "https://api.example.com/files");
        assert_eq!(query, vec![("q".to_string(), "search term".to_string())]);
    }

    #[test]
    fn test_build_url_repeated_query_param_expands_array() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        let mut method_params = HashMap::new();
        method_params.insert(
            "metadataHeaders".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                location: Some("query".to_string()),
                repeated: true,
                ..Default::default()
            },
        );
        let method = RestMethod {
            path: "messages".to_string(),
            flat_path: Some("messages".to_string()),
            parameters: method_params,
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert(
            "metadataHeaders".to_string(),
            json!(["Subject", "Date", "From"]),
        );

        let (_url, query) = build_url(&doc, &method, &params, false, None).unwrap();
        assert_eq!(
            query,
            vec![
                ("metadataHeaders".to_string(), "Subject".to_string()),
                ("metadataHeaders".to_string(), "Date".to_string()),
                ("metadataHeaders".to_string(), "From".to_string()),
            ]
        );
    }

    #[test]
    fn test_build_url_encodes_path_parameter_chars() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        let mut parameters = HashMap::new();
        parameters.insert(
            "spreadsheetId".to_string(),
            crate::openapi::discovery::MethodParameter {
                location: Some("path".to_string()),
                ..Default::default()
            },
        );
        parameters.insert(
            "range".to_string(),
            crate::openapi::discovery::MethodParameter {
                location: Some("path".to_string()),
                ..Default::default()
            },
        );
        let method = RestMethod {
            path: "spreadsheets/{spreadsheetId}/values/{range}".to_string(),
            flat_path: Some("spreadsheets/{spreadsheetId}/values/{range}".to_string()),
            parameters,
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("spreadsheetId".to_string(), json!("abc123"));
        params.insert("range".to_string(), json!("hash#1!A1:B2"));

        let (url, _) = build_url(&doc, &method, &params, false, None).unwrap();
        assert_eq!(
            url,
            "https://api.example.com/spreadsheets/abc123/values/hash%231%21A1%3AB2"
        );
    }

    #[test]
    fn test_build_url_plus_expansion_preserves_slashes() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        let mut parameters = HashMap::new();
        parameters.insert(
            "name".to_string(),
            crate::openapi::discovery::MethodParameter {
                location: Some("path".to_string()),
                ..Default::default()
            },
        );
        let method = RestMethod {
            path: "v1/{+name}".to_string(),
            flat_path: Some("v1/{+name}".to_string()),
            parameters,
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert(
            "name".to_string(),
            json!("projects/p1/locations/us/topics/t1"),
        );

        let (url, _) = build_url(&doc, &method, &params, false, None).unwrap();
        assert_eq!(
            url,
            "https://api.example.com/v1/projects/p1/locations/us/topics/t1"
        );
    }

    #[test]
    fn test_build_url_plus_expansion_rejects_reserved_chars() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        let mut parameters = HashMap::new();
        parameters.insert(
            "name".to_string(),
            crate::openapi::discovery::MethodParameter {
                location: Some("path".to_string()),
                ..Default::default()
            },
        );
        let method = RestMethod {
            path: "v1/{+name}".to_string(),
            flat_path: Some("v1/{+name}".to_string()),
            parameters,
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("name".to_string(), json!("projects/p1#frag?x=y"));

        let err = build_url(&doc, &method, &params, false, None).unwrap_err();
        assert!(err.to_string().contains("must not contain '?' or '#'"));
    }

    #[test]
    fn test_build_url_plus_expansion_rejects_path_traversal() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        let mut parameters = HashMap::new();
        parameters.insert(
            "name".to_string(),
            crate::openapi::discovery::MethodParameter {
                location: Some("path".to_string()),
                ..Default::default()
            },
        );
        let method = RestMethod {
            path: "v1/{+name}".to_string(),
            flat_path: Some("v1/{+name}".to_string()),
            parameters,
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("name".to_string(), json!("projects/../../etc/passwd"));

        let err = build_url(&doc, &method, &params, false, None).unwrap_err();
        assert!(err.to_string().contains("path traversal"));
    }

    #[test]
    fn test_build_url_upload_endpoint_substitutes_path_params() {
        let doc = RestDescription {
            root_url: "https://www.googleapis.com/".to_string(),
            ..Default::default()
        };
        let mut parameters = HashMap::new();
        parameters.insert(
            "fileId".to_string(),
            crate::openapi::discovery::MethodParameter {
                location: Some("path".to_string()),
                ..Default::default()
            },
        );
        let method = RestMethod {
            path: "drive/v3/files/{fileId}".to_string(),
            flat_path: Some("drive/v3/files/{fileId}".to_string()),
            parameters,
            media_upload: Some(crate::openapi::discovery::MediaUpload {
                protocols: Some(crate::openapi::discovery::MediaUploadProtocols {
                    simple: Some(crate::openapi::discovery::MediaUploadProtocol {
                        path: "/upload/drive/v3/files/{fileId}".to_string(),
                        multipart: Some(true),
                    }),
                }),
                ..Default::default()
            }),
            ..Default::default()
        };

        let mut params = Map::new();
        params.insert("fileId".to_string(), json!("abc/123"));

        let (url, _) = build_url(&doc, &method, &params, true, None).unwrap();
        assert_eq!(
            url,
            "https://www.googleapis.com/upload/drive/v3/files/abc%2F123"
        );
    }

    #[test]
    fn test_build_url_does_not_replace_placeholder_like_values() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        let method = RestMethod {
            path: "v1/{parent}/{child}".to_string(),
            flat_path: Some("v1/{parent}/{child}".to_string()),
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("parent".to_string(), json!("literal-{child}-value"));
        params.insert("child".to_string(), json!("ok"));

        let (url, _) = build_url(&doc, &method, &params, false, None).unwrap();
        assert_eq!(
            url,
            "https://api.example.com/v1/literal-%7Bchild%7D-value/ok"
        );
    }

    #[test]
    fn test_build_url_errors_for_path_param_not_in_template() {
        let doc = RestDescription {
            base_url: Some("https://api.example.com/".to_string()),
            ..Default::default()
        };
        let mut parameters = HashMap::new();
        parameters.insert(
            "fileId".to_string(),
            crate::openapi::discovery::MethodParameter {
                location: Some("path".to_string()),
                ..Default::default()
            },
        );
        let method = RestMethod {
            path: "files".to_string(),
            flat_path: Some("files".to_string()),
            parameters,
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("fileId".to_string(), json!("123"));

        let err = build_url(&doc, &method, &params, false, None).unwrap_err();
        assert!(err
            .to_string()
            .contains("Path parameter 'fileId' was provided but is not present"));
    }

    #[test]
    fn test_build_url_flatpath_fallback_on_mismatch() {
        // Reproduces the Slides presentations.get bug where flatPath uses
        // {presentationsId} (plural) but the parameter is presentationId (singular).
        let doc = RestDescription {
            base_url: Some("https://slides.googleapis.com/".to_string()),
            ..Default::default()
        };
        let mut parameters = HashMap::new();
        parameters.insert(
            "presentationId".to_string(),
            crate::openapi::discovery::MethodParameter {
                location: Some("path".to_string()),
                required: true,
                ..Default::default()
            },
        );
        let method = RestMethod {
            path: "v1/presentations/{+presentationId}".to_string(),
            flat_path: Some("v1/presentations/{presentationsId}".to_string()),
            parameters,
            ..Default::default()
        };
        let mut params = Map::new();
        params.insert("presentationId".to_string(), json!("abc123"));

        let (url, _) = build_url(&doc, &method, &params, false, None).unwrap();
        assert_eq!(url, "https://slides.googleapis.com/v1/presentations/abc123");
    }

    #[test]
    fn test_serialize_deep_object() {
        let value = json!({"status": "active", "date": "2024-01-01"});
        let result = serialize_query_param(
            "filter",
            &value,
            Some(&MethodParameter {
                style: Some("deepObject".to_string()),
                ..Default::default()
            }),
        );
        assert!(result.contains(&("filter[status]".to_string(), "active".to_string())));
        assert!(result.contains(&("filter[date]".to_string(), "2024-01-01".to_string())));
    }

    #[test]
    fn test_serialize_form_explode_array() {
        let value = json!(["a", "b", "c"]);
        let result = serialize_query_param(
            "tags",
            &value,
            Some(&MethodParameter {
                style: Some("form".to_string()),
                explode: Some(true),
                ..Default::default()
            }),
        );
        assert_eq!(
            result,
            vec![
                ("tags".to_string(), "a".to_string()),
                ("tags".to_string(), "b".to_string()),
                ("tags".to_string(), "c".to_string()),
            ]
        );
    }

    #[test]
    fn test_serialize_form_no_explode_array() {
        let value = json!(["a", "b", "c"]);
        let result = serialize_query_param(
            "tags",
            &value,
            Some(&MethodParameter {
                style: Some("form".to_string()),
                explode: Some(false),
                ..Default::default()
            }),
        );
        assert_eq!(result, vec![("tags".to_string(), "a,b,c".to_string())]);
    }

    #[test]
    fn test_serialize_default_style_is_form() {
        // No style specified -> defaults to form with explode
        let value = json!("hello");
        let result = serialize_query_param("q", &value, None);
        assert_eq!(result, vec![("q".to_string(), "hello".to_string())]);
    }

    #[test]
    fn test_get_nested_str_simple() {
        let val = json!({"nextPageToken": "tok123"});
        assert_eq!(get_nested_str(&val, "nextPageToken"), Some("tok123"));
    }

    #[test]
    fn test_get_nested_str_nested_path() {
        let val = json!({"pagination": {"cursor": "abc"}});
        assert_eq!(get_nested_str(&val, "pagination.cursor"), Some("abc"));
    }

    #[test]
    fn test_get_nested_str_missing_returns_none() {
        let val = json!({"other": "value"});
        assert_eq!(get_nested_str(&val, "nextPageToken"), None);
    }

    #[test]
    fn test_get_nested_str_non_string_returns_none() {
        let val = json!({"count": 42});
        assert_eq!(get_nested_str(&val, "count"), None);
    }

    // ---------------------------------------------------------------
    // x-fern-sdk-return-value: dot-path resolution
    // ---------------------------------------------------------------

    #[test]
    fn test_get_nested_value_top_level_property() {
        let val = json!({"data": [1, 2, 3], "meta": {}});
        assert_eq!(get_nested_value(&val, "data"), Some(&json!([1, 2, 3])));
    }

    #[test]
    fn test_get_nested_value_nested_property() {
        let val = json!({"result": {"items": ["x", "y"]}});
        assert_eq!(
            get_nested_value(&val, "result.items"),
            Some(&json!(["x", "y"]))
        );
    }

    #[test]
    fn test_get_nested_value_missing_top_returns_none() {
        let val = json!({"other": 1});
        assert_eq!(get_nested_value(&val, "data"), None);
    }

    #[test]
    fn test_get_nested_value_missing_intermediate_returns_none() {
        // First segment exists but the second doesn't — the executor
        // must error rather than silently fall through.
        let val = json!({"result": {"other": 1}});
        assert_eq!(get_nested_value(&val, "result.items"), None);
    }

    #[test]
    fn test_get_nested_value_returns_primitive_subvalue() {
        // The extension is valid on a leaf primitive: e.g. an endpoint
        // declaring `x-fern-sdk-return-value: id` on a wrapper response
        // should surface the bare ID string.
        let val = json!({"id": "abc-123", "name": "thing"});
        assert_eq!(get_nested_value(&val, "id"), Some(&json!("abc-123")));
    }

    #[test]
    fn test_get_nested_value_empty_path_returns_none() {
        let val = json!({"data": 1});
        assert_eq!(get_nested_value(&val, ""), None);
        assert_eq!(get_nested_value(&val, "   "), None);
    }

    #[test]
    fn test_get_nested_value_consecutive_dots_returns_none() {
        // `a..b` would otherwise produce a segment lookup for the empty
        // string, which always misses. Treat it explicitly as unresolved.
        let val = json!({"a": {"b": 1}});
        assert_eq!(get_nested_value(&val, "a..b"), None);
    }

    #[test]
    fn test_get_nested_value_array_index() {
        // Numeric segments index into arrays. `users.0.name` walks the
        // first element of the `users` array and reads its `name`.
        let val = json!({"users": [{"name": "alice"}, {"name": "bob"}]});
        assert_eq!(
            get_nested_value(&val, "users.0.name"),
            Some(&json!("alice"))
        );
        assert_eq!(
            get_nested_value(&val, "users.1.name"),
            Some(&json!("bob"))
        );
    }

    #[test]
    fn test_get_nested_value_array_index_out_of_range_returns_none() {
        let val = json!({"users": [{"name": "alice"}]});
        assert_eq!(get_nested_value(&val, "users.5.name"), None);
    }

    #[test]
    fn test_get_nested_value_array_index_on_object_returns_none() {
        // `0` against a non-array, non-`"0"`-keyed object is a miss.
        let val = json!({"users": {"alice": 1}});
        assert_eq!(get_nested_value(&val, "users.0"), None);
    }

    #[test]
    fn test_get_nested_value_object_key_named_zero_wins_over_array_index() {
        // If an object happens to have a literal `"0"` key, prefer that
        // over array indexing — the user's spec said "the property `0`",
        // not "the zeroth element". We're not an array here anyway, but
        // this also documents the precedence rule.
        let val = json!({"0": "object-key-zero", "list": [10, 20, 30]});
        assert_eq!(get_nested_value(&val, "0"), Some(&json!("object-key-zero")));
    }

    #[test]
    fn test_extract_return_value_top_level_resolves() {
        let body = json!({"data": [1, 2], "meta": {"total": 2}});
        let out = extract_return_value(&body, Some("data"), false, "op").unwrap();
        assert_eq!(out, json!([1, 2]));
    }

    #[test]
    fn test_extract_return_value_nested_resolves() {
        let body = json!({"result": {"items": [{"id": 1}]}});
        let out = extract_return_value(&body, Some("result.items"), false, "op").unwrap();
        assert_eq!(out, json!([{"id": 1}]));
    }

    #[test]
    fn test_extract_return_value_unresolved_path_errors() {
        let body = json!({"foo": 1});
        let err = extract_return_value(&body, Some("data"), false, "things.list")
            .expect_err("missing path must error");
        let msg = err.to_string();
        assert!(
            msg.contains("'data'") && msg.contains("things.list"),
            "error should name both path and operation id: {msg}",
        );
        assert!(
            msg.contains("--no-extract"),
            "error should point users at the --no-extract escape hatch: {msg}",
        );
    }

    #[test]
    fn test_extract_return_value_no_path_returns_full_body() {
        let body = json!({"data": [1], "meta": {}});
        let out = extract_return_value(&body, None, false, "op").unwrap();
        assert_eq!(out, body);
    }

    #[test]
    fn test_extract_return_value_no_extract_overrides_path() {
        // The opt-out flag bypasses extraction entirely even when the
        // spec declares a return path — used to debug responses that
        // don't match the spec's promised shape.
        let body = json!({"foo": 1});
        let out = extract_return_value(&body, Some("data"), true, "op")
            .expect("no_extract=true must bypass extraction even if path would fail");
        assert_eq!(
            out, body,
            "no_extract returns the full body verbatim, including when the path would have errored",
        );
    }

    #[test]
    fn test_extract_return_value_resolved_null_is_preserved_not_errored() {
        // `{"data": null}` + `return_value: "data"` is *not* an error —
        // the spec promised a `data` field, the server delivered one,
        // it just happens to be JSON null. Typed SDKs would surface
        // this as a nullable response field; the CLI surfaces it as
        // the literal `null`.
        let body = json!({"data": null, "meta": {}});
        let out = extract_return_value(&body, Some("data"), false, "op")
            .expect("resolved null is a valid extracted value");
        assert_eq!(out, json!(null));
    }

    #[test]
    fn test_extract_return_value_descriptor_appears_verbatim_in_error() {
        // When operationId is absent the caller passes a descriptor
        // like "GET /reports". Make sure that descriptor survives the
        // format string intact so users can locate the offending op.
        let body = json!({"foo": 1});
        let err = extract_return_value(&body, Some("data"), false, "GET /reports")
            .expect_err("missing path must error");
        let msg = err.to_string();
        assert!(
            msg.contains("GET /reports"),
            "descriptor must appear verbatim in error: {msg}",
        );
    }

    #[test]
    fn test_get_nested_value_path_through_array_with_index() {
        // Composes `extract_return_value` with array indexing: paths
        // like `data.0` extract the first element of an array.
        let body = json!({"data": [{"id": "first"}, {"id": "second"}]});
        let out = extract_return_value(&body, Some("data.0"), false, "op").unwrap();
        assert_eq!(out, json!({"id": "first"}));
    }

    #[tokio::test]
    async fn test_handle_json_response_extracts_subvalue_capture() {
        let pagination = PaginationConfig::default();
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Cursor(None);
        let mut captured = Vec::new();

        let result = handle_json_response(
            r#"{"data":[{"id":1}],"meta":{"total":1}}"#,
            &pagination,
            None,
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            true,
            &mut captured,
            "http://example.com/test",
            &[],
            Some("data"),
            false,
            "things.list",
        )
        .await
        .unwrap();

        assert!(!result);
        assert_eq!(captured.len(), 1);
        assert_eq!(
            captured[0],
            json!([{"id": 1}]),
            "captured value should be the extracted subvalue, not the full body",
        );
    }

    #[tokio::test]
    async fn test_handle_json_response_no_extract_keeps_full_body() {
        let pagination = PaginationConfig::default();
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Cursor(None);
        let mut captured = Vec::new();

        let body = r#"{"data":[{"id":1}],"meta":{"total":1}}"#;
        let result = handle_json_response(
            body,
            &pagination,
            None,
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            true,
            &mut captured,
            "http://example.com/test",
            &[],
            Some("data"),
            true, // no_extract
            "things.list",
        )
        .await
        .unwrap();

        assert!(!result);
        assert_eq!(captured[0], serde_json::from_str::<Value>(body).unwrap());
    }

    #[tokio::test]
    async fn test_handle_json_response_extract_unresolved_errors() {
        let pagination = PaginationConfig::default();
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Cursor(None);
        let mut captured = Vec::new();

        let err = handle_json_response(
            r#"{"foo":1}"#,
            &pagination,
            None,
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            true,
            &mut captured,
            "http://example.com/test",
            &[],
            Some("data"),
            false,
            "things.list",
        )
        .await
        .expect_err("unresolved extract path must surface as a validation error");
        assert!(
            err.to_string().contains("'data'"),
            "error message should name the missing path: {err}",
        );
        assert_eq!(
            pages_fetched, 0,
            "errors must abort before the page counter advances",
        );
    }

    #[tokio::test]
    async fn test_handle_json_response_pagination_with_extract_emits_subvalue_per_page() {
        // Combined behavior check: per-op cursor pagination + extract.
        // The full body is still used for pagination continuation (the
        // cursor lives outside the extracted subvalue), but only the
        // `data` subvalue is captured for the caller.
        let pagination = page_all_pagination();
        let endpoint = EndpointPagination::Cursor {
            cursor: "cursor".to_string(),
            next_cursor: "next".to_string(),
            results: "data".to_string(),
        };
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Cursor(None);
        let mut captured = Vec::new();

        let result = handle_json_response(
            r#"{"data":[{"id":1},{"id":2}],"next":"page-2"}"#,
            &pagination,
            Some(&endpoint),
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            true,
            &mut captured,
            "http://example.com/test",
            &[],
            Some("data"),
            false,
            "things.list",
        )
        .await
        .unwrap();

        assert!(result, "cursor present → should continue pagination");
        assert_eq!(captured.len(), 1);
        assert_eq!(
            captured[0],
            json!([{"id": 1}, {"id": 2}]),
            "captured per-page value must be the extracted subvalue",
        );
        match page_state {
            PageState::Cursor(Some(ref t)) => assert_eq!(t, "page-2"),
            other => panic!("expected Cursor(Some(\"page-2\")), got {other:?}"),
        }
    }

    #[tokio::test]
    async fn test_handle_json_response_capture_output() {
        let pagination = PaginationConfig::default();
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Cursor(None);
        let mut captured = Vec::new();

        let result = handle_json_response(
            r#"{"items":["a"]}"#,
            &pagination,
            None,
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            true,
            &mut captured,
            "http://example.com/test",
            &[],
            None,
            false,
            "test-op",
        )
        .await
        .unwrap();

        assert!(!result);
        assert_eq!(captured.len(), 1);
        assert_eq!(pages_fetched, 1);
    }

    #[tokio::test]
    async fn test_handle_json_response_non_json_body() {
        let pagination = PaginationConfig::default();
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Cursor(None);
        let mut captured = Vec::new();

        let result = handle_json_response(
            "not json at all",
            &pagination,
            None,
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            false,
            &mut captured,
            "http://example.com/test",
            &[],
            None,
            false,
            "test-op",
        )
        .await
        .unwrap();

        assert!(!result);
        assert_eq!(pages_fetched, 0);
    }

    #[tokio::test]
    async fn test_handle_json_response_pagination_continues() {
        let pagination = PaginationConfig {
            page_all: true,
            page_limit: 10,
            page_delay_ms: 0,
            ..PaginationConfig::default()
        };
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Cursor(None);
        let mut captured = Vec::new();

        let result = handle_json_response(
            r#"{"items":[],"nextPageToken":"next-tok"}"#,
            &pagination,
            None,
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            false,
            &mut captured,
            "http://example.com/test",
            &[],
            None,
            false,
            "test-op",
        )
        .await
        .unwrap();

        assert!(result);
        match page_state {
            PageState::Cursor(Some(ref t)) => assert_eq!(t, "next-tok"),
            other => panic!("expected Cursor(Some(\"next-tok\")), got {other:?}"),
        }
    }

    #[tokio::test]
    async fn test_handle_json_response_pagination_at_limit() {
        let pagination = PaginationConfig {
            page_all: true,
            page_limit: 5,
            page_delay_ms: 0,
            ..PaginationConfig::default()
        };
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 4u32; // becomes 5 == page_limit, no continuation
        let mut page_state = PageState::Cursor(None);
        let mut captured = Vec::new();

        let result = handle_json_response(
            r#"{"items":[],"nextPageToken":"would-be-next"}"#,
            &pagination,
            None,
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            false,
            &mut captured,
            "http://example.com/test",
            &[],
            None,
            false,
            "test-op",
        )
        .await
        .unwrap();

        assert!(!result);
        assert_eq!(pages_fetched, 5);
    }

    // ---------------------------------------------------------------
    // Per-operation x-fern-pagination: cursor + offset coverage
    // ---------------------------------------------------------------

    fn page_all_pagination() -> PaginationConfig {
        PaginationConfig {
            page_all: true,
            page_limit: 10,
            page_delay_ms: 0,
            ..PaginationConfig::default()
        }
    }

    #[tokio::test]
    async fn test_per_op_cursor_pagination_continues_with_response_path() {
        let pagination = page_all_pagination();
        let endpoint = EndpointPagination::Cursor {
            cursor: "marker".to_string(),
            next_cursor: "next_marker".to_string(),
            results: "entries".to_string(),
        };
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Cursor(None);
        let mut captured = Vec::new();

        let result = handle_json_response(
            r#"{"entries":[{"id":"1"}],"next_marker":"abc"}"#,
            &pagination,
            Some(&endpoint),
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            true,
            &mut captured,
            "http://example.com/test",
            &[],
            None,
            false,
            "test-op",
        )
        .await
        .unwrap();

        assert!(result);
        match page_state {
            PageState::Cursor(Some(ref t)) => assert_eq!(t, "abc"),
            other => panic!("expected Cursor(Some(\"abc\")), got {other:?}"),
        }
    }

    #[tokio::test]
    async fn test_per_op_cursor_stops_on_empty_next_cursor() {
        let pagination = page_all_pagination();
        let endpoint = EndpointPagination::Cursor {
            cursor: "marker".to_string(),
            next_cursor: "next_marker".to_string(),
            results: "entries".to_string(),
        };
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Cursor(None);
        let mut captured = Vec::new();

        let result = handle_json_response(
            r#"{"entries":[{"id":"2"}],"next_marker":""}"#,
            &pagination,
            Some(&endpoint),
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            true,
            &mut captured,
            "http://example.com/test",
            &[],
            None,
            false,
            "test-op",
        )
        .await
        .unwrap();

        assert!(!result);
    }

    #[tokio::test]
    async fn test_per_op_offset_pagination_advances_by_results_len() {
        let pagination = page_all_pagination();
        let endpoint = EndpointPagination::Offset {
            offset: "page_number".to_string(),
            results: "users".to_string(),
            step: None,
            has_next_page: Some("meta.has_more".to_string()),
        };
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Offset(0);
        let mut captured = Vec::new();

        let result = handle_json_response(
            r#"{"users":[{"id":1},{"id":2},{"id":3}],"meta":{"has_more":true}}"#,
            &pagination,
            Some(&endpoint),
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            true,
            &mut captured,
            "http://example.com/test",
            &[],
            None,
            false,
            "test-op",
        )
        .await
        .unwrap();

        assert!(result);
        match page_state {
            PageState::Offset(n) => assert_eq!(n, 3),
            other => panic!("expected Offset(3), got {other:?}"),
        }
    }

    #[tokio::test]
    async fn test_per_op_offset_stops_when_has_next_page_false() {
        let pagination = page_all_pagination();
        let endpoint = EndpointPagination::Offset {
            offset: "page_number".to_string(),
            results: "users".to_string(),
            step: None,
            has_next_page: Some("meta.has_more".to_string()),
        };
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Offset(0);
        let mut captured = Vec::new();

        let result = handle_json_response(
            r#"{"users":[{"id":1}],"meta":{"has_more":false}}"#,
            &pagination,
            Some(&endpoint),
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            true,
            &mut captured,
            "http://example.com/test",
            &[],
            None,
            false,
            "test-op",
        )
        .await
        .unwrap();

        assert!(!result);
    }

    #[tokio::test]
    async fn test_per_op_offset_step_stops_on_short_page() {
        // `step: $request.limit` + caller's `--limit 50` → the executor
        // gates the next page on `items.length >= 50`. The server returned
        // only 3 rows (a short page), so pagination must stop even though
        // `has_next_page` is unset. Matches upstream fern's hasNextPage
        // check `items.length >= step`.
        let pagination = page_all_pagination();
        let endpoint = EndpointPagination::Offset {
            offset: "offset".to_string(),
            results: "users".to_string(),
            step: Some("limit".to_string()),
            has_next_page: None,
        };
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Offset(0);
        let mut captured = Vec::new();
        let request_query_params = vec![("limit".to_string(), "50".to_string())];

        let result = handle_json_response(
            r#"{"users":[{"id":1},{"id":2},{"id":3}]}"#,
            &pagination,
            Some(&endpoint),
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            true,
            &mut captured,
            "http://example.com/test",
            &request_query_params,
            None,
            false,
            "test-op",
        )
        .await
        .unwrap();

        assert!(
            !result,
            "short page (3 < 50) must end pagination per upstream `items.length >= step` gate"
        );
    }

    #[tokio::test]
    async fn test_per_op_offset_step_continues_on_full_page() {
        // Full page: server returned `limit` items → continue and advance
        // by `len(items)` (item-index semantics).
        let pagination = page_all_pagination();
        let endpoint = EndpointPagination::Offset {
            offset: "offset".to_string(),
            results: "users".to_string(),
            step: Some("limit".to_string()),
            has_next_page: None,
        };
        let pipeline = crate::formatter::OutputPipeline::default();
        let mut pages_fetched = 0u32;
        let mut page_state = PageState::Offset(0);
        let mut captured = Vec::new();
        let request_query_params = vec![("limit".to_string(), "3".to_string())];

        let result = handle_json_response(
            r#"{"users":[{"id":1},{"id":2},{"id":3}]}"#,
            &pagination,
            Some(&endpoint),
            &pipeline,
            &mut pages_fetched,
            &mut page_state,
            true,
            &mut captured,
            "http://example.com/test",
            &request_query_params,
            None,
            false,
            "test-op",
        )
        .await
        .unwrap();

        assert!(result, "full page (3 >= 3) must continue pagination");
        match page_state {
            PageState::Offset(n) => assert_eq!(
                n, 3,
                "offset advances by len(items), not by the step value"
            ),
            other => panic!("expected Offset(3), got {other:?}"),
        }
    }

    #[test]
    fn test_resolve_step_target_from_request_param() {
        // step: "limit" + query params containing limit=50 → Some(50).
        let params = vec![("limit".to_string(), "50".to_string())];
        assert_eq!(resolve_step_target(Some("limit"), &params), Some(50));
    }

    #[test]
    fn test_resolve_step_target_literal_integer() {
        // step is itself an integer literal (e.g. `step: "50"`) → Some(50).
        assert_eq!(resolve_step_target(Some("50"), &[]), Some(50));
    }

    #[test]
    fn test_resolve_step_target_unresolvable_returns_none() {
        // step references a param the caller didn't supply → None, so the
        // executor falls back to the legacy `items.len() > 0` check.
        assert_eq!(resolve_step_target(Some("limit"), &[]), None);
    }

    #[test]
    fn test_resolve_step_target_none_returns_none() {
        assert_eq!(resolve_step_target(None, &[]), None);
    }

    #[test]
    fn test_page_state_injection_heuristic_first_page() {
        let state = PageState::Cursor(None);
        assert_eq!(state.injection(None, "pageToken"), None);
    }

    #[test]
    fn test_page_state_injection_heuristic_with_token() {
        let state = PageState::Cursor(Some("tok".to_string()));
        assert_eq!(
            state.injection(None, "pageToken"),
            Some(("pageToken".to_string(), "tok".to_string())),
        );
    }

    #[test]
    fn test_page_state_injection_endpoint_cursor_uses_op_param_name() {
        let endpoint = EndpointPagination::Cursor {
            cursor: "marker".to_string(),
            next_cursor: "next_marker".to_string(),
            results: "entries".to_string(),
        };
        let state = PageState::Cursor(Some("tok".to_string()));
        assert_eq!(
            state.injection(Some(&endpoint), "pageToken"),
            Some(("marker".to_string(), "tok".to_string())),
        );
    }

    #[test]
    fn test_page_state_injection_offset_zero_skipped_on_first_page() {
        let endpoint = EndpointPagination::Offset {
            offset: "page_number".to_string(),
            results: "users".to_string(),
            step: None,
            has_next_page: None,
        };
        let state = PageState::Offset(0);
        assert_eq!(state.injection(Some(&endpoint), "pageToken"), None);
    }

    #[test]
    fn test_page_state_injection_offset_nonzero_injects() {
        let endpoint = EndpointPagination::Offset {
            offset: "page_number".to_string(),
            results: "users".to_string(),
            step: None,
            has_next_page: None,
        };
        let state = PageState::Offset(42);
        assert_eq!(
            state.injection(Some(&endpoint), "pageToken"),
            Some(("page_number".to_string(), "42".to_string())),
        );
    }

    #[test]
    fn test_mime_from_extension_various() {
        assert_eq!(mime_from_extension("doc.txt"), Some("text/plain".to_string()));
        assert_eq!(mime_from_extension("page.htm"), Some("text/html".to_string()));
        assert_eq!(mime_from_extension("style.css"), Some("text/css".to_string()));
        assert_eq!(mime_from_extension("data.xml"), Some("application/xml".to_string()));
        assert_eq!(mime_from_extension("app.js"), Some("application/javascript".to_string()));
        assert_eq!(mime_from_extension("doc.pdf"), Some("application/pdf".to_string()));
        assert_eq!(mime_from_extension("arc.zip"), Some("application/zip".to_string()));
        assert_eq!(mime_from_extension("file.gz"), Some("application/gzip".to_string()));
        assert_eq!(mime_from_extension("file.gzip"), Some("application/gzip".to_string()));
        assert_eq!(mime_from_extension("archive.tar"), Some("application/x-tar".to_string()));
        assert_eq!(mime_from_extension("img.png"), Some("image/png".to_string()));
        assert_eq!(mime_from_extension("photo.jpg"), Some("image/jpeg".to_string()));
        assert_eq!(mime_from_extension("photo.jpeg"), Some("image/jpeg".to_string()));
        assert_eq!(mime_from_extension("anim.gif"), Some("image/gif".to_string()));
        assert_eq!(mime_from_extension("icon.svg"), Some("image/svg+xml".to_string()));
        assert_eq!(mime_from_extension("img.webp"), Some("image/webp".to_string()));
        assert_eq!(mime_from_extension("fav.ico"), Some("image/x-icon".to_string()));
        assert_eq!(mime_from_extension("song.mp3"), Some("audio/mpeg".to_string()));
        assert_eq!(mime_from_extension("sound.wav"), Some("audio/wav".to_string()));
        assert_eq!(mime_from_extension("video.mp4"), Some("video/mp4".to_string()));
        assert_eq!(mime_from_extension("clip.webm"), Some("video/webm".to_string()));
        assert_eq!(mime_from_extension("config.yaml"), Some("application/yaml".to_string()));
        assert_eq!(mime_from_extension("config.yml"), Some("application/yaml".to_string()));
        assert_eq!(mime_from_extension("config.toml"), Some("application/toml".to_string()));
        assert_eq!(mime_from_extension("word.doc"), Some("application/msword".to_string()));
        assert_eq!(mime_from_extension("word.docx"), Some("application/vnd.openxmlformats-officedocument.wordprocessingml.document".to_string()));
        assert_eq!(mime_from_extension("sheet.xls"), Some("application/vnd.ms-excel".to_string()));
        assert_eq!(mime_from_extension("sheet.xlsx"), Some("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".to_string()));
        assert_eq!(mime_from_extension("slides.ppt"), Some("application/vnd.ms-powerpoint".to_string()));
        assert_eq!(mime_from_extension("slides.pptx"), Some("application/vnd.openxmlformats-officedocument.presentationml.presentation".to_string()));
        assert_eq!(mime_from_extension("module.wasm"), Some("application/wasm".to_string()));
        assert_eq!(mime_from_extension("file.unknown"), None);
    }

    #[test]
    fn test_mime_to_extension_additional_branches() {
        assert_eq!(mime_to_extension("image/gif"), "gif");
        // Use MIMEs that don't contain "xml" (which matches earlier in the chain)
        assert_eq!(mime_to_extension("application/vnd.ms-excel.spreadsheet"), "xlsx");
        assert_eq!(mime_to_extension("application/vnd.ms-word.document.12"), "docx");
        assert_eq!(mime_to_extension("application/octet-stream"), "bin");
        assert_eq!(mime_to_extension("application/unknown-type"), "bin");
    }

    #[test]
    fn test_resolve_upload_mime_strips_control_chars() {
        let mime = resolve_upload_mime(Some("text/plain\rinjected"), None, &None);
        assert_eq!(mime, "text/plaininjected");
    }

    #[test]
    fn test_resolve_upload_mime_all_control_chars_falls_back() {
        let mime = resolve_upload_mime(Some("\r\n\t"), None, &None);
        assert_eq!(mime, "application/octet-stream");
    }

    #[test]
    fn test_value_to_query_string_null() {
        assert_eq!(value_to_query_string(&Value::Null), "");
    }

    #[test]
    fn test_value_to_query_string_object_serializes() {
        let val = json!({"key": "val"});
        let result = value_to_query_string(&val);
        assert!(!result.is_empty());
    }

    #[test]
    fn test_serialize_deep_object_non_object_value() {
        let result = serialize_deep_object("filter", &json!("simple"));
        assert_eq!(result, vec![("filter".to_string(), "simple".to_string())]);
    }

    #[test]
    fn test_serialize_deep_object_nested() {
        // Multi-level nesting: {"meta":{"created_at":"today"}} with key "filter"
        // should produce [("filter[meta][created_at]", "today")]
        let value = json!({"meta": {"created_at": "today"}});
        let result = serialize_deep_object("filter", &value);
        assert_eq!(
            result,
            vec![("filter[meta][created_at]".to_string(), "today".to_string())]
        );
    }

    #[test]
    fn test_serialize_deep_object_array_uses_repeated_keys() {
        // Arrays must use repeated keys (filter[tags]=a&filter[tags]=b),
        // consistent with the Fern Python and C# SDKs. Not indexed brackets.
        let value = json!({"tags": ["a", "b"]});
        let mut result = serialize_deep_object("filter", &value);
        result.sort(); // order not guaranteed
        assert_eq!(
            result,
            vec![
                ("filter[tags]".to_string(), "a".to_string()),
                ("filter[tags]".to_string(), "b".to_string()),
            ]
        );
    }

    #[test]
    fn test_build_url_uses_root_url_and_service_path_when_no_base_url() {
        let doc = RestDescription {
            root_url: "https://api.example.com/".to_string(),
            service_path: "v1/".to_string(),
            base_url: None,
            ..Default::default()
        };
        let method = RestMethod {
            path: "files".to_string(),
            ..Default::default()
        };
        let (url, _) = build_url(&doc, &method, &Map::new(), false, None).unwrap();
        assert_eq!(url, "https://api.example.com/v1/files");
    }

    #[test]
    fn test_build_url_method_root_url_overrides_doc_root_url() {
        // Per-operation server override: method.root_url must win over doc.root_url.
        // If this is broken, requests route to the wrong host (e.g. upload
        // endpoints land on the general API host instead of the upload host).
        let doc = RestDescription {
            root_url: "https://api.example.com/".to_string(),
            service_path: "v1/".to_string(),
            base_url: None,
            ..Default::default()
        };
        let method = RestMethod {
            path: "uploads".to_string(),
            root_url: "https://upload.example.com/".to_string(),
            ..Default::default()
        };
        let (url, _) = build_url(&doc, &method, &Map::new(), false, None).unwrap();
        assert_eq!(url, "https://upload.example.com/v1/uploads");
    }

    #[test]
    fn test_build_url_empty_method_root_url_falls_back_to_doc() {
        // When method.root_url is empty (unset), doc.root_url must be used.
        let doc = RestDescription {
            root_url: "https://api.example.com/".to_string(),
            service_path: "v1/".to_string(),
            base_url: None,
            ..Default::default()
        };
        let method = RestMethod {
            path: "files".to_string(),
            root_url: String::new(),
            ..Default::default()
        };
        let (url, _) = build_url(&doc, &method, &Map::new(), false, None).unwrap();
        assert_eq!(url, "https://api.example.com/v1/files");
    }

    #[test]
    fn test_parse_and_validate_inputs_invalid_params_json() {
        let doc = RestDescription::default();
        let method = RestMethod::default();
        let err =
            parse_and_validate_inputs(&doc, &method, Some("{not json}"), None, false, None, &[]).unwrap_err();
        assert!(err.to_string().contains("Invalid --params JSON"));
    }

    #[test]
    fn test_parse_and_validate_inputs_invalid_body_json() {
        let doc = RestDescription::default();
        let method = RestMethod::default();
        let err =
            parse_and_validate_inputs(&doc, &method, None, Some("{not json}"), false, None, &[]).unwrap_err();
        assert!(err.to_string().contains("Invalid --json body"));
    }

    #[test]
    fn test_parse_and_validate_inputs_required_query_param_missing() {
        let mut parameters = HashMap::new();
        parameters.insert(
            "api_key".to_string(),
            MethodParameter {
                location: Some("query".to_string()),
                required: true,
                ..Default::default()
            },
        );
        let doc = RestDescription::default();
        let method = RestMethod {
            parameters,
            ..Default::default()
        };
        let err = parse_and_validate_inputs(&doc, &method, None, None, false, None, &[]).unwrap_err();
        assert!(err.to_string().contains("Required parameter 'api_key'"));
    }

    #[tokio::test]
    async fn test_build_http_request_unsupported_method() {
        let client = reqwest::Client::new();
        let method = RestMethod {
            http_method: "TRACE".to_string(),
            path: "test".to_string(),
            ..Default::default()
        };
        let input = ExecutionInput {
            full_url: "https://example.com/test".to_string(),
            body: None,
            query_params: Vec::new(),
            header_params: Vec::new(),
            is_upload: false,
        };

        let err = build_http_request(
            &client,
            &method,
            &input,
            &crate::auth::no_auth_provider(),
            &EndpointAuthMetadata::unspecified(),
            &PageState::Cursor(None),
            0,
            &None,
            None,
            &PaginationConfig::default(),
        )
        .await
        .unwrap_err();
        assert!(err.to_string().contains("Unsupported HTTP method"));
    }

    #[tokio::test]
    async fn test_build_http_request_put_patch_delete() {
        let client = reqwest::Client::new();
        let input = ExecutionInput {
            full_url: "https://example.com/test".to_string(),
            body: None,
            query_params: Vec::new(),
            header_params: Vec::new(),
            is_upload: false,
        };

        for http_method in &["PUT", "PATCH", "DELETE"] {
            let method = RestMethod {
                http_method: http_method.to_string(),
                path: "test".to_string(),
                ..Default::default()
            };
            let result = build_http_request(
                &client,
                &method,
                &input,
                &crate::auth::no_auth_provider(),
                &EndpointAuthMetadata::unspecified(),
                &PageState::Cursor(None),
                0,
                &None,
                None,
                &PaginationConfig::default(),
            )
            .await;
            assert!(result.is_ok(), "Failed for method {http_method}");
        }
    }

    #[test]
    fn test_validate_value_schema_not_found() {
        let doc = RestDescription::default();
        let mut errors = Vec::new();
        validate_value(&json!({}), "NonExistentSchema", &doc, "$", &mut errors);
        assert_eq!(errors.len(), 1);
        assert!(errors[0].contains("Schema 'NonExistentSchema' not found"));
    }

    #[test]
    fn test_resolve_next_path_absolute_url_overrides_base() {
        // Server returned a fully-formed URL → use it verbatim.
        let url = resolve_next_path(
            "https://api.example.com/v1/things?cursor=a",
            "https://other.example.com/v2/items?cursor=b",
        )
        .unwrap();
        assert_eq!(url, "https://other.example.com/v2/items?cursor=b");
    }

    #[test]
    fn test_resolve_next_path_absolute_path_keeps_scheme_and_host() {
        // A `/`-prefixed path keeps the previous host but replaces the path.
        let url = resolve_next_path(
            "https://api.example.com/v1/things?cursor=a",
            "/v1/things?cursor=b",
        )
        .unwrap();
        assert_eq!(url, "https://api.example.com/v1/things?cursor=b");
    }

    #[test]
    fn test_resolve_next_path_relative_path_inherits_directory() {
        // No leading slash → resolved relative to the previous request's
        // directory (browser-style URL resolution).
        let url = resolve_next_path(
            "https://api.example.com/v1/things",
            "things?cursor=b",
        )
        .unwrap();
        assert_eq!(url, "https://api.example.com/v1/things?cursor=b");
    }

    #[test]
    fn test_resolve_next_path_rejects_invalid_base_url() {
        let err = resolve_next_path("not a url", "/foo").unwrap_err();
        assert!(err.contains("not a valid URL"), "got: {err}");
    }

    #[test]
    fn test_page_state_initial_for_each_form() {
        assert!(matches!(
            PageState::initial(Some(&EndpointPagination::Cursor {
                cursor: "c".into(),
                next_cursor: "n".into(),
                results: "r".into(),
            })),
            PageState::Cursor(None)
        ));
        assert!(matches!(
            PageState::initial(Some(&EndpointPagination::Offset {
                offset: "o".into(),
                results: "r".into(),
                step: None,
                has_next_page: None,
            })),
            PageState::Offset(0)
        ));
        assert!(matches!(
            PageState::initial(Some(&EndpointPagination::Uri {
                next_uri: "n".into(),
                results: "r".into(),
            })),
            PageState::NextUrl(None)
        ));
        assert!(matches!(
            PageState::initial(Some(&EndpointPagination::Path {
                next_path: "n".into(),
                results: "r".into(),
            })),
            PageState::NextUrl(None)
        ));
        assert!(matches!(
            PageState::initial(Some(&EndpointPagination::Custom {
                results: "r".into(),
            })),
            PageState::Custom
        ));
        assert!(matches!(PageState::initial(None), PageState::Cursor(None)));
    }

    #[test]
    fn test_page_state_url_override_only_for_next_url() {
        assert!(PageState::Cursor(None).url_override().is_none());
        assert!(PageState::Cursor(Some("tok".into())).url_override().is_none());
        assert!(PageState::Offset(5).url_override().is_none());
        assert!(PageState::NextUrl(None).url_override().is_none());
        assert!(PageState::Custom.url_override().is_none());
        let url = "https://api.example.com/v1/things?cursor=abc";
        assert_eq!(
            PageState::NextUrl(Some(url.to_string())).url_override(),
            Some(url)
        );
    }

    #[test]
    fn test_page_state_injection_uri_path_custom_no_query_param() {
        // Uri/Path/Custom embed everything in the URL (or stop entirely);
        // they must never push a cursor/offset query param.
        let pagination = EndpointPagination::Uri {
            next_uri: "next".into(),
            results: "items".into(),
        };
        assert!(PageState::NextUrl(Some("https://x".into()))
            .injection(Some(&pagination), "page_token")
            .is_none());
        let custom = EndpointPagination::Custom {
            results: "items".into(),
        };
        assert!(PageState::Custom.injection(Some(&custom), "page_token").is_none());
    }

    // -----------------------------------------------------------------
    // x-fern-streaming response decoding (`decode_stream_event`)
    //
    // The pure line decoder is the surface most likely to drift across
    // server quirks (extra whitespace, comment lines, terminator
    // variants), so we cover the full matrix here without touching the
    // network. Wire-level integration is exercised in the tier-2 tests
    // under tests/openapi_fixture_wire.rs.
    // -----------------------------------------------------------------

    // -----------------------------------------------------------------
    // SSE line decoding (`SseLineDecoder`)
    //
    // SSE is stateful — `data:` payloads are buffered across multiple
    // lines and dispatched on a blank-line separator per the WHATWG
    // spec. Tests below isolate the decoder so a regression in framing
    // or multi-line concat points at the exact branch.
    // -----------------------------------------------------------------

    fn drive(lines: &[&str]) -> Vec<String> {
        let mut decoder = SseLineDecoder::default();
        let mut out = Vec::new();
        for line in lines {
            if let Some(payload) = decoder.push_line(line) {
                out.push(payload);
            }
        }
        if let Some(payload) = decoder.flush() {
            out.push(payload);
        }
        out
    }

    #[test]
    fn test_sse_decoder_strips_data_prefix_and_one_space() {
        // `data: {"x":1}` decodes to `{"x":1}` — the single leading
        // space after `data:` is consumed (matches the SSE spec).
        let payloads = drive(&["data: {\"x\":1}", ""]);
        assert_eq!(payloads, vec!["{\"x\":1}".to_string()]);
    }

    #[test]
    fn test_sse_decoder_no_space_after_data() {
        // The space after `data:` is optional; the payload is
        // preserved identically in both shapes.
        let payloads = drive(&["data:{\"x\":1}", ""]);
        assert_eq!(payloads, vec!["{\"x\":1}".to_string()]);
    }

    #[test]
    fn test_sse_decoder_skips_comments_and_unknown_fields() {
        // Comments (`:`), `event:`, `id:`, `retry:`, and unknown
        // fields are framing-only and must not pollute the dispatched
        // payload. Only the `data:` line contributes to the event.
        let payloads = drive(&[
            ": keepalive",
            "event: message",
            "id: 42",
            "retry: 5000",
            "data: {\"x\":1}",
            "",
        ]);
        assert_eq!(payloads, vec!["{\"x\":1}".to_string()]);
    }

    #[test]
    fn test_sse_decoder_dispatches_on_blank_line_with_multiline_concat() {
        // Three `data:` lines spanning a single pretty-printed JSON
        // object — the WHATWG spec says they join with `\n` and
        // dispatch as one event on the blank-line separator. The TS
        // runtime's `iterSseEvents` loop does exactly this.
        let payloads = drive(&[
            "data: {",
            "data:   \"foo\": 1",
            "data: }",
            "",
        ]);
        assert_eq!(payloads, vec!["{\n  \"foo\": 1\n}".to_string()]);
    }

    #[test]
    fn test_sse_decoder_dispatches_two_events_separated_by_blank() {
        let payloads = drive(&[
            "data: {\"step\":1}",
            "",
            "data: {\"step\":2}",
            "",
        ]);
        assert_eq!(
            payloads,
            vec!["{\"step\":1}".to_string(), "{\"step\":2}".to_string(),]
        );
    }

    #[test]
    fn test_sse_decoder_flushes_final_event_without_blank_line() {
        // EOF flush: when the server closes the connection without
        // sending the trailing blank line, the buffered event must
        // still be dispatched. Mirrors the TS post-loop
        // `if (dataValue != null)` block.
        let payloads = drive(&["data: {\"step\":1}"]);
        assert_eq!(payloads, vec!["{\"step\":1}".to_string()]);
    }

    #[test]
    fn test_sse_decoder_blank_line_without_buffered_data_dispatches_nothing() {
        // Resetting on blank without a buffered `data:` must not
        // dispatch — an `event:` line followed by a blank line is
        // discarded entirely.
        let payloads = drive(&["event: ping", ""]);
        assert!(payloads.is_empty(), "got unexpected events: {payloads:?}");
    }

    #[test]
    fn test_decode_ndjson_emits_whole_line() {
        let cfg = StreamingConfig::Json { terminator: None };
        assert_eq!(
            decode_stream_event(&cfg, "{\"x\":1}"),
            StreamEvent::Event("{\"x\":1}".to_string())
        );
    }

    #[test]
    fn test_decode_ndjson_skips_blank_lines() {
        // Some servers emit blank keepalive lines between records.
        let cfg = StreamingConfig::Json { terminator: None };
        assert_eq!(decode_stream_event(&cfg, ""), StreamEvent::Skip);
    }

    #[test]
    fn test_decode_ndjson_terminator_only_when_configured() {
        // Without a configured terminator, a literal `[DONE]` payload
        // is just another event — NDJSON has no implicit sentinel.
        let no_term = StreamingConfig::Json { terminator: None };
        assert_eq!(
            decode_stream_event(&no_term, "[DONE]"),
            StreamEvent::Event("[DONE]".to_string())
        );
        let with_term = StreamingConfig::Json {
            terminator: Some("__END__".to_string()),
        };
        assert_eq!(
            decode_stream_event(&with_term, "__END__"),
            StreamEvent::Terminate
        );
    }

    #[test]
    fn test_decode_text_emits_each_line_verbatim() {
        // Plain-text format: no JSON parse, no SSE prefix strip, no
        // terminator. Each non-empty line flows through as a string.
        let cfg = StreamingConfig::Text;
        assert_eq!(
            decode_stream_event(&cfg, "hello world"),
            StreamEvent::Event("hello world".to_string())
        );
        assert_eq!(
            decode_stream_event(&cfg, "data: not stripped"),
            StreamEvent::Event("data: not stripped".to_string())
        );
        assert_eq!(
            decode_stream_event(&cfg, "{\"not\":\"parsed\"}"),
            StreamEvent::Event("{\"not\":\"parsed\"}".to_string())
        );
    }

    #[test]
    fn test_decode_text_skips_blank_lines() {
        // Mirrors the C# generator's
        // `if(!string.IsNullOrEmpty(line)) yield return line` guard.
        let cfg = StreamingConfig::Text;
        assert_eq!(decode_stream_event(&cfg, ""), StreamEvent::Skip);
    }

    #[test]
    fn test_project_text_event_bypasses_return_value_projection() {
        // Text streams emit a raw line; `x-fern-sdk-return-value`
        // and `--no-extract` are both no-ops because there's no
        // JSON object to project against.
        let cfg = StreamingConfig::Text;
        let value = project_stream_event(
            &cfg,
            "raw line",
            Some("$response.does.not.exist"),
            false,
            "test op",
        )
        .expect("text projection must succeed");
        assert_eq!(value, Value::String("raw line".to_string()));
    }
}

#[tokio::test]
async fn test_execute_method_dry_run() {
    let mut schemas = HashMap::new();
    let mut properties = HashMap::new();
    properties.insert(
        "name".to_string(),
        crate::openapi::discovery::JsonSchemaProperty {
            prop_type: Some("string".to_string()),
            ..Default::default()
        },
    );
    schemas.insert(
        "File".to_string(),
        crate::openapi::discovery::JsonSchema {
            schema_type: Some("object".to_string()),
            properties,
            ..Default::default()
        },
    );

    let doc = RestDescription {
        root_url: "https://example.googleapis.com/".to_string(),
        service_path: "v1/".to_string(),
        schemas,
        ..Default::default()
    };

    let mut parameters = HashMap::new();
    parameters.insert(
        "fileId".to_string(),
        crate::openapi::discovery::MethodParameter {
            location: Some("path".to_string()),
            required: true,
            ..Default::default()
        },
    );

    let method = RestMethod {
        http_method: "POST".to_string(),
        id: Some("example.files.create".to_string()),
        path: "files/{fileId}".to_string(),
        parameter_order: vec!["fileId".to_string()],
        parameters,
        request: Some(crate::openapi::discovery::SchemaRef {
            schema_ref: Some("File".to_string()),
            parameter_name: None,
        }),
        ..Default::default()
    };

    let params_json = r#"{"fileId": "123"}"#;
    let body_json = r#"{"name": "test.txt"}"#;

    let pagination = PaginationConfig::default();

    let http_config = crate::http::HttpConfig::new("test").unwrap();
    let result = execute_method(
        &doc,
        &method,
        Some(params_json),
        Some(body_json),
        &crate::auth::no_auth_provider(),
        None,
        None,
        None,
        true, // dry_run
        &pagination,
        &crate::formatter::OutputPipeline::default(),
        false,
        None,
        &http_config,
        false, // no_extract
        false, // no_retry
        false, // no_stream
        &[],
    )
    .await;

    assert!(result.is_ok());
}

#[tokio::test]
async fn test_execute_method_missing_path_param() {
    // Same setup but missing required fileId in params
    let mut parameters = HashMap::new();
    parameters.insert(
        "fileId".to_string(),
        crate::openapi::discovery::MethodParameter {
            location: Some("path".to_string()),
            required: true,
            ..Default::default()
        },
    );
    let doc = RestDescription::default();
    let method = RestMethod {
        http_method: "POST".to_string(),
        path: "files/{fileId}".to_string(),
        parameter_order: vec!["fileId".to_string()],
        parameters,
        ..Default::default()
    };

    let http_config = crate::http::HttpConfig::new("test").unwrap();
    let result = execute_method(
        &doc,
        &method,
        None, // No params provided
        None,
        &crate::auth::no_auth_provider(),
        None,
        None,
        None,
        true,
        &PaginationConfig::default(),
        &crate::formatter::OutputPipeline::default(),
        false,
        None,
        &http_config,
        false, // no_extract
        false, // no_retry
        false, // no_stream
        &[],
    )
    .await;

    assert!(result.is_err());
    assert!(result
        .unwrap_err()
        .to_string()
        .contains("Required path parameter"));
}

#[test]
fn test_get_value_type_helper() {
    assert_eq!(get_value_type(&json!(null)), "null");
    assert_eq!(get_value_type(&json!(true)), "boolean");
    assert_eq!(get_value_type(&json!(42)), "integer");
    assert_eq!(get_value_type(&json!(3.5)), "number (float)");
    assert_eq!(get_value_type(&json!("string")), "string");
    assert_eq!(get_value_type(&json!([1, 2])), "array");
    assert_eq!(get_value_type(&json!({"a": 1})), "object");
}

#[tokio::test]
async fn test_post_without_body_sets_content_length_zero() {
    let client = reqwest::Client::new();
    let method = RestMethod {
        http_method: "POST".to_string(),
        path: "messages/trash".to_string(),
        ..Default::default()
    };
    let input = ExecutionInput {
        full_url: "https://example.com/messages/trash".to_string(),
        body: None,
        query_params: Vec::new(),
        header_params: Vec::new(),
        is_upload: false,
    };

    let request = build_http_request(
        &client,
        &method,
        &input,
        &crate::auth::no_auth_provider(),
        &EndpointAuthMetadata::unspecified(),
        &PageState::Cursor(None),
        0,
        &None,
        None,
        &PaginationConfig::default(),
    )
    .await
    .unwrap();

    let built = request.build().unwrap();
    assert_eq!(
        built
            .headers()
            .get("Content-Length")
            .map(|v| v.to_str().unwrap()),
        Some("0"),
        "POST with no body must include Content-Length: 0"
    );
}

#[tokio::test]
async fn test_post_with_body_does_not_add_content_length_zero() {
    let client = reqwest::Client::new();
    let method = RestMethod {
        http_method: "POST".to_string(),
        path: "files".to_string(),
        ..Default::default()
    };
    let input = ExecutionInput {
        full_url: "https://example.com/files".to_string(),
        body: Some(json!({"name": "test"})),
        query_params: Vec::new(),
        header_params: Vec::new(),
        is_upload: false,
    };

    let request = build_http_request(
        &client,
        &method,
        &input,
        &crate::auth::no_auth_provider(),
        &EndpointAuthMetadata::unspecified(),
        &PageState::Cursor(None),
        0,
        &None,
        None,
        &PaginationConfig::default(),
    )
    .await
    .unwrap();

    let built = request.build().unwrap();
    // When body is present, Content-Length should NOT be "0"
    let cl = built
        .headers()
        .get("Content-Length")
        .map(|v| v.to_str().unwrap().to_string());
    assert!(cl.is_none() || cl.as_deref() != Some("0"));
}

#[tokio::test]
async fn test_get_does_not_set_content_length_zero() {
    let client = reqwest::Client::new();
    let method = RestMethod {
        http_method: "GET".to_string(),
        path: "files".to_string(),
        ..Default::default()
    };
    let input = ExecutionInput {
        full_url: "https://example.com/files".to_string(),
        body: None,
        query_params: Vec::new(),
        header_params: Vec::new(),
        is_upload: false,
    };

    let request = build_http_request(
        &client,
        &method,
        &input,
        &crate::auth::no_auth_provider(),
        &EndpointAuthMetadata::unspecified(),
        &PageState::Cursor(None),
        0,
        &None,
        None,
        &PaginationConfig::default(),
    )
    .await
    .unwrap();

    let built = request.build().unwrap();
    assert!(
        built.headers().get("Content-Length").is_none(),
        "GET with no body should not have Content-Length header"
    );
}

// ---------------------------------------------------------------------------
// BearerHeader auth method
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_bearer_header_sends_bearer_prefix() {
    use crate::openapi::discovery::RestMethod;

    let client = crate::http::HttpConfig::new("test").unwrap().build_client().unwrap();
    let method = RestMethod {
        http_method: "GET".to_string(),
        path: "/test".to_string(),
        ..Default::default()
    };
    let input = ExecutionInput {
        full_url: "https://example.com/test".to_string(),
        body: None,
        query_params: Vec::new(),
        header_params: Vec::new(),
        is_upload: false,
    };

    let provider: DynAuthProvider = std::sync::Arc::new(crate::auth::HeaderAuthProvider::new(
        "scheme",
        "X-Auth",
        crate::auth::AuthCredentialSource::literal("mytoken"),
        true,
    ));
    let request = build_http_request(
        &client,
        &method,
        &input,
        &provider,
        &EndpointAuthMetadata::unspecified(),
        &PageState::Cursor(None),
        0,
        &None,
        None,
        &PaginationConfig::default(),
    )
    .await
    .unwrap();

    let built = request.build().unwrap();
    let header_val = built.headers().get("x-auth").and_then(|v| v.to_str().ok());
    assert_eq!(header_val, Some("Bearer mytoken"));
}
