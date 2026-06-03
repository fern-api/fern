//! HTTP client construction and TLS-error diagnostics.
//!
//! [`HttpConfig`] holds the inputs that go into building a [`reqwest::Client`]
//! for a CLI: the binary name (used to scope env vars) and any compile-time
//! trust roots a binary author baked in via `CliApp::extra_root_cert`.
//!
//! [`HttpConfig::build_client`] honors a small set of environment variables
//! so users can adapt TLS / proxy behavior without rebuilding the CLI.
//! Variables are prefixed with `<NAME>_` (the CLI's name uppercased with `-`
//! mapped to `_`).
//!
//! | Variable                          | Effect                                              |
//! | --------------------------------- | --------------------------------------------------- |
//! | `<NAME>_CA_BUNDLE`                | Path to PEM file appended to the default trust roots. Generic fallback: `SSL_CERT_FILE`. |
//! | `<NAME>_INSECURE` = `1`/`true`/`yes` | Disable TLS verification (with a one-time stderr warning). |
//! | `<NAME>_PROXY`                    | HTTP(S) proxy URL — replaces `HTTPS_PROXY`/`HTTP_PROXY` for this CLI. Pair with `<NAME>_NO_PROXY` for a scoped bypass list, or rely on the global `NO_PROXY` (used as a fallback when `<NAME>_NO_PROXY` is unset). |
//! | `<NAME>_TIMEOUT_SECS`             | Total request timeout in seconds (default: no timeout). |
//! | `<NAME>_CONNECT_TIMEOUT_SECS`     | Connection-establishment timeout in seconds.        |
//!
//! Aliases: `<NAME>_EXTRA_CA_CERTS` (= `_CA_BUNDLE`),
//! `<NAME>_INSECURE_SKIP_VERIFY` (= `_INSECURE`).
//!
//! `HTTPS_PROXY` / `HTTP_PROXY` / `NO_PROXY` are honored by reqwest's defaults
//! when the scoped overrides are absent.
//!
//! ## Configuration timing
//!
//! Compile-time roots passed via [`HttpConfig::with_extra_root_cert`] are
//! captured once when the config is built. Env vars are re-read on every
//! [`HttpConfig::build_client`] call, so a long-running consumer that
//! rebuilds the client picks up env changes for `_INSECURE`, `_PROXY`, etc.
//! For one-shot CLI use this distinction doesn't matter.

use std::collections::HashSet;
use std::sync::{Arc, LazyLock, Mutex};
use std::time::Duration;

use reqwest::header::{HeaderMap, HeaderValue, USER_AGENT};

use crate::error::CliError;

// ----------------------------------------------------------------------------
// HttpConfig — the SDK's HTTP layer configuration
// ----------------------------------------------------------------------------

/// Configuration for building HTTP clients on behalf of a named CLI.
///
/// Holds the binary name (which scopes env-var lookups) and any compile-time
/// trust roots the binary author registered. `CliApp::run` builds one once
/// and threads it through to the executor.
#[derive(Clone, Debug)]
pub struct HttpConfig {
    /// CLI binary name (e.g. `"myapi"`). Cheap to clone via `Arc`.
    name: Arc<str>,
    /// Env-var prefix derived once from `name`: uppercase + `-` → `_`. Cached
    /// so the transform isn't recomputed on every `build_client` call (and
    /// so external callers can't forget the `-` substitution).
    prefix: Arc<str>,
    /// Trust roots baked in at compile time. We store parsed `Certificate`s
    /// (not raw PEM bytes) so `build_client` doesn't re-parse — and so a
    /// later `build_client` failure can only come from runtime input.
    extra_root_certs: Vec<reqwest::Certificate>,
    /// Raw PEM bytes for each compile-time trust root, kept alongside the
    /// parsed `reqwest::Certificate` above. Required by transport-neutral
    /// consumers (`resolve()`) that build their own TLS connectors (e.g.
    /// `tokio-tungstenite` for WebSockets) and need to feed PEM in rather
    /// than reqwest-typed certs. Each `Vec<u8>` is the raw bytes supplied
    /// to [`HttpConfig::with_extra_root_cert`].
    extra_root_certs_pem: Vec<Vec<u8>>,
}

/// Transport-neutral view of the resolved HTTP/TLS configuration.
///
/// Returned by [`HttpConfig::resolve`]. Holds compile-time roots, the
/// env-var-resolved CA bundle (if any), insecure-skip-verify flag, proxy
/// settings, and timeouts. Lets non-reqwest transports (e.g. WebSocket via
/// `tokio-tungstenite`, future SSE / gRPC) build their own clients while
/// honouring the same `<NAME>_*` env vars users already configure for the
/// reqwest path.
///
/// The reqwest path in [`HttpConfig::build_client`] reads env vars
/// independently for historical reasons — keep both readers in sync. The
/// `resolved_matches_build_client` test asserts agreement on the subset
/// that's representable in both shapes.
#[derive(Debug, Clone)]
pub struct ResolvedTlsConfig {
    /// Raw PEM bytes of all trust roots — compile-time first, then the
    /// env-resolved bundle (if any). Order matches the order they would be
    /// added to a `reqwest::ClientBuilder` via `add_root_certificate`.
    pub extra_root_certs_pem: Vec<Vec<u8>>,
    /// `<NAME>_INSECURE=1` / `<NAME>_INSECURE_SKIP_VERIFY=1` was set.
    /// Transports honoring this should disable cert+hostname verification.
    pub insecure_skip_verify: bool,
    /// `<NAME>_PROXY=<url>` was set. Transports that support HTTP proxying
    /// should route through this URL. The `no_proxy` field carries either
    /// `<NAME>_NO_PROXY` or the fallback `NO_PROXY`, matching the reqwest
    /// path's bypass-list resolution.
    pub proxy: Option<ResolvedProxy>,
    /// `<NAME>_CONNECT_TIMEOUT_SECS` if set. Bound on socket establishment.
    pub connect_timeout: Option<Duration>,
    /// `<NAME>_TIMEOUT_SECS` if set. Bound on total request lifetime
    /// (reqwest semantics); for streaming transports (WebSocket), use as a
    /// handshake-only deadline since the connection lifetime is unbounded.
    pub request_timeout: Option<Duration>,
}

/// Resolved proxy override, as parsed from `<NAME>_PROXY` / `<NAME>_NO_PROXY`.
#[derive(Debug, Clone)]
pub struct ResolvedProxy {
    /// Proxy URL (`http://...` or `https://...`).
    pub url: String,
    /// Bypass list — either `<NAME>_NO_PROXY` (if set) or the fallback
    /// `NO_PROXY` env var. `None` means honor the standard reqwest defaults.
    pub no_proxy: Option<String>,
}

impl HttpConfig {
    /// Create a config for the given CLI name. Empty names are rejected —
    /// they would silently disable the entire env-var scoping system.
    pub fn new(name: impl Into<String>) -> Result<Self, CliError> {
        let name = name.into();
        if name.is_empty() {
            return Err(CliError::Other(anyhow::anyhow!(
                "HttpConfig::new called with empty name — \
                 env-var scoping requires a non-empty CLI name"
            )));
        }
        let prefix: Arc<str> = Arc::from(name.to_uppercase().replace('-', "_"));
        Ok(Self {
            name: Arc::from(name),
            prefix,
            extra_root_certs: Vec::new(),
            extra_root_certs_pem: Vec::new(),
        })
    }

    /// Append a PEM-encoded trust root that this CLI will accept on top of
    /// the system's default roots. Typically called via `CliApp::extra_root_cert`.
    /// Returns an error if the PEM is unparseable or contains zero certs.
    pub fn with_extra_root_cert(mut self, pem: &[u8]) -> Result<Self, CliError> {
        // Validate the PEM up front (`parse_extra_root_cert` rejects empty /
        // unparseable bundles). Storing the raw bytes alongside lets
        // non-reqwest transports build their own connectors without
        // re-parsing through reqwest types.
        self.extra_root_certs.extend(parse_extra_root_cert(pem)?);
        self.extra_root_certs_pem.push(pem.to_vec());
        Ok(self)
    }

    /// Append already-parsed trust roots. Used internally by `CliApp` to
    /// thread compile-time roots from the builder into the runtime config
    /// without re-parsing. The matching PEM bytes must be supplied so
    /// `resolve()` can hand them to non-reqwest transports.
    pub(crate) fn with_parsed_root_certs(
        mut self,
        certs: impl IntoIterator<Item = reqwest::Certificate>,
        pem_bytes: impl IntoIterator<Item = Vec<u8>>,
    ) -> Self {
        self.extra_root_certs.extend(certs);
        self.extra_root_certs_pem.extend(pem_bytes);
        self
    }

    /// CLI binary name (e.g. `"myapi"`).
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Env-var prefix derived from the binary name (uppercase, `-` → `_`).
    /// `MYAPI`, `OTHER_API`, etc. Use this when constructing scoped env vars
    /// so the transform stays consistent across the codebase.
    pub fn env_prefix(&self) -> &str {
        &self.prefix
    }

    /// Resolve the transport-neutral view of this config: compile-time
    /// trust roots concatenated with the env-resolved `<NAME>_CA_BUNDLE`,
    /// the `<NAME>_INSECURE` flag, the proxy override, and timeouts.
    ///
    /// Used by non-reqwest transports (`fern_cli_sdk::websocket`, future
    /// SSE / raw-socket consumers) that need to build their own TLS
    /// connector while honoring the same `<NAME>_*` env vars users
    /// already configure for the reqwest path.
    ///
    /// Reads env vars at call time. Reading the CA bundle file can fail
    /// (missing / unparseable / no PEM certs) — those errors surface here
    /// rather than getting swallowed by the transport's own connect path.
    ///
    /// Side effects mirror [`HttpConfig::build_client`]: emits the
    /// `<NAME>_INSECURE` warning at most once per (binary, process). No
    /// network calls.
    pub fn resolve(&self) -> Result<ResolvedTlsConfig, CliError> {
        let prefix = &self.prefix;

        let mut extra_root_certs_pem: Vec<Vec<u8>> = self.extra_root_certs_pem.clone();
        if let Some(path) = first_env([
            scoped(prefix, "_CA_BUNDLE"),
            scoped(prefix, "_EXTRA_CA_CERTS"),
            "SSL_CERT_FILE".to_string(),
        ]) {
            let pem = std::fs::read(&path).map_err(|e| {
                CliError::Other(anyhow::anyhow!(
                    "failed to read CA bundle from {path}: {e}"
                ))
            })?;
            // Validate the bundle here so transport callers don't have to
            // re-implement the "empty / non-PEM" diagnostic. We parse but
            // discard the certs — the raw bytes are what we hand back.
            let source = format!("CA bundle at {path}");
            let _ = parse_pem_bundle(&pem, &source)?;
            extra_root_certs_pem.push(pem);
        }

        let insecure_skip_verify = if let Some(active_key) = first_env_truthy([
            scoped(prefix, "_INSECURE"),
            scoped(prefix, "_INSECURE_SKIP_VERIFY"),
        ]) {
            warn_insecure_once(&self.name, &active_key);
            true
        } else {
            false
        };

        let proxy = first_env([scoped(prefix, "_PROXY")]).map(|url| {
            // Mirror the reqwest path's bypass-list resolution: <PREFIX>_NO_PROXY
            // wins when set, otherwise fall back to the standard NO_PROXY env.
            let no_proxy = first_env([scoped(prefix, "_NO_PROXY")])
                .or_else(|| first_env(["NO_PROXY".to_string()]));
            ResolvedProxy { url, no_proxy }
        });

        let connect_timeout = parse_secs(&scoped(prefix, "_CONNECT_TIMEOUT_SECS"))
            .map(Duration::from_secs);
        let request_timeout = parse_secs(&scoped(prefix, "_TIMEOUT_SECS"))
            .map(Duration::from_secs);

        Ok(ResolvedTlsConfig {
            extra_root_certs_pem,
            insecure_skip_verify,
            proxy,
            connect_timeout,
            request_timeout,
        })
    }

    /// Build an HTTP client, applying compile-time roots, env-var overrides,
    /// proxy settings, and timeouts. Reads `<NAME>_*` env vars at call time;
    /// compile-time roots were captured when this config was built.
    pub fn build_client(&self) -> Result<reqwest::Client, CliError> {
        let prefix = &self.prefix;

        let mut builder = reqwest::Client::builder();
        let user_agent = format!("{}/{}", env!("CARGO_PKG_NAME"), env!("CARGO_PKG_VERSION"));
        if let Ok(header_value) = HeaderValue::from_str(&user_agent) {
            let mut headers = HeaderMap::new();
            headers.insert(USER_AGENT, header_value);
            builder = builder.default_headers(headers);
        }

        // --- Compile-time trust roots (from CliApp::extra_root_cert) ---
        for cert in &self.extra_root_certs {
            builder = builder.add_root_certificate(cert.clone());
        }

        // --- Runtime trust roots from env ---
        if let Some(path) = first_env([
            scoped(prefix, "_CA_BUNDLE"),
            scoped(prefix, "_EXTRA_CA_CERTS"),
            "SSL_CERT_FILE".to_string(),
        ]) {
            let pem = std::fs::read(&path).map_err(|e| {
                CliError::Other(anyhow::anyhow!(
                    "failed to read CA bundle from {path}: {e}"
                ))
            })?;
            let source = format!("CA bundle at {path}");
            for cert in parse_pem_bundle(&pem, &source)? {
                builder = builder.add_root_certificate(cert);
            }
        }

        // --- Insecure mode (opt-in, loud) ---
        if let Some(active_key) = first_env_truthy([
            scoped(prefix, "_INSECURE"),
            scoped(prefix, "_INSECURE_SKIP_VERIFY"),
        ]) {
            warn_insecure_once(&self.name, &active_key);
            builder = builder
                .danger_accept_invalid_certs(true)
                .danger_accept_invalid_hostnames(true);
        }

        // --- Proxy override ---
        //
        // Reqwest's default behavior reads `HTTPS_PROXY` / `HTTP_PROXY` and
        // adds them automatically. Adding our explicit `.proxy(...)` on top
        // would result in *both* being tried in order — the env-detected one
        // first. So when `<PREFIX>_PROXY` is set, we clear reqwest's
        // auto-detection with `.no_proxy()` first, then add ours.
        //
        // Bypass-list semantics: `<PREFIX>_PROXY` *replaces* the global
        // `HTTPS_PROXY`/`HTTP_PROXY`, but the bypass list is *augmenting*:
        //   - if `<PREFIX>_NO_PROXY` is set, it's used (global NO_PROXY ignored);
        //   - otherwise, the standard `NO_PROXY` is honored as a fallback so
        //     a user who only set the shell-wide bypass list doesn't lose it.
        // Standalone `<PREFIX>_NO_PROXY` (without `<PREFIX>_PROXY`) is *not*
        // honored — it would have ambiguous semantics (override which proxy?).
        let proxy_key = scoped(prefix, "_PROXY");
        if let Some(url) = first_env([proxy_key.clone()]) {
            let mut proxy = reqwest::Proxy::all(&url).map_err(|e| {
                CliError::Other(anyhow::anyhow!("invalid {proxy_key}={url}: {e}"))
            })?;
            if let Some(list) = first_env([scoped(prefix, "_NO_PROXY")]) {
                if let Some(np) = reqwest::NoProxy::from_string(&list) {
                    proxy = proxy.no_proxy(Some(np));
                }
            } else if let Some(np) = reqwest::NoProxy::from_env() {
                proxy = proxy.no_proxy(Some(np));
            }
            builder = builder.no_proxy().proxy(proxy);
        }

        // --- Timeouts ---
        if let Some(secs) = parse_secs(&scoped(prefix, "_TIMEOUT_SECS")) {
            builder = builder.timeout(std::time::Duration::from_secs(secs));
        }
        if let Some(secs) = parse_secs(&scoped(prefix, "_CONNECT_TIMEOUT_SECS")) {
            builder = builder.connect_timeout(std::time::Duration::from_secs(secs));
        }

        builder.build().map_err(|e| {
            CliError::Other(anyhow::anyhow!("failed to build HTTP client: {e}"))
        })
    }
}

/// Parse a PEM bundle into trust-root certs, with the SDK's standard
/// validation: empty bytes / no PEM headers / unparseable bytes all surface
/// as errors. `source` is woven into error messages so users can tell where
/// the bad PEM came from (`"extra root cert"`, `"CA bundle at /path/..."`).
fn parse_pem_bundle(pem: &[u8], source: &str) -> Result<Vec<reqwest::Certificate>, CliError> {
    let certs = reqwest::Certificate::from_pem_bundle(pem).map_err(|e| {
        CliError::Other(anyhow::anyhow!(
            "failed to parse {source}: {e} — check the bytes are valid PEM-encoded certificates"
        ))
    })?;
    if certs.is_empty() {
        return Err(CliError::Other(anyhow::anyhow!(
            "{source} contains no PEM certificates — check the bytes are PEM-encoded"
        )));
    }
    Ok(certs)
}

/// Convenience wrapper for the compile-time path. Used by
/// [`HttpConfig::with_extra_root_cert`] and `CliApp::extra_root_cert`.
pub(crate) fn parse_extra_root_cert(pem: &[u8]) -> Result<Vec<reqwest::Certificate>, CliError> {
    parse_pem_bundle(pem, "extra root cert")
}

// ----------------------------------------------------------------------------
// TLS error diagnostics
// ----------------------------------------------------------------------------

/// If the given reqwest error looks like a TLS chain failure, print a hint
/// to stderr telling the user how to fix it (export `<NAME>_CA_BUNDLE`,
/// unset `HTTPS_PROXY`, or use `<NAME>_INSECURE=1` for debugging).
///
/// Emits at most once per (binary, process) so paginated callers don't spam.
pub(crate) fn maybe_emit_tls_hint(cfg: &HttpConfig, err: &reqwest::Error) {
    if !looks_like_tls_failure(err) {
        return;
    }
    if !is_first_emission(&cfg.name, "tls") {
        return;
    }
    let prefix = cfg.env_prefix();
    eprintln!(
        "hint: TLS chain validation failed. If you're behind a corporate proxy or \
         interception tool (Proxyman, Charles, mitmproxy):\n  \
         export {prefix}_CA_BUNDLE=/path/to/ca.pem    # trust an extra root\n  \
         export SSL_CERT_FILE=/path/to/ca.pem         # generic fallback\n  \
         {prefix}_INSECURE=1 <cmd>                    # skip verification (debugging only)"
    );
}

/// Detect whether a reqwest error is plausibly a TLS chain failure. Uses the
/// typed `is_connect()` predicate plus a deliberately-broad substring match
/// against `"certificate"` in the rendered error chain. We accept some false
/// positives (the hint is benign when wrong) in exchange for not missing real
/// TLS failures when reqwest's error wording shifts between versions.
fn looks_like_tls_failure(err: &reqwest::Error) -> bool {
    if !err.is_connect() {
        return false;
    }
    // `{:#}` prints the full source chain — TLS errors are usually wrapped
    // several layers deep, with the actual word appearing near the bottom.
    format!("{err:#}").to_lowercase().contains("certificate")
}

/// Print the insecure-mode warning at most once per (binary, process).
fn warn_insecure_once(name: &str, active_key: &str) {
    if !is_first_emission(name, "insecure") {
        return;
    }
    eprintln!(
        "warning: TLS verification disabled via {active_key} — \
         requests are vulnerable to MITM. Unset for production use."
    );
}

/// Returns true the *first* time a (binary, kind) pair is seen in this
/// process, false thereafter. Lets us print one-shot warnings/hints without
/// silencing them across multiple binaries built on the SDK in the same
/// process (e.g. test harnesses, library consumers wiring up two CLIs).
fn is_first_emission(name: &str, kind: &str) -> bool {
    static EMITTED: LazyLock<Mutex<HashSet<String>>> =
        LazyLock::new(|| Mutex::new(HashSet::new()));
    let mut guard = EMITTED.lock().unwrap_or_else(|e| e.into_inner());
    guard.insert(format!("{name}::{kind}"))
}

// ----------------------------------------------------------------------------
// Env-var helpers
// ----------------------------------------------------------------------------

/// Format a scoped env-var name. `scoped("MYAPI", "_CA_BUNDLE")` →
/// `"MYAPI_CA_BUNDLE"`.
fn scoped(prefix: &str, suffix: &str) -> String {
    format!("{prefix}{suffix}")
}

/// Return the first non-empty env var value among the given keys, in order.
fn first_env<S: AsRef<str>>(keys: impl IntoIterator<Item = S>) -> Option<String> {
    keys.into_iter().find_map(|k| {
        let k = k.as_ref();
        if k.is_empty() {
            return None;
        }
        std::env::var(k).ok().filter(|v| !v.is_empty())
    })
}

/// Like `first_env`, but checks for truthy values and returns the *name* of
/// the env var that fired so warnings can name the actual variable the user
/// set.
fn first_env_truthy<S: AsRef<str>>(keys: impl IntoIterator<Item = S>) -> Option<String> {
    keys.into_iter().find_map(|k| {
        let k = k.as_ref();
        if k.is_empty() {
            return None;
        }
        match std::env::var(k) {
            Ok(v) if is_truthy(&v) => Some(k.to_string()),
            _ => None,
        }
    })
}

fn is_truthy(v: &str) -> bool {
    v.eq_ignore_ascii_case("1")
        || v.eq_ignore_ascii_case("true")
        || v.eq_ignore_ascii_case("yes")
        || v.eq_ignore_ascii_case("on")
}

fn parse_secs(key: &str) -> Option<u64> {
    std::env::var(key).ok().and_then(|v| v.parse().ok())
}

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    /// RAII guard that sets env vars on construction and unsets them on
    /// drop, so a panic mid-test doesn't leak mutations into other tests.
    /// The `unset` helper additionally restores any pre-existing value
    /// on drop so the guard works for both setting and clearing.
    #[derive(Default)]
    struct EnvGuard {
        set_keys: Vec<String>,
        unset_keys: Vec<(String, Option<std::ffi::OsString>)>,
    }

    impl EnvGuard {
        fn set(&mut self, k: &str, v: impl AsRef<std::ffi::OsStr>) {
            std::env::set_var(k, v);
            self.set_keys.push(k.to_string());
        }
        /// Temporarily clear `k` for the duration of the guard, restoring
        /// any previously-set value on drop. Used to isolate tests from
        /// ambient CI/local env (e.g. Linux runners that set
        /// `SSL_CERT_FILE` globally — that var would otherwise leak into
        /// `HttpConfig::resolve`'s CA-bundle fallback).
        fn unset(&mut self, k: &str) {
            let prior = std::env::var_os(k);
            std::env::remove_var(k);
            self.unset_keys.push((k.to_string(), prior));
        }
    }

    impl Drop for EnvGuard {
        fn drop(&mut self) {
            for k in &self.set_keys {
                std::env::remove_var(k);
            }
            for (k, prior) in &self.unset_keys {
                if let Some(v) = prior {
                    std::env::set_var(k, v);
                } else {
                    std::env::remove_var(k);
                }
            }
        }
    }

    /// Standard env-isolation for `resolve()` tests — clears the
    /// CA-bundle fallback chain that CI may have pre-populated. Use at
    /// the top of any test that asserts on a clean / minimal resolved
    /// config.
    fn isolated_env_guard() -> EnvGuard {
        let mut g = EnvGuard::default();
        g.unset("SSL_CERT_FILE");
        g
    }

    #[test]
    #[serial_test::serial]
    fn build_client_succeeds_with_clean_env() {
        let cfg = HttpConfig::new("myapi").unwrap();
        assert!(cfg.build_client().is_ok());
    }

    #[test]
    fn http_config_rejects_empty_name() {
        let err = HttpConfig::new("").expect_err("empty name should error");
        assert!(err.to_string().contains("empty name"));
    }

    #[test]
    fn env_prefix_uppercases_and_translates_dashes() {
        let cfg = HttpConfig::new("openapi-fixture").unwrap();
        assert_eq!(cfg.env_prefix(), "OPENAPI_FIXTURE");
        assert_eq!(cfg.name(), "openapi-fixture");
    }

    #[test]
    fn with_extra_root_cert_rejects_non_pem() {
        let cfg = HttpConfig::new("regtest").unwrap();
        let err = cfg
            .with_extra_root_cert(b"not a pem")
            .expect_err("non-PEM should error");
        assert!(err.to_string().contains("extra root cert"));
    }

    #[test]
    fn with_extra_root_cert_rejects_empty_bundle() {
        let cfg = HttpConfig::new("regtest").unwrap();
        let err = cfg
            .with_extra_root_cert(b"")
            .expect_err("empty bytes should error");
        let msg = err.to_string().to_lowercase();
        assert!(msg.contains("empty") || msg.contains("no pem"));
    }

    #[test]
    #[serial_test::serial]
    fn first_env_truthy_returns_active_key_name() {
        let mut env = EnvGuard::default();
        env.set("CLI_TEST_ACTIVE_PRIMARY", "1");
        env.set("CLI_TEST_ACTIVE_ALIAS", "true");
        let primary = "CLI_TEST_ACTIVE_PRIMARY".to_string();
        let alias = "CLI_TEST_ACTIVE_ALIAS".to_string();
        assert_eq!(
            first_env_truthy([&primary, &alias]).as_deref(),
            Some("CLI_TEST_ACTIVE_PRIMARY"),
        );
        std::env::remove_var("CLI_TEST_ACTIVE_PRIMARY");
        // Alias wins now that primary is unset.
        assert_eq!(
            first_env_truthy([&primary, &alias]).as_deref(),
            Some("CLI_TEST_ACTIVE_ALIAS"),
        );
    }

    #[test]
    #[serial_test::serial]
    fn first_env_truthy_rejects_falsy() {
        let mut env = EnvGuard::default();
        env.set("CLI_TEST_FALSY", "0");
        let key = "CLI_TEST_FALSY".to_string();
        assert!(first_env_truthy([&key]).is_none());
        env.set("CLI_TEST_FALSY", "false");
        assert!(first_env_truthy([&key]).is_none());
        env.set("CLI_TEST_FALSY", "");
        assert!(first_env_truthy([&key]).is_none());
    }

    #[test]
    fn is_truthy_is_case_insensitive() {
        assert!(is_truthy("1"));
        assert!(is_truthy("TRUE"));
        assert!(is_truthy("True"));
        assert!(is_truthy("yes"));
        assert!(is_truthy("ON"));
        assert!(!is_truthy("0"));
        assert!(!is_truthy(""));
        assert!(!is_truthy("anything-else"));
    }

    #[test]
    #[serial_test::serial]
    fn parse_secs_handles_numeric_and_invalid() {
        let mut env = EnvGuard::default();
        env.set("CLI_TEST_SECS", "42");
        assert_eq!(parse_secs("CLI_TEST_SECS"), Some(42));
        env.set("CLI_TEST_SECS", "not-a-number");
        assert_eq!(parse_secs("CLI_TEST_SECS"), None);
        assert_eq!(parse_secs("CLI_TEST_NEVER_SET"), None);
    }

    #[test]
    #[serial_test::serial]
    fn first_env_picks_first_set_value_and_skips_empty() {
        let mut env = EnvGuard::default();
        env.set("CLI_TEST_FIRST_A", "");
        env.set("CLI_TEST_FIRST_B", "winner");
        env.set("CLI_TEST_FIRST_C", "loser");
        let a = "CLI_TEST_FIRST_A".to_string();
        let b = "CLI_TEST_FIRST_B".to_string();
        let c = "CLI_TEST_FIRST_C".to_string();
        assert_eq!(first_env([&a, &b, &c]), Some("winner".to_string()));
    }

    #[test]
    #[serial_test::serial]
    fn ca_bundle_env_invalid_path_returns_error() {
        let mut env = EnvGuard::default();
        env.set("CLI_E2E_TEST_CA_BUNDLE", "/no/such/file.pem");
        let cfg = HttpConfig::new("cli-e2e-test").unwrap();
        let err = cfg.build_client().expect_err("missing path should error");
        let msg = err.to_string();
        assert!(msg.contains("/no/such/file.pem"), "error: {msg}");
    }

    #[test]
    #[serial_test::serial]
    fn ca_bundle_env_empty_file_returns_error() {
        let mut env = EnvGuard::default();
        let tmp = tempfile::NamedTempFile::new().unwrap();
        env.set("CLI_EMPTY_BUNDLE_TEST_CA_BUNDLE", tmp.path());
        let cfg = HttpConfig::new("cli-empty-bundle-test").unwrap();
        let err = cfg.build_client().expect_err("empty bundle should error");
        let msg = err.to_string().to_lowercase();
        assert!(msg.contains("no pem") || msg.contains("empty"), "error: {msg}");
    }

    #[test]
    #[serial_test::serial]
    fn is_first_emission_dedupes_by_binary_and_kind() {
        // The emission tracker is a process-global LazyLock, so this test
        // shares state with anything else that calls `is_first_emission`.
        // Serializing keeps it deterministic; unique binary-name keys would
        // be required if other tests called it.
        assert!(is_first_emission("emit-dedupe-test", "marker-1"));
        assert!(!is_first_emission("emit-dedupe-test", "marker-1"));
        assert!(is_first_emission("emit-dedupe-test", "marker-2"));
        assert!(is_first_emission("emit-dedupe-test-other", "marker-1"));
    }

    #[test]
    fn scoped_helper_concatenates_prefix_and_suffix() {
        assert_eq!(scoped("MYAPI", "_CA_BUNDLE"), "MYAPI_CA_BUNDLE");
        assert_eq!(scoped("OTHER", "_INSECURE"), "OTHER_INSECURE");
    }

    // ----- resolve() — transport-neutral view ---------------------------------

    /// Minimal valid self-signed PEM. Used by both reqwest and rustls parsers
    /// to verify the round-trip stays byte-identical after going through
    /// [`HttpConfig::resolve`].
    const TEST_PEM: &str = "-----BEGIN CERTIFICATE-----\n\
MIIBhTCCASugAwIBAgIQIRi6zePL6mKjOipn+dNuaTAKBggqhkjOPQQDAjASMRAw\n\
DgYDVQQKEwdBY21lIENvMB4XDTE3MTAyMDE5NDMwNloXDTE4MTAyMDE5NDMwNlow\n\
EjEQMA4GA1UEChMHQWNtZSBDbzBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABD0d\n\
7VNhbWvZLWPuj/RtHFjvtJBEwOkhbN/BnnE8rnZR8+sbwnc/KhCk3FhnpHZnQz7B\n\
5aETbbIgmuvewdjvSBSjYzBhMA4GA1UdDwEB/wQEAwICpDATBgNVHSUEDDAKBggr\n\
BgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MCkGA1UdEQQiMCCCDmxvY2FsaG9zdDo1\n\
NDUzgg4xMjcuMC4wLjE6NTQ1MzAKBggqhkjOPQQDAgNIADBFAiEA2zpJEPQyz6/l\n\
Wf86aX6PepsntZv2GYlA5UpabfT2EZICICpJ5h/iI+i341gBmLiAFQOyTDT+/wQc\n\
6MF9+Yw1Yy0t\n\
-----END CERTIFICATE-----\n";

    #[test]
    #[serial_test::serial]
    fn resolve_clean_env_yields_no_overrides() {
        // CI runners (notably ubuntu-latest) set SSL_CERT_FILE globally;
        // `resolve()` reads it as the CA-bundle fallback so we must clear
        // it for the duration of this test to actually see "clean env".
        let _g = isolated_env_guard();
        let cfg = HttpConfig::new("resolve-clean").unwrap();
        let resolved = cfg.resolve().expect("clean env should resolve");
        assert!(resolved.extra_root_certs_pem.is_empty());
        assert!(!resolved.insecure_skip_verify);
        assert!(resolved.proxy.is_none());
        assert!(resolved.connect_timeout.is_none());
        assert!(resolved.request_timeout.is_none());
    }

    #[test]
    #[serial_test::serial]
    fn resolve_preserves_compile_time_pem_bytes_unchanged() {
        let _g = isolated_env_guard();
        let cfg = HttpConfig::new("resolve-ct-pem")
            .unwrap()
            .with_extra_root_cert(TEST_PEM.as_bytes())
            .expect("test PEM should parse");
        let resolved = cfg.resolve().expect("resolve should succeed");
        assert_eq!(resolved.extra_root_certs_pem.len(), 1);
        // Round-trip must be byte-identical — non-reqwest transports parse
        // these bytes with their own PEM reader and need them verbatim.
        assert_eq!(resolved.extra_root_certs_pem[0], TEST_PEM.as_bytes());
    }

    #[test]
    #[serial_test::serial]
    fn resolve_appends_env_ca_bundle_after_compile_time_roots() {
        let mut env = isolated_env_guard();
        let mut tmp = tempfile::NamedTempFile::new().unwrap();
        std::io::Write::write_all(&mut tmp, TEST_PEM.as_bytes()).unwrap();
        env.set("RESOLVE_ENV_PEM_CA_BUNDLE", tmp.path());

        let cfg = HttpConfig::new("resolve-env-pem")
            .unwrap()
            .with_extra_root_cert(TEST_PEM.as_bytes())
            .unwrap();
        let resolved = cfg.resolve().expect("resolve should succeed");
        assert_eq!(resolved.extra_root_certs_pem.len(), 2,
            "compile-time PEM first, env PEM appended");
    }

    #[test]
    #[serial_test::serial]
    fn resolve_invalid_ca_bundle_path_errors() {
        let mut env = EnvGuard::default();
        env.set("RESOLVE_BAD_PATH_CA_BUNDLE", "/no/such/file.pem");
        let cfg = HttpConfig::new("resolve-bad-path").unwrap();
        let err = cfg.resolve().expect_err("missing path should error");
        assert!(err.to_string().contains("/no/such/file.pem"));
    }

    #[test]
    #[serial_test::serial]
    fn resolve_invalid_ca_bundle_contents_errors() {
        let mut env = EnvGuard::default();
        let mut tmp = tempfile::NamedTempFile::new().unwrap();
        std::io::Write::write_all(&mut tmp, b"not a pem").unwrap();
        env.set("RESOLVE_BAD_PEM_CA_BUNDLE", tmp.path());
        let cfg = HttpConfig::new("resolve-bad-pem").unwrap();
        let err = cfg.resolve().expect_err("unparseable PEM should error");
        let msg = err.to_string().to_lowercase();
        assert!(msg.contains("ca bundle") || msg.contains("pem"));
    }

    #[test]
    #[serial_test::serial]
    fn resolve_picks_up_insecure_flag() {
        let mut env = EnvGuard::default();
        env.set("RESOLVE_INSECURE_INSECURE", "1");
        let cfg = HttpConfig::new("resolve-insecure").unwrap();
        let resolved = cfg.resolve().unwrap();
        assert!(resolved.insecure_skip_verify);
    }

    #[test]
    #[serial_test::serial]
    fn resolve_proxy_with_explicit_no_proxy_wins_over_env() {
        let mut env = EnvGuard::default();
        env.set("RESOLVE_PROXY_PROXY", "http://proxy.example:3128");
        env.set("RESOLVE_PROXY_NO_PROXY", "internal.example");
        env.set("NO_PROXY", "should-be-ignored");
        let cfg = HttpConfig::new("resolve-proxy").unwrap();
        let resolved = cfg.resolve().unwrap();
        let p = resolved.proxy.expect("proxy should be set");
        assert_eq!(p.url, "http://proxy.example:3128");
        assert_eq!(p.no_proxy.as_deref(), Some("internal.example"));
    }

    #[test]
    #[serial_test::serial]
    fn resolve_proxy_falls_back_to_global_no_proxy() {
        let mut env = EnvGuard::default();
        env.set("RESOLVE_PROXY_FALLBACK_PROXY", "http://p.example:3128");
        env.set("NO_PROXY", "fallback.example");
        let cfg = HttpConfig::new("resolve-proxy-fallback").unwrap();
        let resolved = cfg.resolve().unwrap();
        let p = resolved.proxy.expect("proxy should be set");
        assert_eq!(p.no_proxy.as_deref(), Some("fallback.example"));
    }

    #[test]
    #[serial_test::serial]
    fn resolve_and_build_client_agree_on_common_env_var_shape() {
        // Cheap drift check: with the same env vars set, both readers
        // succeed. This doesn't prove they map values identically into
        // their respective output types (reqwest::Client vs
        // ResolvedTlsConfig) — that would require introspecting reqwest
        // internals — but it does catch the class of bug where one
        // reader accepts an env-var combination the other rejects.
        let mut env = isolated_env_guard();
        let mut tmp = tempfile::NamedTempFile::new().unwrap();
        std::io::Write::write_all(&mut tmp, TEST_PEM.as_bytes()).unwrap();
        env.set("RESOLVE_AGREE_CA_BUNDLE", tmp.path());
        env.set("RESOLVE_AGREE_TIMEOUT_SECS", "42");
        env.set("RESOLVE_AGREE_CONNECT_TIMEOUT_SECS", "7");

        let cfg = HttpConfig::new("resolve-agree").unwrap();
        let resolved = cfg.resolve().expect("resolve should succeed");
        assert_eq!(resolved.extra_root_certs_pem.len(), 1);
        assert_eq!(resolved.request_timeout, Some(Duration::from_secs(42)));
        assert_eq!(resolved.connect_timeout, Some(Duration::from_secs(7)));

        // build_client reads env vars independently. If it errors here
        // with the same env set, the two readers have drifted on a
        // value the spec says both accept.
        cfg.build_client()
            .expect("build_client should accept the same env vars as resolve()");
    }

    #[test]
    #[serial_test::serial]
    fn resolve_timeouts_parsed_as_seconds() {
        let mut env = EnvGuard::default();
        env.set("RESOLVE_TIMEOUTS_TIMEOUT_SECS", "30");
        env.set("RESOLVE_TIMEOUTS_CONNECT_TIMEOUT_SECS", "5");
        let cfg = HttpConfig::new("resolve-timeouts").unwrap();
        let resolved = cfg.resolve().unwrap();
        assert_eq!(resolved.request_timeout, Some(Duration::from_secs(30)));
        assert_eq!(resolved.connect_timeout, Some(Duration::from_secs(5)));
    }
}
