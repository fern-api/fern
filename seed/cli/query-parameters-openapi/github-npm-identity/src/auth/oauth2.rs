//! OAuth 2.0 auth provider with persistent token storage.
//!
//! [`OAuth2TokenProvider`] implements [`AuthProvider`] so it plugs directly into
//! the `auth_provider()` builder method on `CliApp`. On first `apply()`:
//!
//! 1. Check the on-disk credential cache (`~/.config/<cli>/credentials.json`).
//!    If a cached access token exists and hasn't expired, use it.
//! 2. If the cache holds a refresh token, exchange it for a new access token
//!    (RFC 6749 §6) and update the cache.
//! 3. Otherwise fall back to the configured grant (client credentials or
//!    refresh token from env) and persist the result.
//!
//! This mirrors the token persistence patterns used by `gcloud`, `gh`, and
//! `aws sso`. Tokens are stored as JSON with owner-only file permissions
//! (0600) and written atomically via temp-file-then-rename.
//!
//! For the async token fetch to work inside the synchronous `apply()`
//! method, the provider uses `tokio::task::block_in_place` +
//! `Handle::current().block_on()`. This is safe because `CliApp::run`
//! creates a multi-threaded tokio runtime.

use std::path::PathBuf;
use std::sync::{Mutex, OnceLock};

use secrecy::{ExposeSecret, SecretString};
use serde::Serialize;
use serde_json::{Map, Value};

use crate::auth::oauth2_contract::{OAuth2BodyEncoding, OAuth2Endpoint, OAuth2RequestLocation};
use crate::auth::oauth_common::{
    atomic_write, config_dir, now_epoch, parse_oauth_error_message, read_oauth_env,
    token_http_client, truncate_body, TokenBundle, TokenSuccessBody, EXPIRY_BUFFER_SECS,
};
use crate::auth::provider::{AuthProvider, EndpointAuthMetadata};
use crate::error::CliError;

// ---------------------------------------------------------------------------
// On-disk token cache
// ---------------------------------------------------------------------------

/// On-disk credential store at `~/.config/<cli_name>/credentials.json`.
///
/// The file is a JSON object keyed by token_url:
/// ```json
/// {
///   "https://identity.xero.com/connect/token": {
///     "access_token": "...",
///     "refresh_token": "...",
///     "expires_at": 1715550000
///   }
/// }
/// ```
///
/// Coexists with the newer `FileKeyringStore` (`auth-keyring.json` in the
/// same directory) — same shape, distinct file. Login-flow providers use
/// the keyring store; legacy `OAuth2TokenProvider` callers (e.g. `xero`)
/// continue to use this cache via `.with_cache(...)`.
#[derive(Debug, Clone)]
pub struct TokenCache {
    path: PathBuf,
}

type TokenMap = std::collections::HashMap<String, TokenBundle>;

impl TokenCache {
    /// Build a cache path at `~/.config/<cli_name>/credentials.json`.
    pub fn for_cli(cli_name: &str) -> Option<Self> {
        let dir = config_dir()?;
        Some(Self {
            path: dir.join(cli_name).join("credentials.json"),
        })
    }

    /// Build a cache at an explicit path (for testing).
    #[cfg(test)]
    fn at_path(path: PathBuf) -> Self {
        Self { path }
    }

    fn read_map(&self) -> TokenMap {
        let data = match std::fs::read_to_string(&self.path) {
            Ok(d) => d,
            Err(_) => return TokenMap::new(),
        };
        serde_json::from_str(&data).unwrap_or_default()
    }

    fn write_map(&self, map: &TokenMap) -> Result<(), CliError> {
        if let Some(parent) = self.path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| {
                CliError::Auth(format!(
                    "Failed to create token cache directory {}: {e}",
                    parent.display()
                ))
            })?;
        }

        let json = serde_json::to_string_pretty(map)
            .map_err(|e| CliError::Auth(format!("Failed to serialize token cache: {e}")))?;

        atomic_write(&self.path, json.as_bytes())
    }

    /// Load a non-expired cached token for the given token_url.
    fn load(&self, token_url: &str) -> Option<TokenBundle> {
        let map = self.read_map();
        let entry = map.get(token_url)?;
        if let Some(expires_at) = entry.expires_at {
            if now_epoch() >= expires_at {
                return None;
            }
        }
        Some(entry.clone())
    }

    /// Persist a token response to disk.
    fn store(
        &self,
        token_url: &str,
        access_token: &str,
        refresh_token: Option<&str>,
        expires_in: Option<u64>,
    ) -> Result<(), CliError> {
        let mut map = self.read_map();
        let expires_at = expires_in.map(|ei| {
            let buffered = ei.saturating_sub(EXPIRY_BUFFER_SECS);
            now_epoch() + buffered
        });
        // Preserve existing refresh_token if the new response didn't include one
        let prev_refresh = map.get(token_url).and_then(|e| e.refresh_token.clone());
        map.insert(
            token_url.to_string(),
            TokenBundle {
                access_token: access_token.to_string(),
                refresh_token: refresh_token.map(|s| s.to_string()).or(prev_refresh),
                expires_at,
            },
        );
        self.write_map(&map)
    }

    /// Remove the cached entry for a token_url (e.g., on refresh failure).
    fn remove(&self, token_url: &str) {
        let mut map = self.read_map();
        if map.remove(token_url).is_some() {
            let _ = self.write_map(&map);
        }
    }
}

// ---------------------------------------------------------------------------
// Grant configuration
// ---------------------------------------------------------------------------

/// Which OAuth2 grant type to use.
#[derive(Debug, Clone)]
pub enum OAuth2Grant {
    /// Client credentials grant (RFC 6749 §4.4).
    ClientCredentials {
        /// Env var name for the client ID.
        client_id_env: String,
        /// Env var name for the client secret.
        client_secret_env: String,
        /// Optional space-delimited scope string.
        scope: Option<String>,
    },
    /// Refresh token grant (RFC 6749 §6).
    RefreshToken {
        /// Env var name for the client ID.
        client_id_env: String,
        /// Env var name for the client secret.
        client_secret_env: String,
        /// Env var name for the refresh token.
        refresh_token_env: String,
    },
}

// ---------------------------------------------------------------------------
// Form bodies (serde)
// ---------------------------------------------------------------------------

#[derive(Serialize)]
struct ClientCredentialsForm<'a> {
    grant_type: &'static str,
    client_id: &'a str,
    client_secret: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    scope: Option<&'a str>,
}

#[derive(Serialize)]
struct RefreshTokenForm<'a> {
    grant_type: &'static str,
    client_id: &'a str,
    client_secret: &'a str,
    refresh_token: &'a str,
}

// ---------------------------------------------------------------------------
// Token fetch
// ---------------------------------------------------------------------------

struct TokenResponse {
    access_token: String,
    refresh_token: Option<String>,
    expires_in: Option<u64>,
}

async fn fetch_token(token_url: &str, grant: &OAuth2Grant) -> Result<TokenResponse, CliError> {
    if token_url.trim().is_empty() {
        return Err(CliError::Validation(
            "OAuth2: token_url must not be empty".to_string(),
        ));
    }

    let http = token_http_client()?;

    let response = match grant {
        OAuth2Grant::ClientCredentials {
            client_id_env,
            client_secret_env,
            scope,
        } => {
            let client_id = read_env(client_id_env, "client_id")?;
            let client_secret = read_env(client_secret_env, "client_secret")?;
            http.post(token_url)
                .form(&ClientCredentialsForm {
                    grant_type: "client_credentials",
                    client_id: &client_id,
                    client_secret: &client_secret,
                    scope: scope.as_deref(),
                })
                .send()
                .await
        }
        OAuth2Grant::RefreshToken {
            client_id_env,
            client_secret_env,
            refresh_token_env,
        } => {
            let client_id = read_env(client_id_env, "client_id")?;
            let client_secret = read_env(client_secret_env, "client_secret")?;
            let refresh_token = read_env(refresh_token_env, "refresh_token")?;
            http.post(token_url)
                .form(&RefreshTokenForm {
                    grant_type: "refresh_token",
                    client_id: &client_id,
                    client_secret: &client_secret,
                    refresh_token: &refresh_token,
                })
                .send()
                .await
        }
    }
    .map_err(|e| CliError::Auth(format!("OAuth2 token request failed: {e}")))?;

    parse_token_response(response).await
}

/// Exchange a cached refresh token for a new access token.
async fn refresh_cached_token(
    token_url: &str,
    client_id: &str,
    client_secret: &str,
    refresh_token: &str,
) -> Result<TokenResponse, CliError> {
    let http = token_http_client()?;
    let response = http
        .post(token_url)
        .form(&RefreshTokenForm {
            grant_type: "refresh_token",
            client_id,
            client_secret,
            refresh_token,
        })
        .send()
        .await
        .map_err(|e| CliError::Auth(format!("OAuth2 token refresh failed: {e}")))?;
    parse_token_response(response).await
}

async fn parse_token_response(response: reqwest::Response) -> Result<TokenResponse, CliError> {
    let status = response.status();
    let body_text = response
        .text()
        .await
        .map_err(|e| CliError::Auth(format!("OAuth2 token response body: {e}")))?;

    if !status.is_success() {
        let detail =
            parse_oauth_error_message(&body_text).unwrap_or_else(|| truncate_body(&body_text));
        return Err(CliError::Auth(format!(
            "OAuth2 token endpoint returned HTTP {status}: {detail}"
        )));
    }

    let parsed: TokenSuccessBody = serde_json::from_str(&body_text).map_err(|e| {
        CliError::Auth(format!(
            "OAuth2 token response is not valid JSON with access_token: {e}"
        ))
    })?;

    if parsed.access_token.is_empty() {
        return Err(CliError::Auth(
            "OAuth2 token response contained an empty access_token".to_string(),
        ));
    }

    Ok(TokenResponse {
        access_token: parsed.access_token,
        refresh_token: parsed.refresh_token,
        expires_in: parsed.expires_in,
    })
}

fn read_env(var: &str, label: &str) -> Result<String, CliError> {
    read_oauth_env(var, true, label)?.ok_or_else(|| {
        CliError::Auth(format!(
            "Environment variable {var} (OAuth2 {label}) must be non-empty"
        ))
    })
}

#[derive(Debug, Clone)]
struct OAuth2ClientCredentialsContract {
    client_id_env: String,
    client_secret_env: String,
    scopes: Vec<String>,
    token_endpoint: OAuth2Endpoint,
    refresh_endpoint: Option<OAuth2Endpoint>,
}

async fn execute_contract_endpoint(
    endpoint: &OAuth2Endpoint,
    base_url_override: Option<&str>,
    client_id: &str,
    client_secret: &str,
    scopes: &[String],
    refresh_token: Option<&str>,
) -> Result<TokenResponse, CliError> {
    let url = endpoint.resolve_url(base_url_override);
    let method = reqwest::Method::from_bytes(endpoint.method.as_bytes()).map_err(|error| {
        CliError::Auth(format!(
            "OAuth2 token endpoint has invalid HTTP method '{}': {error}",
            endpoint.method
        ))
    })?;
    let http = token_http_client()?;
    let mut request = http.request(method, &url);
    let mut body = Map::new();
    let mut query = Vec::new();

    for property in &endpoint.request_properties {
        let Some(value) =
            property
                .value
                .resolve(client_id, client_secret, scopes, refresh_token)?
        else {
            continue;
        };
        match &property.location {
            OAuth2RequestLocation::Body(path) => {
                set_nested_value(&mut body, path, value)?;
            }
            OAuth2RequestLocation::Query {
                name,
                allow_multiple,
            } => {
                if *allow_multiple {
                    if let Value::Array(values) = value {
                        query.extend(
                            values
                                .iter()
                                .map(|value| (name.clone(), value_to_wire_string(value))),
                        );
                    } else {
                        query.push((name.clone(), value_to_wire_string(&value)));
                    }
                } else {
                    query.push((name.clone(), value_to_wire_string(&value)));
                }
            }
        }
    }

    if !query.is_empty() {
        request = request.query(&query);
    }
    request =
        match &endpoint.body_encoding {
            OAuth2BodyEncoding::None => request,
            OAuth2BodyEncoding::Json(content_type) => request
                .header(reqwest::header::CONTENT_TYPE, content_type)
                .body(serde_json::to_vec(&Value::Object(body)).map_err(|error| {
                    CliError::Auth(format!("OAuth2 token request body: {error}"))
                })?),
            OAuth2BodyEncoding::Form => {
                let form = body
                    .into_iter()
                    .map(|(name, value)| (name, value_to_wire_string(&value)))
                    .collect::<Vec<_>>();
                request.form(&form)
            }
        };

    let response = request
        .send()
        .await
        .map_err(|error| CliError::Auth(format!("OAuth2 token request failed: {error}")))?;
    parse_contract_response(response, endpoint).await
}

async fn parse_contract_response(
    response: reqwest::Response,
    endpoint: &OAuth2Endpoint,
) -> Result<TokenResponse, CliError> {
    let status = response.status();
    let body_text = response
        .text()
        .await
        .map_err(|error| CliError::Auth(format!("OAuth2 token response body: {error}")))?;
    if !status.is_success() {
        let detail =
            parse_oauth_error_message(&body_text).unwrap_or_else(|| truncate_body(&body_text));
        return Err(CliError::Auth(format!(
            "OAuth2 token endpoint returned HTTP {status}: {detail}"
        )));
    }
    let body: Value = serde_json::from_str(&body_text).map_err(|error| {
        CliError::Auth(format!("OAuth2 token response is not valid JSON: {error}"))
    })?;
    let access_token = value_at_path(&body, &endpoint.access_token_path)
        .and_then(Value::as_str)
        .filter(|token| !token.is_empty())
        .ok_or_else(|| {
            CliError::Auth(format!(
                "OAuth2 token response is missing a non-empty access token at '{}'",
                endpoint.access_token_path.join(".")
            ))
        })?
        .to_string();
    let expires_in = endpoint
        .expires_in_path
        .as_deref()
        .and_then(|path| value_at_path(&body, path))
        .and_then(parse_u64);
    let refresh_token = endpoint
        .refresh_token_path
        .as_deref()
        .and_then(|path| value_at_path(&body, path))
        .and_then(Value::as_str)
        .filter(|token| !token.is_empty())
        .map(str::to_string);
    Ok(TokenResponse {
        access_token,
        refresh_token,
        expires_in,
    })
}

fn set_nested_value(
    body: &mut Map<String, Value>,
    path: &[String],
    value: Value,
) -> Result<(), CliError> {
    let Some((last, parents)) = path.split_last() else {
        return Err(CliError::Auth(
            "OAuth2 token request property has an empty body path".to_string(),
        ));
    };
    let mut current = body;
    for part in parents {
        let entry = current
            .entry(part.clone())
            .or_insert_with(|| Value::Object(Map::new()));
        current = entry.as_object_mut().ok_or_else(|| {
            CliError::Auth(format!(
                "OAuth2 token request body path '{}' conflicts with another property",
                path.join(".")
            ))
        })?;
    }
    current.insert(last.clone(), value);
    Ok(())
}

fn value_to_wire_string(value: &Value) -> String {
    match value {
        Value::String(value) => value.clone(),
        Value::Array(values) => values
            .iter()
            .map(value_to_wire_string)
            .collect::<Vec<_>>()
            .join(" "),
        other => other.to_string(),
    }
}

fn value_at_path<'a>(value: &'a Value, path: &[String]) -> Option<&'a Value> {
    path.iter()
        .try_fold(value, |current, segment| current.get(segment))
}

fn parse_u64(value: &Value) -> Option<u64> {
    value
        .as_u64()
        .or_else(|| value.as_str().and_then(|value| value.parse().ok()))
}

// ---------------------------------------------------------------------------
// OAuth2TokenProvider
// ---------------------------------------------------------------------------

/// OAuth2 auth provider with on-disk token persistence.
///
/// Resolution order on each `apply()`:
/// 1. In-process cache (`OnceLock`) — already resolved this invocation.
/// 2. On-disk cache — non-expired access token from a previous invocation.
/// 3. Cached refresh token — exchange for a new access token.
/// 4. Configured grant (client credentials or env-based refresh token).
///
/// New tokens are persisted to `~/.config/<cli>/credentials.json` (Linux),
/// `~/Library/Application Support/<cli>/credentials.json` (macOS), or
/// `%APPDATA%/<cli>/credentials.json` (Windows).
pub struct OAuth2TokenProvider {
    scheme_name: String,
    token_url: String,
    grant: OAuth2Grant,
    contract: Option<OAuth2ClientCredentialsContract>,
    token_header: String,
    token_prefix: String,
    cache: OnceLock<TokenCache>,
    cached_tokens: Mutex<TokenMap>,
}

impl std::fmt::Debug for OAuth2TokenProvider {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("OAuth2TokenProvider")
            .field("scheme_name", &self.scheme_name)
            .field("token_url", &self.token_url)
            .field("grant", &self.grant)
            .field("contract", &self.contract)
            .field("token_header", &self.token_header)
            .field("token_prefix", &self.token_prefix)
            .finish()
    }
}

impl OAuth2TokenProvider {
    pub fn new(
        scheme_name: impl Into<String>,
        token_url: impl Into<String>,
        grant: OAuth2Grant,
    ) -> Self {
        Self {
            scheme_name: scheme_name.into(),
            token_url: token_url.into(),
            grant,
            contract: None,
            token_header: "Authorization".to_string(),
            token_prefix: "Bearer".to_string(),
            cache: OnceLock::new(),
            cached_tokens: Mutex::new(TokenMap::new()),
        }
    }

    pub fn from_client_credentials(
        scheme_name: impl Into<String>,
        client_id_env: impl Into<String>,
        client_secret_env: impl Into<String>,
        scopes: Vec<String>,
        token_endpoint: OAuth2Endpoint,
        refresh_endpoint: Option<OAuth2Endpoint>,
        token_header: impl Into<String>,
        token_prefix: impl Into<String>,
    ) -> Self {
        let client_id_env = client_id_env.into();
        let client_secret_env = client_secret_env.into();
        Self {
            scheme_name: scheme_name.into(),
            token_url: token_endpoint.default_url.clone(),
            grant: OAuth2Grant::ClientCredentials {
                client_id_env: client_id_env.clone(),
                client_secret_env: client_secret_env.clone(),
                scope: if scopes.is_empty() {
                    None
                } else {
                    Some(scopes.join(" "))
                },
            },
            contract: Some(OAuth2ClientCredentialsContract {
                client_id_env,
                client_secret_env,
                scopes,
                token_endpoint,
                refresh_endpoint,
            }),
            token_header: token_header.into(),
            token_prefix: token_prefix.into(),
            cache: OnceLock::new(),
            cached_tokens: Mutex::new(TokenMap::new()),
        }
    }

    pub fn with_token_application(
        mut self,
        header: impl Into<String>,
        prefix: impl Into<String>,
    ) -> Self {
        self.token_header = header.into();
        self.token_prefix = prefix.into();
        self
    }

    /// Enable on-disk token persistence. `cli_name` is the binary name
    /// (e.g., `"xero"`) — tokens are stored under the platform config dir.
    pub fn with_cache(self, cli_name: &str) -> Self {
        if let Some(tc) = TokenCache::for_cli(cli_name) {
            let _ = self.cache.set(tc);
        }
        self
    }

    /// Enable on-disk token persistence with a pre-built [`TokenCache`].
    pub fn with_token_cache(self, cache: TokenCache) -> Self {
        let _ = self.cache.set(cache);
        self
    }

    /// Returns `true` if on-disk token caching has been wired.
    pub fn has_cache(&self) -> bool {
        self.cache.get().is_some()
    }

    fn resolve_token(&self, endpoint: &EndpointAuthMetadata) -> Result<SecretString, CliError> {
        tokio::task::block_in_place(|| {
            tokio::runtime::Handle::current()
                .block_on(self.resolve_token_async(endpoint))
                .map(SecretString::from)
        })
    }

    async fn resolve_token_async(
        &self,
        endpoint: &EndpointAuthMetadata,
    ) -> Result<String, CliError> {
        let token_url = self.resolved_token_url(endpoint);
        if let Some(cached) = self.load_in_process(&token_url) {
            return Ok(cached.access_token);
        }
        if let Some(token) = self.try_in_process_refresh(endpoint, &token_url).await {
            return Ok(token);
        }

        if let Some(cache) = self.cache.get() {
            if let Some(cached) = cache.load(&token_url) {
                tracing::debug!("Using cached OAuth2 access token for {}", token_url);
                self.store_in_process(&token_url, cached.clone());
                return Ok(cached.access_token);
            }

            if let Some(token_resp) = self.try_cached_refresh(cache, endpoint, &token_url).await {
                return Ok(token_resp);
            }
        }

        let resp = self.fetch_configured_token(endpoint, &token_url).await?;
        self.persist_response(&token_url, &resp);
        Ok(resp.access_token)
    }

    async fn try_in_process_refresh(
        &self,
        endpoint: &EndpointAuthMetadata,
        token_url: &str,
    ) -> Option<String> {
        let refresh_token = self
            .cached_tokens
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .get(token_url)
            .and_then(|entry| entry.refresh_token.clone())?;
        let contract = self.contract.as_ref()?;
        let refresh_endpoint = contract.refresh_endpoint.as_ref()?;
        let client_id = read_env(&contract.client_id_env, "client_id").ok()?;
        let client_secret = read_env(&contract.client_secret_env, "client_secret").ok()?;
        match execute_contract_endpoint(
            refresh_endpoint,
            endpoint.base_url_override.as_deref(),
            &client_id,
            &client_secret,
            &contract.scopes,
            Some(&refresh_token),
        )
        .await
        {
            Ok(resp) => {
                self.persist_response(token_url, &resp);
                Some(resp.access_token)
            }
            Err(error) => {
                tracing::debug!("In-process OAuth2 refresh failed, falling through: {error}");
                self.cached_tokens
                    .lock()
                    .unwrap_or_else(|poisoned| poisoned.into_inner())
                    .remove(token_url);
                None
            }
        }
    }

    async fn try_cached_refresh(
        &self,
        cache: &TokenCache,
        endpoint: &EndpointAuthMetadata,
        token_url: &str,
    ) -> Option<String> {
        let map = cache.read_map();
        let entry = map.get(token_url)?;
        let refresh_token = entry.refresh_token.as_deref()?;

        let result = if let Some(contract) = &self.contract {
            let refresh_endpoint = contract.refresh_endpoint.as_ref()?;
            let client_id = read_env(&contract.client_id_env, "client_id").ok()?;
            let client_secret = read_env(&contract.client_secret_env, "client_secret").ok()?;
            execute_contract_endpoint(
                refresh_endpoint,
                endpoint.base_url_override.as_deref(),
                &client_id,
                &client_secret,
                &contract.scopes,
                Some(refresh_token),
            )
            .await
        } else {
            let (client_id_env, client_secret_env) = grant_credential_envs(&self.grant);
            let client_id = read_env(client_id_env, "client_id").ok()?;
            let client_secret = read_env(client_secret_env, "client_secret").ok()?;
            refresh_cached_token(token_url, &client_id, &client_secret, refresh_token).await
        };

        match result {
            Ok(resp) => {
                self.persist_response(token_url, &resp);
                Some(resp.access_token)
            }
            Err(e) => {
                tracing::debug!("Cached refresh token failed, falling through: {e}");
                cache.remove(token_url);
                self.cached_tokens
                    .lock()
                    .unwrap_or_else(|poisoned| poisoned.into_inner())
                    .remove(token_url);
                None
            }
        }
    }

    async fn fetch_configured_token(
        &self,
        endpoint: &EndpointAuthMetadata,
        token_url: &str,
    ) -> Result<TokenResponse, CliError> {
        if let Some(contract) = &self.contract {
            let client_id = read_env(&contract.client_id_env, "client_id")?;
            let client_secret = read_env(&contract.client_secret_env, "client_secret")?;
            execute_contract_endpoint(
                &contract.token_endpoint,
                endpoint.base_url_override.as_deref(),
                &client_id,
                &client_secret,
                &contract.scopes,
                None,
            )
            .await
        } else {
            fetch_token(token_url, &self.grant).await
        }
    }

    fn resolved_token_url(&self, endpoint: &EndpointAuthMetadata) -> String {
        self.contract
            .as_ref()
            .map(|contract| {
                contract
                    .token_endpoint
                    .resolve_url(endpoint.base_url_override.as_deref())
            })
            .unwrap_or_else(|| self.token_url.clone())
    }

    fn load_in_process(&self, token_url: &str) -> Option<TokenBundle> {
        let map = self
            .cached_tokens
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        let entry = map.get(token_url)?;
        if entry
            .expires_at
            .is_some_and(|expires_at| now_epoch() >= expires_at)
        {
            return None;
        }
        Some(entry.clone())
    }

    fn store_in_process(&self, token_url: &str, bundle: TokenBundle) {
        self.cached_tokens
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .insert(token_url.to_string(), bundle);
    }

    fn persist_response(&self, token_url: &str, resp: &TokenResponse) {
        let expires_at = resp
            .expires_in
            .map(|expires_in| now_epoch() + expires_in.saturating_sub(EXPIRY_BUFFER_SECS));
        let previous_refresh = self
            .cached_tokens
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .get(token_url)
            .and_then(|entry| entry.refresh_token.clone());
        self.store_in_process(
            token_url,
            TokenBundle {
                access_token: resp.access_token.clone(),
                refresh_token: resp.refresh_token.clone().or(previous_refresh),
                expires_at,
            },
        );
        if let Some(cache) = self.cache.get() {
            if let Err(e) = cache.store(
                token_url,
                &resp.access_token,
                resp.refresh_token.as_deref(),
                resp.expires_in,
            ) {
                tracing::warn!("Failed to persist OAuth2 token to cache: {e}");
            }
        }
    }
}

fn grant_credential_envs(grant: &OAuth2Grant) -> (&str, &str) {
    match grant {
        OAuth2Grant::ClientCredentials {
            client_id_env,
            client_secret_env,
            ..
        }
        | OAuth2Grant::RefreshToken {
            client_id_env,
            client_secret_env,
            ..
        } => (client_id_env, client_secret_env),
    }
}

impl AuthProvider for OAuth2TokenProvider {
    fn name(&self) -> &str {
        &self.scheme_name
    }

    fn has_credentials(&self) -> bool {
        self.has_credentials_for_url(&self.token_url)
    }

    fn has_credentials_for(&self, endpoint: &EndpointAuthMetadata) -> bool {
        self.has_credentials_for_url(&self.resolved_token_url(endpoint))
    }

    fn credential_hints(&self) -> Vec<String> {
        if let Some(contract) = &self.contract {
            let mut env_vars = vec![
                contract.client_id_env.as_str(),
                contract.client_secret_env.as_str(),
            ];
            env_vars.extend(contract.token_endpoint.required_env_vars());
            if let Some(refresh_endpoint) = &contract.refresh_endpoint {
                env_vars.extend(refresh_endpoint.required_env_vars());
            }
            env_vars.sort_unstable();
            env_vars.dedup();
            return env_vars
                .into_iter()
                .map(|env_var| format!("{env_var} environment variable"))
                .collect();
        }
        match &self.grant {
            OAuth2Grant::ClientCredentials {
                client_id_env,
                client_secret_env,
                ..
            } => vec![
                format!("{client_id_env} environment variable"),
                format!("{client_secret_env} environment variable"),
            ],
            OAuth2Grant::RefreshToken {
                client_id_env,
                client_secret_env,
                refresh_token_env,
            } => vec![
                format!("{client_id_env} environment variable"),
                format!("{client_secret_env} environment variable"),
                format!("{refresh_token_env} environment variable"),
            ],
        }
    }

    fn apply(
        &self,
        request: reqwest::RequestBuilder,
        endpoint: &EndpointAuthMetadata,
    ) -> Result<reqwest::RequestBuilder, CliError> {
        let token = self.resolve_token(endpoint)?;
        let exposed = token.expose_secret();
        let value = if self.token_prefix.is_empty() {
            exposed.to_string()
        } else {
            format!("{} {exposed}", self.token_prefix)
        };
        let header_name = reqwest::header::HeaderName::from_bytes(self.token_header.as_bytes())
            .map_err(|error| {
                CliError::Auth(format!(
                    "Invalid OAuth2 token header '{}': {error}",
                    self.token_header
                ))
            })?;
        let mut header = reqwest::header::HeaderValue::from_str(&value)
            .map_err(|error| CliError::Auth(format!("Invalid OAuth2 access token: {error}")))?;
        header.set_sensitive(true);
        Ok(request.header(header_name, header))
    }

    fn inject_token_cache(&self, cli_name: &str) {
        if let Some(tc) = TokenCache::for_cli(cli_name) {
            let _ = self.cache.set(tc);
        }
    }
}

impl OAuth2TokenProvider {
    fn has_credentials_for_url(&self, token_url: &str) -> bool {
        if self.load_in_process(token_url).is_some() {
            return true;
        }
        if let Some(cache) = self.cache.get() {
            if cache.load(token_url).is_some() {
                return true;
            }
            let map = cache.read_map();
            if let Some(entry) = map.get(token_url) {
                if entry.refresh_token.is_some()
                    && self
                        .contract
                        .as_ref()
                        .is_some_and(|contract| contract.refresh_endpoint.is_some())
                {
                    return true;
                }
            }
        }
        if let Some(contract) = &self.contract {
            return env_is_set(&contract.client_id_env)
                && env_is_set(&contract.client_secret_env)
                && contract.token_endpoint.required_env_vars().all(env_is_set);
        }
        match &self.grant {
            OAuth2Grant::ClientCredentials {
                client_id_env,
                client_secret_env,
                ..
            } => env_is_set(client_id_env) && env_is_set(client_secret_env),
            OAuth2Grant::RefreshToken {
                client_id_env,
                client_secret_env,
                refresh_token_env,
            } => {
                env_is_set(client_id_env)
                    && env_is_set(client_secret_env)
                    && env_is_set(refresh_token_env)
            }
        }
    }
}

fn env_is_set(var: &str) -> bool {
    std::env::var(var)
        .map(|v| !v.trim().is_empty())
        .unwrap_or(false)
}

/// Fail-fast provider for an OAuth2 scheme that was declared (via
/// [`OAuth2Auth`](crate::auth::OAuth2Auth)) but is missing the config needed
/// to obtain a token — e.g. no `token_url`, or client credentials supplied
/// from a non-env source the [`OAuth2Grant`] env-var model can't read.
///
/// The point is to **never silently send an unauthenticated request**
/// (FER-10745). [`has_credentials`](AuthProvider::has_credentials) returns
/// `true` so composition wrappers select this provider rather than skipping
/// it, and [`apply`](AuthProvider::apply) then errors with a clear message
/// instead of letting the request go out with no `Authorization` header.
#[derive(Debug)]
pub(crate) struct MisconfiguredOAuth2Provider {
    scheme_name: String,
    reason: String,
}

impl MisconfiguredOAuth2Provider {
    pub(crate) fn new(scheme_name: impl Into<String>, reason: impl Into<String>) -> Self {
        Self {
            scheme_name: scheme_name.into(),
            reason: reason.into(),
        }
    }
}

impl AuthProvider for MisconfiguredOAuth2Provider {
    fn name(&self) -> &str {
        &self.scheme_name
    }

    // Report credentials as present so wrappers don't skip this provider
    // (skipping would fall through to an unauthenticated request — the bug).
    fn has_credentials(&self) -> bool {
        true
    }

    fn credential_hints(&self) -> Vec<String> {
        vec![self.reason.clone()]
    }

    fn apply(
        &self,
        _request: reqwest::RequestBuilder,
        _endpoint: &EndpointAuthMetadata,
    ) -> Result<reqwest::RequestBuilder, CliError> {
        Err(CliError::Auth(format!(
            "OAuth2 scheme '{}' is configured but cannot obtain a token: {}. \
             Refusing to send an unauthenticated request.",
            self.scheme_name, self.reason,
        )))
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::auth::oauth2_contract::{OAuth2RequestProperty, OAuth2RequestValue};
    use crate::auth::test_helpers::{auth_header, header as request_header, req};
    use serial_test::serial;
    use wiremock::matchers::{body_json, body_string_contains, method, path, query_param};
    use wiremock::{Mock, MockServer, ResponseTemplate};

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn client_credentials_fetches_and_caches_token() {
        let server = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/token"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "access_token": "cc-token-123",
                "token_type": "Bearer"
            })))
            .expect(1)
            .mount(&server)
            .await;

        std::env::set_var("TEST_CC_ID", "my-id");
        std::env::set_var("TEST_CC_SECRET", "my-secret");

        let provider = OAuth2TokenProvider::new(
            "oauth2",
            format!("{}/token", server.uri()),
            OAuth2Grant::ClientCredentials {
                client_id_env: "TEST_CC_ID".to_string(),
                client_secret_env: "TEST_CC_SECRET".to_string(),
                scope: None,
            },
        );

        assert!(provider.has_credentials());

        let r = provider
            .apply(req(), &EndpointAuthMetadata::unspecified())
            .unwrap();
        assert_eq!(auth_header(r).as_deref(), Some("Bearer cc-token-123"));

        // Second call uses in-process cache (wiremock expect(1) would fail otherwise)
        let r2 = provider
            .apply(req(), &EndpointAuthMetadata::unspecified())
            .unwrap();
        assert_eq!(auth_header(r2).as_deref(), Some("Bearer cc-token-123"));

        std::env::remove_var("TEST_CC_ID");
        std::env::remove_var("TEST_CC_SECRET");
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn ir_contract_executes_custom_request_and_response_mappings() {
        let server = MockServer::start().await;
        Mock::given(method("PUT"))
            .and(path("/oauth/token"))
            .and(query_param("audience", "api"))
            .and(query_param("region", "us"))
            .and(query_param("region", "eu"))
            .and(body_json(serde_json::json!({
                "credentials": {
                    "id": "contract-id",
                    "secret": "contract-secret"
                },
                "permissions": ["read:pets", "write:pets"],
                "grant_type": "client_credentials",
                "tenant": "fern"
            })))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "result": {
                    "token": "mapped-token",
                    "ttl": "3600"
                }
            })))
            .expect(1)
            .mount(&server)
            .await;

        std::env::set_var("TEST_CONTRACT_ID", "contract-id");
        std::env::set_var("TEST_CONTRACT_SECRET", "contract-secret");
        std::env::set_var("TEST_CONTRACT_GRANT", "client_credentials");
        std::env::set_var("TEST_CONTRACT_TENANT", "fern");

        let endpoint = OAuth2Endpoint::new(format!("{}/oauth/token", server.uri()), "/oauth/token")
            .method("PUT")
            .json_body("application/json")
            .request_property(OAuth2RequestProperty::body(
                ["credentials", "id"],
                OAuth2RequestValue::ClientId,
            ))
            .request_property(OAuth2RequestProperty::body(
                ["credentials", "secret"],
                OAuth2RequestValue::ClientSecret,
            ))
            .request_property(OAuth2RequestProperty::body(
                ["permissions"],
                OAuth2RequestValue::ScopesList,
            ))
            .request_property(OAuth2RequestProperty::body(
                ["grant_type"],
                OAuth2RequestValue::env("TEST_CONTRACT_GRANT", true),
            ))
            .request_property(OAuth2RequestProperty::body(
                ["tenant"],
                OAuth2RequestValue::env("TEST_CONTRACT_TENANT", false),
            ))
            .request_property(OAuth2RequestProperty::query(
                "audience",
                OAuth2RequestValue::literal(serde_json::json!("api")),
            ))
            .request_property(OAuth2RequestProperty::query_multiple(
                "region",
                OAuth2RequestValue::literal(serde_json::json!(["us", "eu"])),
            ))
            .request_property(OAuth2RequestProperty::query(
                "hint",
                OAuth2RequestValue::optional_env("TEST_CONTRACT_HINT", false),
            ))
            .access_token_path(["result", "token"])
            .expires_in_path(["result", "ttl"]);
        let provider = OAuth2TokenProvider::from_client_credentials(
            "oauth2",
            "TEST_CONTRACT_ID",
            "TEST_CONTRACT_SECRET",
            vec!["read:pets".to_string(), "write:pets".to_string()],
            endpoint,
            None,
            "X-Session-Token",
            "",
        );

        let request = provider
            .apply(req(), &EndpointAuthMetadata::unspecified())
            .unwrap();
        assert_eq!(
            request_header(request, "x-session-token").as_deref(),
            Some("mapped-token")
        );

        std::env::remove_var("TEST_CONTRACT_ID");
        std::env::remove_var("TEST_CONTRACT_SECRET");
        std::env::remove_var("TEST_CONTRACT_GRANT");
        std::env::remove_var("TEST_CONTRACT_TENANT");
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn ir_contract_uses_runtime_base_url_override() {
        let server = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/token"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "access_token": "override-token"
            })))
            .expect(1)
            .mount(&server)
            .await;

        std::env::set_var("TEST_OVERRIDE_ID", "id");
        std::env::set_var("TEST_OVERRIDE_SECRET", "secret");
        let endpoint = OAuth2Endpoint::new("https://default.invalid/token", "/token")
            .use_base_url_override()
            .form_body()
            .request_property(OAuth2RequestProperty::body(
                ["client_id"],
                OAuth2RequestValue::ClientId,
            ))
            .request_property(OAuth2RequestProperty::body(
                ["client_secret"],
                OAuth2RequestValue::ClientSecret,
            ));
        let provider = OAuth2TokenProvider::from_client_credentials(
            "oauth2",
            "TEST_OVERRIDE_ID",
            "TEST_OVERRIDE_SECRET",
            Vec::new(),
            endpoint,
            None,
            "Authorization",
            "Bearer",
        );
        let metadata =
            EndpointAuthMetadata::unspecified().with_base_url_override(Some(&server.uri()));
        let request = provider.apply(req(), &metadata).unwrap();
        assert_eq!(
            auth_header(request).as_deref(),
            Some("Bearer override-token")
        );

        std::env::remove_var("TEST_OVERRIDE_ID");
        std::env::remove_var("TEST_OVERRIDE_SECRET");
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn ir_contract_refreshes_with_distinct_endpoint() {
        let server = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/token"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "access_token": "initial-token",
                "refresh_token": "refresh-me",
                "expires_in": 1
            })))
            .expect(1)
            .mount(&server)
            .await;
        Mock::given(method("POST"))
            .and(path("/refresh"))
            .and(body_json(serde_json::json!({
                "refresh": "refresh-me",
                "grant_type": "refresh_token"
            })))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "access_token": "refreshed-token",
                "expires_in": 3600
            })))
            .expect(1)
            .mount(&server)
            .await;

        std::env::set_var("TEST_REFRESH_ID", "id");
        std::env::set_var("TEST_REFRESH_SECRET", "secret");
        let token_endpoint = OAuth2Endpoint::new(format!("{}/token", server.uri()), "/token")
            .json_body("application/json")
            .request_property(OAuth2RequestProperty::body(
                ["client_id"],
                OAuth2RequestValue::ClientId,
            ))
            .request_property(OAuth2RequestProperty::body(
                ["client_secret"],
                OAuth2RequestValue::ClientSecret,
            ))
            .expires_in_path(["expires_in"])
            .refresh_token_path(["refresh_token"]);
        let refresh_endpoint = OAuth2Endpoint::new(format!("{}/refresh", server.uri()), "/refresh")
            .json_body("application/json")
            .request_property(OAuth2RequestProperty::body(
                ["refresh"],
                OAuth2RequestValue::RefreshToken,
            ))
            .request_property(OAuth2RequestProperty::body(
                ["grant_type"],
                OAuth2RequestValue::literal(serde_json::json!("refresh_token")),
            ))
            .expires_in_path(["expires_in"]);
        let provider = OAuth2TokenProvider::from_client_credentials(
            "oauth2",
            "TEST_REFRESH_ID",
            "TEST_REFRESH_SECRET",
            Vec::new(),
            token_endpoint,
            Some(refresh_endpoint),
            "Authorization",
            "Bearer",
        );
        let first = provider
            .apply(req(), &EndpointAuthMetadata::unspecified())
            .unwrap();
        assert_eq!(auth_header(first).as_deref(), Some("Bearer initial-token"));
        let second = provider
            .apply(req(), &EndpointAuthMetadata::unspecified())
            .unwrap();
        assert_eq!(
            auth_header(second).as_deref(),
            Some("Bearer refreshed-token")
        );

        std::env::remove_var("TEST_REFRESH_ID");
        std::env::remove_var("TEST_REFRESH_SECRET");
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn client_credentials_sends_requested_scopes() {
        let server = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/token"))
            .and(body_string_contains("scope=read+write"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "access_token": "scoped-token",
                "token_type": "Bearer"
            })))
            .expect(1)
            .mount(&server)
            .await;

        std::env::set_var("TEST_SCOPE_ID", "my-id");
        std::env::set_var("TEST_SCOPE_SECRET", "my-secret");

        let provider = OAuth2TokenProvider::new(
            "oauth2",
            format!("{}/token", server.uri()),
            OAuth2Grant::ClientCredentials {
                client_id_env: "TEST_SCOPE_ID".to_string(),
                client_secret_env: "TEST_SCOPE_SECRET".to_string(),
                scope: Some("read write".to_string()),
            },
        );

        let request = provider
            .apply(req(), &EndpointAuthMetadata::unspecified())
            .unwrap();
        assert_eq!(auth_header(request).as_deref(), Some("Bearer scoped-token"));

        std::env::remove_var("TEST_SCOPE_ID");
        std::env::remove_var("TEST_SCOPE_SECRET");
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn client_credentials_no_creds_when_env_unset() {
        std::env::remove_var("MISSING_CC_ID_XYZ");
        std::env::remove_var("MISSING_CC_SECRET_XYZ");

        let provider = OAuth2TokenProvider::new(
            "oauth2",
            "https://unused.example.com/token",
            OAuth2Grant::ClientCredentials {
                client_id_env: "MISSING_CC_ID_XYZ".to_string(),
                client_secret_env: "MISSING_CC_SECRET_XYZ".to_string(),
                scope: None,
            },
        );

        assert!(!provider.has_credentials());
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn refresh_token_fetches_token() {
        let server = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/token"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "access_token": "refreshed-token-456",
                "token_type": "Bearer"
            })))
            .expect(1)
            .mount(&server)
            .await;

        std::env::set_var("TEST_RT_ID", "my-id");
        std::env::set_var("TEST_RT_SECRET", "my-secret");
        std::env::set_var("TEST_RT_REFRESH", "my-refresh-token");

        let provider = OAuth2TokenProvider::new(
            "oauth2",
            format!("{}/token", server.uri()),
            OAuth2Grant::RefreshToken {
                client_id_env: "TEST_RT_ID".to_string(),
                client_secret_env: "TEST_RT_SECRET".to_string(),
                refresh_token_env: "TEST_RT_REFRESH".to_string(),
            },
        );

        assert!(provider.has_credentials());

        let r = provider
            .apply(req(), &EndpointAuthMetadata::unspecified())
            .unwrap();
        assert_eq!(
            auth_header(r).as_deref(),
            Some("Bearer refreshed-token-456")
        );

        std::env::remove_var("TEST_RT_ID");
        std::env::remove_var("TEST_RT_SECRET");
        std::env::remove_var("TEST_RT_REFRESH");
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn refresh_token_no_creds_without_refresh_env() {
        std::env::set_var("TEST_RT_ID2", "id");
        std::env::set_var("TEST_RT_SECRET2", "secret");
        std::env::remove_var("MISSING_RT_XYZ");

        let provider = OAuth2TokenProvider::new(
            "oauth2",
            "https://unused.example.com/token",
            OAuth2Grant::RefreshToken {
                client_id_env: "TEST_RT_ID2".to_string(),
                client_secret_env: "TEST_RT_SECRET2".to_string(),
                refresh_token_env: "MISSING_RT_XYZ".to_string(),
            },
        );

        assert!(!provider.has_credentials());

        std::env::remove_var("TEST_RT_ID2");
        std::env::remove_var("TEST_RT_SECRET2");
    }

    // `parse_oauth_error_message` + `truncate_body` are tested in
    // `oauth_common::tests` — no need to duplicate here.

    // ---- Token cache tests ----

    #[test]
    fn token_cache_store_and_load() {
        let dir = tempfile::tempdir().unwrap();
        let cache = TokenCache::at_path(dir.path().join("credentials.json"));

        cache
            .store(
                "https://example.com/token",
                "access-abc",
                Some("refresh-xyz"),
                Some(3600),
            )
            .unwrap();

        let loaded = cache.load("https://example.com/token").unwrap();
        assert_eq!(loaded.access_token, "access-abc");
        assert_eq!(loaded.refresh_token.as_deref(), Some("refresh-xyz"));
        assert!(loaded.expires_at.is_some());
    }

    #[test]
    fn token_cache_expired_token_returns_none() {
        let dir = tempfile::tempdir().unwrap();
        let cache = TokenCache::at_path(dir.path().join("credentials.json"));

        // Store a token with 0 seconds expiry (immediately expired after buffer)
        cache
            .store("https://example.com/token", "expired", None, Some(0))
            .unwrap();

        assert!(cache.load("https://example.com/token").is_none());
    }

    #[test]
    fn token_cache_no_expiry_always_valid() {
        let dir = tempfile::tempdir().unwrap();
        let cache = TokenCache::at_path(dir.path().join("credentials.json"));

        cache
            .store("https://example.com/token", "forever", None, None)
            .unwrap();

        let loaded = cache.load("https://example.com/token").unwrap();
        assert_eq!(loaded.access_token, "forever");
        assert!(loaded.expires_at.is_none());
    }

    #[test]
    fn token_cache_remove() {
        let dir = tempfile::tempdir().unwrap();
        let cache = TokenCache::at_path(dir.path().join("credentials.json"));

        cache
            .store("https://example.com/token", "abc", None, Some(3600))
            .unwrap();
        assert!(cache.load("https://example.com/token").is_some());

        cache.remove("https://example.com/token");
        assert!(cache.load("https://example.com/token").is_none());
    }

    #[test]
    fn token_cache_preserves_refresh_token_on_update() {
        let dir = tempfile::tempdir().unwrap();
        let cache = TokenCache::at_path(dir.path().join("credentials.json"));

        // Initial store with refresh token
        cache
            .store(
                "https://ex.com/t",
                "old-access",
                Some("my-refresh"),
                Some(3600),
            )
            .unwrap();

        // Update with new access token but no refresh token in response
        cache
            .store("https://ex.com/t", "new-access", None, Some(3600))
            .unwrap();

        let loaded = cache.load("https://ex.com/t").unwrap();
        assert_eq!(loaded.access_token, "new-access");
        assert_eq!(loaded.refresh_token.as_deref(), Some("my-refresh"));
    }

    #[cfg(unix)]
    #[test]
    fn token_cache_file_permissions() {
        use std::os::unix::fs::PermissionsExt;

        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("credentials.json");
        let cache = TokenCache::at_path(path.clone());

        cache
            .store("https://example.com/token", "secret", None, None)
            .unwrap();

        let mode = std::fs::metadata(&path).unwrap().permissions().mode();
        assert_eq!(mode & 0o777, 0o600, "Token cache should be owner-only");
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn provider_uses_disk_cache() {
        let dir = tempfile::tempdir().unwrap();
        let cache = TokenCache::at_path(dir.path().join("credentials.json"));

        // Pre-populate the cache
        cache
            .store(
                "https://example.com/token",
                "cached-token",
                None,
                Some(3600),
            )
            .unwrap();

        // Provider should not hit the network (no MockServer needed)
        std::env::set_var("TEST_CACHE_ID", "id");
        std::env::set_var("TEST_CACHE_SECRET", "secret");

        let provider = OAuth2TokenProvider::new(
            "oauth2",
            "https://example.com/token",
            OAuth2Grant::ClientCredentials {
                client_id_env: "TEST_CACHE_ID".to_string(),
                client_secret_env: "TEST_CACHE_SECRET".to_string(),
                scope: None,
            },
        )
        .with_token_cache(cache);

        assert!(provider.has_credentials());

        let r = provider
            .apply(req(), &EndpointAuthMetadata::unspecified())
            .unwrap();
        assert_eq!(auth_header(r).as_deref(), Some("Bearer cached-token"));

        std::env::remove_var("TEST_CACHE_ID");
        std::env::remove_var("TEST_CACHE_SECRET");
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn provider_persists_token_to_disk() {
        let dir = tempfile::tempdir().unwrap();
        let cache = TokenCache::at_path(dir.path().join("credentials.json"));

        let server = MockServer::start().await;
        let token_url = format!("{}/token", server.uri());

        Mock::given(method("POST"))
            .and(path("/token"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "access_token": "new-token",
                "refresh_token": "new-refresh",
                "expires_in": 3600
            })))
            .expect(1)
            .mount(&server)
            .await;

        std::env::set_var("TEST_PERSIST_ID", "id");
        std::env::set_var("TEST_PERSIST_SECRET", "secret");

        let provider = OAuth2TokenProvider::new(
            "oauth2",
            &token_url,
            OAuth2Grant::ClientCredentials {
                client_id_env: "TEST_PERSIST_ID".to_string(),
                client_secret_env: "TEST_PERSIST_SECRET".to_string(),
                scope: None,
            },
        )
        .with_token_cache(cache.clone());

        let r = provider
            .apply(req(), &EndpointAuthMetadata::unspecified())
            .unwrap();
        assert_eq!(auth_header(r).as_deref(), Some("Bearer new-token"));

        // Verify it was persisted
        let loaded = cache.load(&token_url).unwrap();
        assert_eq!(loaded.access_token, "new-token");
        assert_eq!(loaded.refresh_token.as_deref(), Some("new-refresh"));

        std::env::remove_var("TEST_PERSIST_ID");
        std::env::remove_var("TEST_PERSIST_SECRET");
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn provider_uses_cached_refresh_token() {
        let dir = tempfile::tempdir().unwrap();
        let cache = TokenCache::at_path(dir.path().join("credentials.json"));

        let server = MockServer::start().await;
        let token_url = format!("{}/token", server.uri());

        // Pre-populate cache with expired access + valid refresh
        {
            let mut map = TokenMap::new();
            map.insert(
                token_url.clone(),
                TokenBundle {
                    access_token: "expired".to_string(),
                    refresh_token: Some("cached-refresh".to_string()),
                    expires_at: Some(0), // already expired
                },
            );
            let json = serde_json::to_string_pretty(&map).unwrap();
            std::fs::write(dir.path().join("credentials.json"), json).unwrap();
        }

        Mock::given(method("POST"))
            .and(path("/token"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({
                "access_token": "refreshed-from-cache",
                "refresh_token": "new-refresh",
                "expires_in": 7200
            })))
            .expect(1)
            .mount(&server)
            .await;

        std::env::set_var("TEST_CREFRESH_ID", "id");
        std::env::set_var("TEST_CREFRESH_SECRET", "secret");

        let provider = OAuth2TokenProvider::new(
            "oauth2",
            &token_url,
            OAuth2Grant::ClientCredentials {
                client_id_env: "TEST_CREFRESH_ID".to_string(),
                client_secret_env: "TEST_CREFRESH_SECRET".to_string(),
                scope: None,
            },
        )
        .with_token_cache(cache.clone());

        let r = provider
            .apply(req(), &EndpointAuthMetadata::unspecified())
            .unwrap();
        assert_eq!(
            auth_header(r).as_deref(),
            Some("Bearer refreshed-from-cache")
        );

        // Verify the new tokens were persisted
        let loaded = cache.load(&token_url).unwrap();
        assert_eq!(loaded.access_token, "refreshed-from-cache");
        assert_eq!(loaded.refresh_token.as_deref(), Some("new-refresh"));

        std::env::remove_var("TEST_CREFRESH_ID");
        std::env::remove_var("TEST_CREFRESH_SECRET");
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn provider_falls_through_when_cached_refresh_fails() {
        let dir = tempfile::tempdir().unwrap();
        let cache = TokenCache::at_path(dir.path().join("credentials.json"));

        let server = MockServer::start().await;
        let token_url = format!("{}/token", server.uri());

        // Pre-populate cache with expired access + stale refresh
        {
            let mut map = TokenMap::new();
            map.insert(
                token_url.clone(),
                TokenBundle {
                    access_token: "expired".to_string(),
                    refresh_token: Some("stale-refresh".to_string()),
                    expires_at: Some(0),
                },
            );
            let json = serde_json::to_string_pretty(&map).unwrap();
            std::fs::write(dir.path().join("credentials.json"), json).unwrap();
        }

        // First call (refresh) fails, second call (client credentials) succeeds
        let call_count = std::sync::Arc::new(std::sync::atomic::AtomicU32::new(0));
        let call_count_clone = call_count.clone();

        Mock::given(method("POST"))
            .and(path("/token"))
            .respond_with(move |_req: &wiremock::Request| {
                let n = call_count_clone.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
                if n == 0 {
                    // Refresh fails
                    ResponseTemplate::new(400).set_body_json(serde_json::json!({
                        "error": "invalid_grant",
                        "error_description": "refresh token expired"
                    }))
                } else {
                    // Client credentials succeeds
                    ResponseTemplate::new(200).set_body_json(serde_json::json!({
                        "access_token": "fresh-cc-token",
                        "expires_in": 3600
                    }))
                }
            })
            .expect(2)
            .mount(&server)
            .await;

        std::env::set_var("TEST_FALLTHRU_ID", "id");
        std::env::set_var("TEST_FALLTHRU_SECRET", "secret");

        let provider = OAuth2TokenProvider::new(
            "oauth2",
            &token_url,
            OAuth2Grant::ClientCredentials {
                client_id_env: "TEST_FALLTHRU_ID".to_string(),
                client_secret_env: "TEST_FALLTHRU_SECRET".to_string(),
                scope: None,
            },
        )
        .with_token_cache(cache.clone());

        let r = provider
            .apply(req(), &EndpointAuthMetadata::unspecified())
            .unwrap();
        assert_eq!(auth_header(r).as_deref(), Some("Bearer fresh-cc-token"));

        // The stale refresh token should have been removed
        let loaded = cache.load(&token_url).unwrap();
        assert_eq!(loaded.access_token, "fresh-cc-token");
        assert!(loaded.refresh_token.is_none());

        std::env::remove_var("TEST_FALLTHRU_ID");
        std::env::remove_var("TEST_FALLTHRU_SECRET");
    }

    #[test]
    fn has_credentials_true_when_cache_has_valid_token() {
        let dir = tempfile::tempdir().unwrap();
        let cache = TokenCache::at_path(dir.path().join("credentials.json"));

        cache
            .store("https://example.com/token", "valid", None, Some(3600))
            .unwrap();

        std::env::remove_var("NO_SUCH_ID_XYZ_TOKEN_TEST");
        std::env::remove_var("NO_SUCH_SECRET_XYZ_TOKEN_TEST");

        let provider = OAuth2TokenProvider::new(
            "oauth2",
            "https://example.com/token",
            OAuth2Grant::ClientCredentials {
                client_id_env: "NO_SUCH_ID_XYZ_TOKEN_TEST".to_string(),
                client_secret_env: "NO_SUCH_SECRET_XYZ_TOKEN_TEST".to_string(),
                scope: None,
            },
        )
        .with_token_cache(cache);

        // has_credentials is true because of disk cache, even though env vars are unset
        assert!(provider.has_credentials());
    }

    #[test]
    fn with_cache_sets_oncelock() {
        let p = OAuth2TokenProvider::new(
            "oauth2",
            "https://example.com/token",
            OAuth2Grant::ClientCredentials {
                client_id_env: "X".to_string(),
                client_secret_env: "Y".to_string(),
                scope: None,
            },
        );
        assert!(!p.has_cache());
        let p = p.with_cache("my-test-cli");
        assert!(p.has_cache());
    }

    #[test]
    fn inject_token_cache_sets_cache_via_trait() {
        use crate::auth::provider::AuthProvider;
        let p = OAuth2TokenProvider::new(
            "oauth2",
            "https://example.com/token",
            OAuth2Grant::ClientCredentials {
                client_id_env: "X".to_string(),
                client_secret_env: "Y".to_string(),
                scope: None,
            },
        );
        assert!(!p.has_cache());
        p.inject_token_cache("my-test-cli");
        assert!(p.has_cache());
    }

    #[test]
    fn inject_token_cache_idempotent() {
        use crate::auth::provider::AuthProvider;
        let p = OAuth2TokenProvider::new(
            "oauth2",
            "https://example.com/token",
            OAuth2Grant::ClientCredentials {
                client_id_env: "X".to_string(),
                client_secret_env: "Y".to_string(),
                scope: None,
            },
        );
        p.inject_token_cache("first-cli");
        assert!(p.has_cache());
        // Second call is a no-op (OnceLock already set)
        p.inject_token_cache("second-cli");
        assert!(p.has_cache());
    }

    // FER-10745: a misconfigured OAuth2 scheme must error loudly, never let an
    // unauthenticated request through.
    #[tokio::test(flavor = "multi_thread")]
    async fn misconfigured_oauth2_provider_errors_instead_of_silent_unauth() {
        let provider =
            MisconfiguredOAuth2Provider::new("OAuth2Security", "missing OAuth2 config: token_url");

        // Selected by composition (not skipped) so the failure surfaces.
        assert!(provider.has_credentials());

        let request = reqwest::Client::new().get("https://api.example.com/v1/thing");
        let result = provider.apply(request, &EndpointAuthMetadata::unspecified());
        let err = result.expect_err("misconfigured OAuth2 must refuse to send");
        assert!(matches!(err, CliError::Auth(_)));
        let msg = err.to_string();
        assert!(
            msg.contains("OAuth2Security") && msg.contains("token_url"),
            "error should name the scheme and the missing config: {msg}",
        );
    }
}
