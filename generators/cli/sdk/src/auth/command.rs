//! Command-backed login flow — mint an auth token by running a
//! user-configured command.
//!
//! Some APIs authenticate with a short-lived token that isn't produced by
//! an OAuth token endpoint the CLI can call, but by a *command* the user
//! already has on their machine — e.g. a Google service-account
//! impersonation (`gcloud auth print-identity-token …`) or a bespoke
//! minting script. This module lets `<bin> auth login` run that command,
//! parse the resulting JWT's `exp` claim, and cache the token with its
//! expiry in the keyring so subsequent requests reuse it and re-mint only
//! when it's about to expire.
//!
//! Two pieces, mirroring the OAuth login-flow design in
//! [`crate::auth::oauth_login`]:
//!
//! - [`CommandLoginFlow`] — the [`LoginFlow`] run on `<bin> auth login`.
//!   Runs the command once and primes the keyring.
//! - [`CommandKeyringProvider`] — the request-time [`AuthProvider`] wired
//!   automatically by [`CliApp::login_flow`](crate::CliApp::login_flow).
//!   Reads the cached bundle; when it's missing or expired it re-runs the
//!   command, so a token that lapses between invocations refreshes
//!   transparently.
//!
//! The token is applied to a configurable header (default `Authorization`)
//! with an optional prefix (default none), so both a bearer JWT
//! (`Authorization: Bearer <jwt>`) and a raw custom-header JWT
//! (`Authentication: <jwt>`) are expressible.
//!
//! Security: the command string comes from the API owner's generator
//! config (build-time, trusted — the same trust level as a value baked
//! into the binary), never from untrusted request data. Token bytes and
//! raw command output are never logged.

use std::process::Command;
use std::sync::{Arc, Mutex};

use secrecy::{ExposeSecret, SecretString};

use crate::auth::keyring_store::active_store;
use crate::auth::login::{LoginContext, LoginFlow};
use crate::auth::oauth_common::{now_epoch, truncate_body, TokenBundle};
use crate::auth::provider::{AuthProvider, DynAuthProvider, EndpointAuthMetadata};
use crate::error::CliError;

/// Default header the minted token is applied to when the config doesn't
/// pin one. Matches the OAuth providers' default.
const DEFAULT_HEADER: &str = "Authorization";

/// Run the configured command through the platform shell and return the
/// minted token (trimmed). Errors carry the command's stderr (truncated),
/// never its stdout — the token must not leak into logs.
fn run_token_command(command: &str) -> Result<String, CliError> {
    if command.trim().is_empty() {
        return Err(CliError::Validation(
            "token command must not be empty".to_string(),
        ));
    }

    let output = shell_command(command)
        .output()
        .map_err(|e| CliError::Auth(format!("Failed to run token command: {e}")))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let detail = truncate_body(stderr.trim());
        let code = output
            .status
            .code()
            .map(|c| c.to_string())
            .unwrap_or_else(|| "signal".to_string());
        return Err(CliError::Auth(format!(
            "Token command exited with status {code}: {detail}"
        )));
    }

    let token = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if token.is_empty() {
        return Err(CliError::Auth(
            "Token command produced no output on stdout.".to_string(),
        ));
    }
    Ok(token)
}

#[cfg(windows)]
fn shell_command(command: &str) -> Command {
    let mut c = Command::new("cmd");
    c.arg("/C").arg(command);
    c
}

#[cfg(not(windows))]
fn shell_command(command: &str) -> Command {
    let mut c = Command::new("sh");
    c.arg("-c").arg(command);
    c
}

/// Mint a fresh token and persist it (with its parsed `exp`) to the
/// keyring at `(cli_name, scheme_name)`. Returns the resulting bundle so
/// callers get both the token and its buffered expiry.
fn mint_and_store(
    cli_name: &str,
    scheme_name: &str,
    command: &str,
) -> Result<TokenBundle, CliError> {
    let token = run_token_command(command)?;
    let bundle = TokenBundle::from_command_token(&token);
    active_store().set(cli_name, scheme_name, &bundle.to_keyring_value()?)?;
    Ok(bundle)
}

// ---------------------------------------------------------------------------
// CommandLoginFlow
// ---------------------------------------------------------------------------

/// Login flow that mints a token by running a configured command.
///
/// Emitted by the generator as
/// `.login_flow(CommandLoginFlow::new("<scheme>").command("<cmd>").header("<h>"))`.
#[derive(Debug, Clone)]
pub struct CommandLoginFlow {
    scheme: String,
    command: String,
    header: String,
    prefix: Option<String>,
}

impl CommandLoginFlow {
    pub fn new(scheme: impl Into<String>) -> Self {
        Self {
            scheme: scheme.into(),
            command: String::new(),
            header: DEFAULT_HEADER.to_string(),
            prefix: None,
        }
    }

    /// The command to run to mint a token (executed via the platform shell).
    pub fn command(mut self, command: impl Into<String>) -> Self {
        self.command = command.into();
        self
    }

    /// Header the minted token is applied to. Defaults to `Authorization`.
    pub fn header(mut self, header: impl Into<String>) -> Self {
        self.header = header.into();
        self
    }

    /// Prefix prepended to the token value (e.g. `Bearer`). A single space
    /// separates it from the token. Defaults to none (raw token).
    pub fn prefix(mut self, prefix: impl Into<String>) -> Self {
        let prefix = prefix.into();
        self.prefix = if prefix.is_empty() {
            None
        } else {
            Some(prefix)
        };
        self
    }
}

impl LoginFlow for CommandLoginFlow {
    fn flow_type(&self) -> &'static str {
        "command"
    }

    fn scheme_name(&self) -> &str {
        &self.scheme
    }

    fn run(&self, ctx: &LoginContext) -> Result<(), CliError> {
        use std::io::Write;
        let mut err = std::io::stderr().lock();
        let _ = writeln!(err, "Running token command to authenticate…");
        let _ = err.flush();

        mint_and_store(&ctx.cli_name, &self.scheme, &self.command)?;

        let _ = writeln!(
            err,
            "{}",
            crate::auth::login::green(&format!(
                "✓ Stored credential for {}:{} in {}",
                ctx.cli_name,
                self.scheme,
                active_store().backend_label()
            ))
        );
        Ok(())
    }

    fn build_auth_provider(&self, cli_name: &str) -> Option<DynAuthProvider> {
        Some(Arc::new(CommandKeyringProvider::new(
            &self.scheme,
            cli_name,
            &self.command,
            &self.header,
            self.prefix.clone(),
        )))
    }
}

// ---------------------------------------------------------------------------
// CommandKeyringProvider
// ---------------------------------------------------------------------------

/// A token resolved into memory for the current process, with the buffered
/// expiry it was resolved against so we know when to re-resolve.
struct CachedToken {
    secret: SecretString,
    /// Epoch seconds (already buffered) after which the token is stale, or
    /// `None` when the token carries no known expiry.
    expires_at: Option<u64>,
}

impl CachedToken {
    fn is_expired(&self) -> bool {
        match self.expires_at {
            Some(t) => now_epoch() >= t,
            None => false,
        }
    }
}

/// Reads the cached token from the active keyring, re-runs the mint
/// command when it's missing or expired, and applies it to the configured
/// header. An in-memory, expiry-aware cache avoids re-running the command
/// on every `apply()` within one process, while still re-minting once the
/// cached token lapses — so even a single long-lived invocation refreshes
/// after the token's TTL rather than reusing a stale token forever.
pub struct CommandKeyringProvider {
    scheme_name: String,
    cli_name: String,
    command: String,
    header: String,
    prefix: Option<String>,
    cached: Mutex<Option<CachedToken>>,
}

impl std::fmt::Debug for CommandKeyringProvider {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CommandKeyringProvider")
            .field("scheme_name", &self.scheme_name)
            .field("cli_name", &self.cli_name)
            .field("header", &self.header)
            .field("prefix", &self.prefix)
            .finish()
    }
}

impl CommandKeyringProvider {
    pub fn new(
        scheme_name: &str,
        cli_name: &str,
        command: &str,
        header: &str,
        prefix: Option<String>,
    ) -> Self {
        Self {
            scheme_name: scheme_name.to_string(),
            cli_name: cli_name.to_string(),
            command: command.to_string(),
            header: header.to_string(),
            prefix,
            cached: Mutex::new(None),
        }
    }

    fn resolve(&self) -> Result<SecretString, CliError> {
        let mut guard = self.cached.lock().unwrap_or_else(|e| e.into_inner());
        if let Some(cached) = guard.as_ref() {
            if !cached.is_expired() {
                return Ok(cached.secret.clone());
            }
        }
        let bundle = self.resolve_bundle()?;
        let secret = SecretString::from(bundle.access_token);
        *guard = Some(CachedToken {
            secret: secret.clone(),
            expires_at: bundle.expires_at,
        });
        Ok(secret)
    }

    /// Resolve the current bundle: reuse the keyring's if still valid,
    /// otherwise mint and persist a fresh one.
    fn resolve_bundle(&self) -> Result<TokenBundle, CliError> {
        let store = active_store();
        if let Some(raw) = store.get(&self.cli_name, &self.scheme_name)? {
            let bundle = TokenBundle::parse_or_raw(&raw);
            if !bundle.is_expired() {
                return Ok(bundle);
            }
        }
        // No cached token, or it's expired: mint a fresh one.
        mint_and_store(&self.cli_name, &self.scheme_name, &self.command)
    }
}

impl AuthProvider for CommandKeyringProvider {
    fn name(&self) -> &str {
        &self.scheme_name
    }

    fn has_credentials(&self) -> bool {
        // The command can always mint a token on demand, so this provider
        // is considered available whenever a command is configured.
        !self.command.trim().is_empty()
    }

    fn credential_hints(&self) -> Vec<String> {
        vec![format!(
            "token command (runs on `{} auth login`, refreshed automatically)",
            self.cli_name
        )]
    }

    fn apply(
        &self,
        request: reqwest::RequestBuilder,
        _endpoint: &EndpointAuthMetadata,
    ) -> Result<reqwest::RequestBuilder, CliError> {
        let token = self.resolve()?;
        let value = match &self.prefix {
            Some(prefix) => format!("{prefix} {}", token.expose_secret()),
            None => token.expose_secret().to_string(),
        };
        let name = reqwest::header::HeaderName::from_bytes(self.header.as_bytes())
            .map_err(|e| CliError::Auth(format!("invalid auth header name: {e}")))?;
        let mut header = reqwest::header::HeaderValue::from_str(&value)
            .map_err(|e| CliError::Auth(format!("invalid auth token: {e}")))?;
        header.set_sensitive(true);
        Ok(request.header(name, header))
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::auth::keyring_store::{set_active_store, KeyringStore, MockKeyringStore};
    use crate::auth::oauth_common::now_epoch;
    use serial_test::serial;

    /// Build a JWT-shaped string `header.payload.signature` whose payload
    /// carries the given `exp`. Only the payload segment matters here.
    fn jwt_with_exp(exp: u64) -> String {
        use base64::Engine;
        let payload = format!("{{\"exp\":{exp}}}");
        let encoded = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(payload.as_bytes());
        format!("h.{encoded}.s")
    }

    #[test]
    fn run_command_success_trims_output() {
        let token = run_token_command("printf '  minted-token  '").unwrap();
        assert_eq!(token, "minted-token");
    }

    #[test]
    fn run_command_empty_stdout_errors() {
        let err = run_token_command("true").unwrap_err();
        assert!(matches!(err, CliError::Auth(_)));
    }

    #[test]
    fn run_command_nonzero_exit_surfaces_stderr() {
        let err = run_token_command("echo boom 1>&2; exit 3").unwrap_err();
        match err {
            CliError::Auth(m) => {
                assert!(m.contains("status 3"), "message was: {m}");
                assert!(m.contains("boom"), "message was: {m}");
            }
            other => panic!("expected Auth error, got {other:?}"),
        }
    }

    #[test]
    fn empty_command_is_validation_error() {
        assert!(matches!(
            run_token_command("   "),
            Err(CliError::Validation(_))
        ));
    }

    #[test]
    #[serial]
    fn mint_stores_bundle_with_expiry() {
        let mock = Arc::new(MockKeyringStore::new());
        set_active_store(mock.clone());
        let exp = now_epoch() + 3600;
        let cmd = format!("printf '{}'", jwt_with_exp(exp));

        mint_and_store("my-cli", "MyAuth", &cmd).unwrap();

        let raw = mock.get("my-cli", "MyAuth").unwrap().unwrap();
        let bundle = TokenBundle::parse_or_raw(&raw);
        assert!(bundle.access_token.starts_with("h."));
        assert!(bundle.expires_at.is_some());
        assert!(!bundle.is_expired());
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn provider_applies_configured_header_without_prefix() {
        let mock = Arc::new(MockKeyringStore::new());
        set_active_store(mock);
        let cmd = format!("printf '{}'", jwt_with_exp(now_epoch() + 3600));
        let provider =
            CommandKeyringProvider::new("MyAuth", "my-cli", &cmd, "Authentication", None);

        let client = reqwest::Client::new();
        let req = provider
            .apply(
                client.get("http://localhost"),
                &EndpointAuthMetadata::unspecified(),
            )
            .unwrap()
            .build()
            .unwrap();

        let header = req.headers().get("Authentication").unwrap();
        assert!(header.to_str().unwrap().starts_with("h."));
        assert!(req.headers().get("Authorization").is_none());
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn provider_applies_prefix_when_configured() {
        let mock = Arc::new(MockKeyringStore::new());
        set_active_store(mock);
        let cmd = format!("printf '{}'", jwt_with_exp(now_epoch() + 3600));
        let provider = CommandKeyringProvider::new(
            "MyAuth",
            "my-cli",
            &cmd,
            "Authorization",
            Some("Bearer".to_string()),
        );

        let client = reqwest::Client::new();
        let req = provider
            .apply(
                client.get("http://localhost"),
                &EndpointAuthMetadata::unspecified(),
            )
            .unwrap()
            .build()
            .unwrap();

        let header = req.headers().get("Authorization").unwrap();
        assert!(header.to_str().unwrap().starts_with("Bearer h."));
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn provider_reuses_cached_token_and_does_not_re_mint() {
        let mock = Arc::new(MockKeyringStore::new());
        set_active_store(mock.clone());
        // Pre-seed a valid bundle; a command that would fail if run proves
        // the cached token is reused instead of re-minting.
        let bundle = TokenBundle::from_command_token(&jwt_with_exp(now_epoch() + 3600));
        mock.set("my-cli", "MyAuth", &bundle.to_keyring_value().unwrap())
            .unwrap();
        let provider =
            CommandKeyringProvider::new("MyAuth", "my-cli", "exit 1", "Authorization", None);

        let client = reqwest::Client::new();
        let result = provider.apply(
            client.get("http://localhost"),
            &EndpointAuthMetadata::unspecified(),
        );
        assert!(result.is_ok());
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn provider_re_mints_when_cached_token_expired() {
        let mock = Arc::new(MockKeyringStore::new());
        set_active_store(mock.clone());
        // Seed an already-expired bundle.
        let mut expired = TokenBundle::parse_or_raw("stale");
        expired.expires_at = Some(0);
        mock.set("my-cli", "MyAuth", &expired.to_keyring_value().unwrap())
            .unwrap();
        let fresh = jwt_with_exp(now_epoch() + 3600);
        let cmd = format!("printf '{fresh}'");
        let provider = CommandKeyringProvider::new("MyAuth", "my-cli", &cmd, "Authorization", None);

        let client = reqwest::Client::new();
        let req = provider
            .apply(
                client.get("http://localhost"),
                &EndpointAuthMetadata::unspecified(),
            )
            .unwrap()
            .build()
            .unwrap();

        // The freshly-minted token replaced the stale one and was persisted.
        let header = req.headers().get("Authorization").unwrap();
        assert_eq!(header.to_str().unwrap(), fresh);
        let stored = TokenBundle::parse_or_raw(&mock.get("my-cli", "MyAuth").unwrap().unwrap());
        assert_eq!(stored.access_token, fresh);
    }

    /// A shell command that appends a marker to `counter_path` each time it
    /// runs and prints a JWT expiring `ttl` seconds from now. Distinct
    /// invocations therefore yield distinct tokens, so a changed token proves
    /// the command re-ran.
    fn counting_mint_command(counter_path: &std::path::Path, ttl: i64) -> String {
        use base64::Engine;
        let exp = (now_epoch() as i64 + ttl).max(0) as u64;
        // Valid JWT payload built here so `exp` always parses; the signature
        // segment carries the marker-file byte count so each run's token
        // differs, proving whether the command re-ran.
        let payload = base64::engine::general_purpose::URL_SAFE_NO_PAD
            .encode(format!("{{\"exp\":{exp}}}").as_bytes());
        format!(
            "printf x >> '{path}'; n=$(wc -c < '{path}'); printf 'h.{payload}.%s' \"$n\"",
            path = counter_path.display(),
        )
    }

    fn temp_counter_path(tag: &str) -> std::path::PathBuf {
        std::env::temp_dir().join(format!(
            "fern-cli-cmd-{tag}-{}-{}",
            std::process::id(),
            now_epoch()
        ))
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn provider_reuses_in_memory_token_across_applies_without_re_running() {
        let mock = Arc::new(MockKeyringStore::new());
        set_active_store(mock);
        let counter = temp_counter_path("reuse");
        let _ = std::fs::remove_file(&counter);
        let cmd = counting_mint_command(&counter, 3600);
        let provider = CommandKeyringProvider::new("MyAuth", "my-cli", &cmd, "Authorization", None);

        let first = provider.resolve().unwrap().expose_secret().to_string();
        let second = provider.resolve().unwrap().expose_secret().to_string();

        assert_eq!(first, second, "valid in-memory token should be reused");
        assert_eq!(
            std::fs::read(&counter).unwrap().len(),
            1,
            "command should have run exactly once"
        );
        let _ = std::fs::remove_file(&counter);
    }

    #[tokio::test(flavor = "multi_thread")]
    #[serial]
    async fn provider_re_mints_in_memory_when_token_lapses_mid_process() {
        let mock = Arc::new(MockKeyringStore::new());
        set_active_store(mock);
        let counter = temp_counter_path("relapse");
        let _ = std::fs::remove_file(&counter);
        // TTL below the expiry buffer → the minted token is immediately
        // considered stale, forcing a re-mint on the next resolve within the
        // same long-lived provider instance.
        let cmd = counting_mint_command(&counter, 0);
        let provider = CommandKeyringProvider::new("MyAuth", "my-cli", &cmd, "Authorization", None);

        let first = provider.resolve().unwrap().expose_secret().to_string();
        let second = provider.resolve().unwrap().expose_secret().to_string();

        assert_ne!(
            first, second,
            "a lapsed in-memory token should be re-minted"
        );
        assert_eq!(
            std::fs::read(&counter).unwrap().len(),
            2,
            "command should have run once per resolve while expired"
        );
        let _ = std::fs::remove_file(&counter);
    }

    #[test]
    fn has_credentials_reflects_command_presence() {
        let with = CommandKeyringProvider::new("MyAuth", "my-cli", "echo x", "Authorization", None);
        assert!(with.has_credentials());
        let without = CommandKeyringProvider::new("MyAuth", "my-cli", "", "Authorization", None);
        assert!(!without.has_credentials());
    }

    /// Mirrors the exact builder chain the generator emits into `main.rs`
    /// (`detectAuth.ts::commandLoginFlowBinding`). Compiles only if
    /// `CommandLoginFlow` satisfies `CliApp::login_flow`'s `LoginFlow` bound,
    /// and exercises the registration path (`build_auth_provider`) end to end,
    /// so a regression in the generated call shape or the trait impl is caught
    /// here rather than at seed `cargo build` time.
    #[test]
    #[serial]
    fn generated_login_flow_call_compiles_and_registers() {
        set_active_store(Arc::new(MockKeyringStore::new()));
        let _app = crate::app::CliApp::new("cohere").login_flow(
            CommandLoginFlow::new("MyAuth")
                .command("gcloud auth print-identity-token --audiences=$AUD")
                .header("Authentication")
                .prefix("Bearer"),
        );
    }
}
