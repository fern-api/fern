//! Login flows and the `auth` subcommand surface (`login` / `logout` / `status`).
//!
//! Three flow types live here as concrete builders implementing the
//! [`LoginFlow`] trait:
//!
//! - [`TokenPasteLoginFlow`] — read a token from stdin into the keyring.
//!   Always available on every CLI via `auth login --with-token`,
//!   regardless of whether an OAuth flow is declared (ADR-0007).
//! - `DeviceCodeLoginFlow` — RFC 8628 device-code grant. **TB3, in
//!   [`crate::auth::oauth2`].**
//! - `PkceLoginFlow` — authorization-code + PKCE with a loopback
//!   listener. **TB4, in [`crate::auth::oauth2`].**
//!
//! The `auth` subcommand is always grafted into every CliApp at run
//! time (ADR-0007 § "always-graft"). It exposes:
//!
//! ```text
//! <bin> auth login              # run the declared flow
//! <bin> auth login --with-token # paste a token (universal escape hatch)
//! <bin> auth logout             # clear keyring entry
//! <bin> auth status             # show every credential source per scheme,
//!                               # marking shadowing
//! ```

use std::io::{IsTerminal, Write};
use std::sync::Arc;

use clap::{Arg, ArgAction, ArgMatches, Command};

use crate::auth::builder::SchemeBinding;
use crate::auth::credential::{AuthCredentialSource, CredentialSlots};
use crate::auth::keyring_store::active_store;
use crate::error::CliError;

// ---------------------------------------------------------------------------
// Color helpers — used by `auth status` and the login-flow progress lines.
// ---------------------------------------------------------------------------
//
// Rules:
//   - Color only when stderr is a TTY (status writes there; piped output
//     stays plain).
//   - Honor the `NO_COLOR` convention (https://no-color.org).
//   - `--json` output never gets colored (separate code path).
//
// Codes:
//   bold=1, dim=2, red=31, green=32, yellow=33, bright-black/grey=90, reset=0
fn use_colors() -> bool {
    if std::env::var_os("NO_COLOR").is_some_and(|v| !v.is_empty()) {
        return false;
    }
    std::io::stderr().is_terminal()
}

pub(crate) fn paint(s: &str, code: &str) -> String {
    if use_colors() {
        format!("\x1b[{code}m{s}\x1b[0m")
    } else {
        s.to_string()
    }
}

/// Bold for scheme headers.
pub(crate) fn bold(s: &str) -> String {
    paint(s, "1")
}

/// Green for "active source" + flow-success checkmarks.
pub(crate) fn green(s: &str) -> String {
    paint(s, "32")
}

/// Dim (grey) for shadowed and missing sources — keeps them visible but
/// pushes them visually behind the active source.
pub(crate) fn dim(s: &str) -> String {
    paint(s, "2")
}

/// Yellow for warnings ("env var shadows keyring", "session expired").
pub(crate) fn yellow(s: &str) -> String {
    paint(s, "33")
}

// ---------------------------------------------------------------------------
// LoginFlow trait
// ---------------------------------------------------------------------------

/// Per-binding declaration of how `<bin> auth login` acquires credentials.
///
/// Each CLI declares **exactly one** flow per scheme (ADR-0007 § one-shot).
/// `--with-token` is a runtime escape hatch on every flow, not a separate
/// declaration.
pub trait LoginFlow: Send + Sync + std::fmt::Debug {
    /// Diagnostic flow-type name ("device-code", "pkce", "token-paste").
    fn flow_type(&self) -> &'static str;
    /// Auth scheme name this flow populates — matches the scheme key in
    /// the spec's `components.securitySchemes`.
    fn scheme_name(&self) -> &str;
    /// Execute the flow. On success, the resulting credential lives in
    /// the active keyring at `(cli_name, scheme_name)`. Implementations
    /// should print human-readable progress to stderr.
    fn run(&self, ctx: &LoginContext) -> Result<(), CliError>;
    /// Optional hint URL surfaced to the user during `--with-token`
    /// (where to grab a token from). All flows can carry this — for
    /// PKCE / device-code it's the dashboard URL the user would use if
    /// they bypassed the OAuth dance.
    fn token_paste_url(&self) -> Option<&str> {
        None
    }
    /// Optional request-time auth provider the flow needs registered.
    ///
    /// `TokenPasteLoginFlow` returns `None` — the paste path stores a
    /// raw string in the keyring and the existing typed builders'
    /// keyring source picks it up via the standard chain.
    ///
    /// `DeviceCodeLoginFlow` / `PkceLoginFlow` return
    /// `Some(OAuth2KeyringProvider)` — refresh + Bearer-header logic
    /// can't live in the credential-source layer because it requires
    /// async I/O and access to the flow's `token_url` and `client_id`.
    fn build_auth_provider(
        &self,
        _cli_name: &str,
    ) -> Option<crate::auth::provider::DynAuthProvider> {
        None
    }
}

/// Runtime context for executing a login flow.
#[derive(Debug, Clone)]
pub struct LoginContext {
    pub cli_name: String,
    /// `--no-browser` flag — relevant for PKCE / device-code.
    pub no_browser: bool,
}

/// Boxed login-flow handle stored on `CliApp`.
pub type DynLoginFlow = Arc<dyn LoginFlow>;

// ---------------------------------------------------------------------------
// TokenPasteLoginFlow
// ---------------------------------------------------------------------------

/// Read a token from stdin and stash it in the keyring. The universal
/// "paste a token" path — works for OAuth bearer tokens, raw API keys,
/// anything that's a single opaque string.
///
/// This is the *declared* flow when a binary has no OAuth. It's also
/// the *escape hatch* (`auth login --with-token`) on every other binary,
/// regardless of declared flow.
#[derive(Debug, Clone)]
pub struct TokenPasteLoginFlow {
    scheme: String,
    /// Optional hint URL — where the user can find a token to paste.
    /// Surfaces in the prompt printed before stdin is read.
    /// Derived from `x-fern-cli-auth.token_paste_url` upstream, or set
    /// directly via [`Self::token_paste_url`].
    token_paste_url: Option<String>,
}

impl TokenPasteLoginFlow {
    pub fn new(scheme: impl Into<String>) -> Self {
        Self {
            scheme: scheme.into(),
            token_paste_url: None,
        }
    }

    pub fn token_paste_url(mut self, url: impl Into<String>) -> Self {
        self.token_paste_url = Some(url.into());
        self
    }
}

impl LoginFlow for TokenPasteLoginFlow {
    fn flow_type(&self) -> &'static str {
        "token-paste"
    }
    fn scheme_name(&self) -> &str {
        &self.scheme
    }
    fn run(&self, ctx: &LoginContext) -> Result<(), CliError> {
        run_token_paste(&ctx.cli_name, &self.scheme, self.token_paste_url.as_deref())
    }
    fn token_paste_url(&self) -> Option<&str> {
        self.token_paste_url.as_deref()
    }
}

/// Concrete token-paste implementation, separated so the universal
/// `--with-token` escape hatch (TB2) can reuse it without an
/// explicit `TokenPasteLoginFlow` declaration on the binding.
pub fn run_token_paste(
    cli_name: &str,
    scheme_name: &str,
    token_paste_url: Option<&str>,
) -> Result<(), CliError> {
    let stderr = std::io::stderr();
    let mut err = stderr.lock();

    if let Some(url) = token_paste_url {
        let _ = writeln!(err, "Get your token at: {url}");
    }
    let _ = writeln!(err, "Paste your token (input will be read from stdin):");
    let _ = err.flush();

    let token = read_token_from_stdin()?;
    active_store().set(cli_name, scheme_name, &token)?;

    let _ = writeln!(
        err,
        "{}",
        green(&format!(
            "✓ Stored credential for {cli_name}:{scheme_name} in {}",
            active_store().backend_label()
        ))
    );

    warn_if_env_shadows(&mut err, cli_name, scheme_name);
    Ok(())
}

/// Read a single line from stdin, trimmed. Returns `Auth("No token …")`
/// if empty / EOF.
fn read_token_from_stdin() -> Result<String, CliError> {
    use std::io::BufRead;
    let stdin = std::io::stdin();
    let mut line = String::new();
    stdin
        .lock()
        .read_line(&mut line)
        .map_err(|e| CliError::Auth(format!("Failed to read token from stdin: {e}")))?;
    let trimmed = line.trim().to_string();
    if trimmed.is_empty() {
        return Err(CliError::Auth(
            "No token provided on stdin. Pipe the token in or type it followed by Enter."
                .to_string(),
        ));
    }
    Ok(trimmed)
}

// ---------------------------------------------------------------------------
// `auth` subcommand assembly + dispatch
// ---------------------------------------------------------------------------

/// Build the `auth` subcommand subtree. Grafted onto every CliApp by
/// [`crate::app::CliApp::run`] regardless of declared flows.
pub fn build_auth_command() -> Command {
    Command::new("auth")
        .about("Manage credentials (login / logout / status)")
        .arg_required_else_help(true)
        .subcommand(
            Command::new("login")
                .about("Authenticate this CLI (runs the declared OAuth flow, or pastes a token)")
                .arg(
                    Arg::new("with-token")
                        .long("with-token")
                        .action(ArgAction::SetTrue)
                        .help("Bypass any declared OAuth flow; read a token from stdin into the keyring"),
                )
                .arg(
                    Arg::new("scheme")
                        .long("scheme")
                        .help("Auth scheme name (required when multiple are declared)"),
                )
                .arg(
                    Arg::new("no-browser")
                        .long("no-browser")
                        .action(ArgAction::SetTrue)
                        .help("Don't auto-open a browser (PKCE / device-code flows)"),
                ),
        )
        .subcommand(
            Command::new("logout")
                .about("Remove stored credentials from the keyring")
                .arg(
                    Arg::new("scheme")
                        .long("scheme")
                        .help("Auth scheme name (required when multiple are declared)"),
                ),
        )
        .subcommand(
            Command::new("status")
                .about("Show every credential source for each declared scheme")
                .arg(
                    Arg::new("json")
                        .long("json")
                        .action(ArgAction::SetTrue)
                        .help("Emit machine-readable JSON (for agents)"),
                ),
        )
}

/// Dispatch into the matched `auth` subcommand. Called by `CliApp::run`
/// after argv is parsed.
///
/// `out` is the stdout sink used for machine-readable output (`status --json`).
/// Human-readable progress goes to stderr unconditionally.
///
/// Returns `Ok(())` on success and exits zero; `Err(CliError)` surfaces
/// the standard JSON error and exits non-zero.
pub fn dispatch_auth<W: Write>(
    matches: &ArgMatches,
    cli_name: &str,
    auth_bindings: &[(String, SchemeBinding)],
    login_flows: &[DynLoginFlow],
    out: &mut W,
) -> Result<(), CliError> {
    match matches.subcommand() {
        Some(("login", m)) => handle_login(m, cli_name, auth_bindings, login_flows),
        Some(("logout", m)) => handle_logout(m, cli_name, auth_bindings),
        Some(("status", m)) => handle_status(m, cli_name, auth_bindings, login_flows, out),
        _ => Err(CliError::Validation(
            "auth requires a subcommand: login, logout, or status".to_string(),
        )),
    }
}

fn handle_login(
    matches: &ArgMatches,
    cli_name: &str,
    auth_bindings: &[(String, SchemeBinding)],
    login_flows: &[DynLoginFlow],
) -> Result<(), CliError> {
    let with_token = matches.get_flag("with-token");
    let no_browser = matches.get_flag("no-browser");

    // `--with-token` is the universal escape hatch (ADR-0007 §
    // "always-graft"): every Fern CLI accepts a pasted token, regardless
    // of whether `auth(...)` / `login_flow(...)` registered any schemes.
    // When nothing is registered, the user must name the keyring slot
    // explicitly via `--scheme`; otherwise resolve_scheme's normal rules
    // (single-binding / single-flow / disambiguation) apply.
    let scheme = if with_token && auth_bindings.is_empty() && login_flows.is_empty() {
        matches
            .get_one::<String>("scheme")
            .cloned()
            .ok_or_else(|| {
                CliError::Validation(
                    "This CLI declares no auth schemes. Pass `--scheme <name>` to choose \
                     the keyring slot for your token.".to_string(),
                )
            })?
    } else {
        resolve_scheme(matches.get_one::<String>("scheme"), auth_bindings, login_flows)?
    };

    if with_token {
        // Universal paste path — surfaces the token_paste_url hint from
        // any declared flow for this scheme (regardless of flow type),
        // since the dashboard URL is meaningful for paste no matter which
        // OAuth grant the binary declares.
        let hint: Option<String> = login_flows
            .iter()
            .find(|f| f.scheme_name() == scheme)
            .and_then(|f| f.token_paste_url().map(str::to_string));
        return run_token_paste(cli_name, &scheme, hint.as_deref());
    }

    // Run the declared flow for this scheme.
    let flow = login_flows.iter().find(|f| f.scheme_name() == scheme);
    match flow {
        Some(f) => {
            let ctx = LoginContext {
                cli_name: cli_name.to_string(),
                no_browser,
            };
            f.run(&ctx)?;
            warn_if_env_shadows(&mut std::io::stderr().lock(), cli_name, &scheme);
            Ok(())
        }
        None => Err(CliError::Validation(format!(
            "No login flow declared for scheme `{scheme}`. Use `auth login --with-token` to paste a token directly."
        ))),
    }
}

fn handle_logout(
    matches: &ArgMatches,
    cli_name: &str,
    auth_bindings: &[(String, SchemeBinding)],
) -> Result<(), CliError> {
    let scheme = resolve_scheme(matches.get_one::<String>("scheme"), auth_bindings, &[])?;
    active_store().delete(cli_name, &scheme)?;
    let _ = writeln!(
        std::io::stderr().lock(),
        "{}",
        green(&format!(
            "✓ Removed credential for {cli_name}:{scheme} from {}.",
            active_store().backend_label()
        ))
    );
    Ok(())
}

fn handle_status<W: Write>(
    matches: &ArgMatches,
    cli_name: &str,
    auth_bindings: &[(String, SchemeBinding)],
    login_flows: &[DynLoginFlow],
    out: &mut W,
) -> Result<(), CliError> {
    // `--json` is this subcommand's own boolean and predates the global
    // `--format`. Honouring only that made `auth status --format json` print
    // the human table with no error and no hint — the one command an agent
    // needs before anything else, silently ignoring the flag it was taught to
    // use everywhere else. `--format` (and the piped default behind it) now
    // decides too; `--json` stays as an alias so existing scripts keep working.
    let as_json = matches.get_flag("json")
        || crate::formatter::OutputPipeline::from_matches(matches, cli_name)
            .map(|pipeline| pipeline.format.is_machine_readable())
            .unwrap_or(false);
    let store = active_store();
    let backend = store.backend_label();

    if as_json {
        let entries: Vec<_> = auth_bindings
            .iter()
            .map(|(name, binding)| status_entry_for(cli_name, name, binding, login_flows))
            .collect();
        let payload = serde_json::json!({
            "cli": cli_name,
            "backend": backend,
            "schemes": entries,
        });
        writeln!(out, "{}", serde_json::to_string_pretty(&payload).unwrap())
            .map_err(|e| CliError::Other(e.into()))?;
        return Ok(());
    }

    let mut stderr = std::io::stderr().lock();
    let _ = writeln!(
        stderr,
        "{}: credential status (storage backend: {backend})",
        bold(cli_name)
    );
    let _ = writeln!(stderr);

    if auth_bindings.is_empty() {
        let _ = writeln!(stderr, "  No auth schemes are declared on this CLI.");
        return Ok(());
    }

    for (scheme_name, binding) in auth_bindings {
        let flow = login_flows
            .iter()
            .find(|f| f.scheme_name() == scheme_name);

        let _ = writeln!(
            stderr,
            "  {} {}{}",
            bold("Scheme:"),
            bold(scheme_name),
            flow.map(|f| dim(&format!(" (login flow: {})", f.flow_type())))
                .unwrap_or_default()
        );

        let slots = expand_slots(scheme_name, binding, login_flows, cli_name);
        if slots.is_empty() {
            let _ = writeln!(stderr, "    {}", dim("(no credential sources bound)"));
            let _ = writeln!(stderr);
            continue;
        }

        let report = evaluate_slots(&slots);
        for line in &report.lines {
            let painted = match line.state {
                "active" => green(&format!("✓ active    {}", line.description)),
                "shadowed" => dim(&format!("  shadowed  {}", line.description)),
                _ => dim(&format!("  missing   {}", line.description)),
            };
            let _ = writeln!(stderr, "    {painted}");
        }
        if !report.satisfied {
            let _ = writeln!(
                stderr,
                "    {}",
                yellow(&remedy_line(cli_name, scheme_name, &report, login_flows))
            );
        }
        let _ = writeln!(stderr);
    }
    Ok(())
}

/// Resolve which scheme name to operate on. With one binding, infer it;
/// with multiple, require `--scheme`. Used by login + logout.
fn resolve_scheme(
    explicit: Option<&String>,
    auth_bindings: &[(String, SchemeBinding)],
    login_flows: &[DynLoginFlow],
) -> Result<String, CliError> {
    if let Some(s) = explicit {
        return Ok(s.clone());
    }
    // Prefer the schemes that have a declared LoginFlow when disambiguating.
    let flow_schemes: Vec<_> = login_flows.iter().map(|f| f.scheme_name()).collect();
    if flow_schemes.len() == 1 {
        return Ok(flow_schemes[0].to_string());
    }
    if auth_bindings.len() == 1 {
        return Ok(auth_bindings[0].0.clone());
    }
    if auth_bindings.is_empty() {
        return Err(CliError::Validation(
            "This CLI does not declare any auth schemes; nothing to log in to.".to_string(),
        ));
    }
    let names: Vec<&str> = auth_bindings.iter().map(|(n, _)| n.as_str()).collect();
    Err(CliError::Validation(format!(
        "Multiple auth schemes declared ({}). Pass --scheme <name> to disambiguate.",
        names.join(", "),
    )))
}

/// Expand a binding into its credential slots, for status reporting. Each
/// required slot is a flat list of leaf sources (Chain flattened) tried in
/// precedence order; a scheme authenticates when every required slot
/// resolves, or when one of the alternatives does (see
/// [`CredentialSlots`]). Bearer/API-key bindings have one slot, basic has
/// two (username, password).
///
/// `SchemeBinding::Custom` bindings report whatever the provider exposes
/// via [`AuthProvider::credential_slots`](crate::auth::AuthProvider::credential_slots)
/// — e.g. `OAuth2TokenProvider` lists its client-id / client-secret env
/// vars, plus a cached access token as an alternative. When the scheme
/// also has a declared login flow (i.e. registered via
/// `CliApp::login_flow`), we synthesize a `Keyring` source for the
/// matching `(cli_name, scheme_name)` slot — the OAuth login flows store
/// their token bundle there, and the status surface needs to see it.
/// Without this, OAuth-logged-in users would see "Not logged in" in
/// `auth status` even though the keyring entry is populated and apply()
/// can read it on every request.
fn expand_slots(
    scheme_name: &str,
    binding: &SchemeBinding,
    login_flows: &[DynLoginFlow],
    cli_name: &str,
) -> CredentialSlots {
    match binding {
        SchemeBinding::Token(s) => CredentialSlots::required([flatten_chain(s.clone())]),
        SchemeBinding::Basic { username, password } => CredentialSlots::required([
            flatten_chain(username.clone()),
            flatten_chain(password.clone()),
        ]),
        SchemeBinding::Custom(provider) => {
            let declared = provider.credential_slots();
            let mut slots = CredentialSlots {
                required: declared
                    .required
                    .into_iter()
                    .map(|slot| slot.into_iter().flat_map(flatten_chain).collect())
                    .filter(|slot: &Vec<AuthCredentialSource>| !slot.is_empty())
                    .collect(),
                alternatives: declared
                    .alternatives
                    .into_iter()
                    .flat_map(flatten_chain)
                    .collect(),
            };
            if login_flows.iter().any(|f| f.scheme_name() == scheme_name) {
                slots
                    .required
                    .push(vec![AuthCredentialSource::keyring(cli_name, scheme_name)]);
            }
            slots
        }
    }
}

/// One credential source as `auth status` renders it: what it is, and
/// whether it currently supplies a value.
struct SourceState {
    description: String,
    state: &'static str,
}

/// The evaluated state of a scheme's credential slots — one line per
/// source (alternatives first, since they win at request time), plus the
/// facts the remedy line needs.
struct CredentialReport {
    lines: Vec<SourceState>,
    /// Every required slot resolved, or an alternative did.
    satisfied: bool,
    /// Env vars belonging to required slots that failed to resolve, in
    /// declaration order — what the user has to set.
    missing_env_vars: Vec<String>,
    /// A keyring source appears somewhere in the slots, i.e. `auth login
    /// --with-token` would actually be read back at request time.
    reads_keyring: bool,
}

/// Resolve every source once and classify it. Within a slot the first
/// source that resolves is ACTIVE and later ones are SHADOWED — the
/// credential is there but a higher-precedence source is winning.
/// Non-resolving sources are MISSING: declared but unset. Slots don't
/// shadow each other; multi-slot schemes (basic, OAuth client
/// credentials) need every slot to resolve.
fn evaluate_slots(slots: &CredentialSlots) -> CredentialReport {
    let mut lines = Vec::new();
    let mut missing_env_vars = Vec::new();
    let mut reads_keyring = false;
    let mut alternative_active = false;
    let mut all_required_active = !slots.required.is_empty();

    let mut classify = |source: &AuthCredentialSource, active_found: &mut bool| -> bool {
        let has_value = source.resolve().is_some();
        let state = match (has_value, *active_found) {
            (true, false) => {
                *active_found = true;
                "active"
            }
            (true, true) => "shadowed",
            (false, _) => "missing",
        };
        if matches!(source, AuthCredentialSource::Keyring { .. }) {
            reads_keyring = true;
        }
        lines.push(SourceState {
            description: describe_source(source),
            state,
        });
        has_value
    };

    for source in &slots.alternatives {
        classify(source, &mut alternative_active);
    }
    for slot in &slots.required {
        let mut active_found = false;
        for source in slot {
            classify(source, &mut active_found);
        }
        if !active_found {
            missing_env_vars.extend(slot.iter().filter_map(|source| match source {
                AuthCredentialSource::Env(name) => Some(name.clone()),
                _ => None,
            }));
        }
        all_required_active &= active_found;
    }

    CredentialReport {
        lines,
        satisfied: alternative_active || all_required_active,
        missing_env_vars,
        reads_keyring,
    }
}

/// What to tell a user whose scheme didn't resolve. The remedy has to
/// match how the scheme actually reads credentials: `auth login
/// --with-token` writes the keyring, so suggesting it for a scheme that
/// never reads the keyring (OAuth client credentials, basic auth) sends
/// the user down a path that silently does nothing.
fn remedy_line(
    cli_name: &str,
    scheme_name: &str,
    report: &CredentialReport,
    login_flows: &[DynLoginFlow],
) -> String {
    if login_flows.iter().any(|f| f.scheme_name() == scheme_name) {
        format!("Not logged in. Run `{cli_name} auth login` to authenticate.")
    } else if report.reads_keyring {
        format!("Not logged in. Run `{cli_name} auth login --with-token` to authenticate.")
    } else if !report.missing_env_vars.is_empty() {
        format!(
            "Not logged in. Set {} to authenticate.",
            report.missing_env_vars.join(", ")
        )
    } else {
        "Not logged in.".to_string()
    }
}

fn flatten_chain(s: AuthCredentialSource) -> Vec<AuthCredentialSource> {
    match s {
        AuthCredentialSource::Chain(children) => {
            children.into_iter().flat_map(flatten_chain).collect()
        }
        other => vec![other],
    }
}

fn describe_source(s: &AuthCredentialSource) -> String {
    match s {
        AuthCredentialSource::Env(name) => format!("{name} env var"),
        AuthCredentialSource::Cli(arg) => format!("--{arg} flag"),
        AuthCredentialSource::File(path) => format!("{} file", path.display()),
        AuthCredentialSource::Literal(_) => "built-in literal".to_string(),
        AuthCredentialSource::Keyring { service, account } => {
            format!("keyring entry {service}:{account}")
        }
        AuthCredentialSource::Closure(_, Some(hint)) => hint.clone(),
        AuthCredentialSource::Closure(_, None) => "custom resolver".to_string(),
        AuthCredentialSource::Chain(_) => unreachable!("flatten_chain removes nested Chains"),
        AuthCredentialSource::Missing => "(unbound)".to_string(),
    }
}

/// Print a shadow warning if an env var has a value while a keyring
/// entry is about to be written (or has just been written) — saves
/// the user from the "I logged in but my old env still wins" footgun
/// (ADR-0008 § shadowing).
fn warn_if_env_shadows<W: Write>(out: &mut W, cli_name: &str, scheme_name: &str) {
    // Heuristic env-var names to check: <CLI>_<SCHEME>, <CLI>_TOKEN,
    // <CLI>_API_KEY, <SCHEME>_TOKEN. Matches what generated binaries
    // typically wire.
    let upper_cli = cli_name.to_uppercase().replace('-', "_");
    let upper_scheme = scheme_name.to_uppercase().replace('-', "_");
    let candidates = [
        format!("{upper_cli}_{upper_scheme}"),
        format!("{upper_cli}_TOKEN"),
        format!("{upper_cli}_API_KEY"),
        upper_scheme.clone(),
    ];
    for name in candidates {
        if let Ok(v) = std::env::var(&name) {
            if !v.trim().is_empty() {
                let _ = writeln!(
                    out,
                    "{}",
                    yellow(&format!(
                        "⚠ Warning: env var `{name}` is set; it will shadow the keyring entry. \
                         Unset it to use the credential you just stored."
                    ))
                );
                return;
            }
        }
    }
}

fn status_entry_for(
    cli_name: &str,
    scheme_name: &str,
    binding: &SchemeBinding,
    login_flows: &[DynLoginFlow],
) -> serde_json::Value {
    let flow = login_flows
        .iter()
        .find(|f| f.scheme_name() == scheme_name)
        .map(|f| f.flow_type());
    let slots = expand_slots(scheme_name, binding, login_flows, cli_name);
    let report = evaluate_slots(&slots);
    let entries: Vec<serde_json::Value> = report
        .lines
        .iter()
        .map(|line| {
            serde_json::json!({
                "state": line.state,
                "source": line.description,
            })
        })
        .collect();
    serde_json::json!({
        "scheme": scheme_name,
        "login_flow": flow,
        "logged_in": report.satisfied,
        "sources": entries,
        "cli": cli_name,
    })
}

/// Inject a keyring source into each binding's credential chain so
/// every CLI's auth resolution gets the keyring layer for free.
///
/// Called by `CliApp::run` before bindings are propagated. Precedence
/// stays CLI > env > keyring > file — keyring is appended last in the
/// existing chain so any explicit user-configured source wins.
pub fn inject_keyring_sources(
    cli_name: &str,
    bindings: &mut [(String, SchemeBinding)],
) {
    for (scheme_name, binding) in bindings.iter_mut() {
        let kr = AuthCredentialSource::keyring(cli_name, scheme_name.as_str());
        match binding {
            SchemeBinding::Token(src) => {
                let existing = std::mem::replace(src, AuthCredentialSource::Missing);
                *src = append_to_chain(existing, kr);
            }
            // Basic auth: username/password are separate, but the typical
            // shape stores both in a single keyring entry encoded as JSON.
            // For v1 we leave Basic alone — username-only/password-only
            // schemes already work via env; full Basic is a v2 concern.
            SchemeBinding::Basic { .. } => {}
            SchemeBinding::Custom(_) => {}
        }
    }
}

/// Wire on-disk token caching into every [`OAuth2TokenProvider`] reachable
/// from the bindings. Called after [`inject_keyring_sources`] but before
/// propagation to subcommands.
pub fn inject_oauth2_caches(cli_name: &str, bindings: &mut [(String, SchemeBinding)]) {
    for (_scheme_name, binding) in bindings.iter_mut() {
        if let SchemeBinding::Custom(provider) = binding {
            provider.inject_token_cache(cli_name);
        }
    }
}

fn append_to_chain(
    existing: AuthCredentialSource,
    addition: AuthCredentialSource,
) -> AuthCredentialSource {
    match existing {
        AuthCredentialSource::Chain(mut sources) => {
            sources.push(addition);
            AuthCredentialSource::Chain(sources)
        }
        AuthCredentialSource::Missing => addition,
        single => AuthCredentialSource::Chain(vec![single, addition]),
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::auth::keyring_store::{set_active_store, KeyringStore, MockKeyringStore};
    use serial_test::serial;
    use std::sync::Arc;

    #[test]
    fn token_paste_flow_type_and_scheme() {
        let f = TokenPasteLoginFlow::new("OAuth2");
        assert_eq!(f.flow_type(), "token-paste");
        assert_eq!(f.scheme_name(), "OAuth2");
    }

    #[test]
    fn token_paste_with_url_carries_hint() {
        let f = TokenPasteLoginFlow::new("OAuth2")
            .token_paste_url("https://example.com/settings");
        assert_eq!(f.token_paste_url.as_deref(), Some("https://example.com/settings"));
    }

    #[test]
    fn inject_keyring_into_single_env_source() {
        let mut bindings = vec![(
            "OAuth2".to_string(),
            SchemeBinding::Token(AuthCredentialSource::from_env("MY_TOKEN")),
        )];
        inject_keyring_sources("my-cli", &mut bindings);
        match &bindings[0].1 {
            SchemeBinding::Token(AuthCredentialSource::Chain(sources)) => {
                assert_eq!(sources.len(), 2);
                assert!(matches!(sources[0], AuthCredentialSource::Env(_)));
                assert!(matches!(
                    sources[1],
                    AuthCredentialSource::Keyring { ref service, ref account }
                    if service == "my-cli" && account == "OAuth2"
                ));
            }
            _ => panic!("expected Token(Chain([Env, Keyring]))"),
        }
    }

    #[test]
    fn inject_keyring_appends_to_existing_chain() {
        let mut bindings = vec![(
            "scheme1".to_string(),
            SchemeBinding::Token(AuthCredentialSource::any([
                AuthCredentialSource::cli("api-token"),
                AuthCredentialSource::from_env("MY_TOKEN"),
            ])),
        )];
        inject_keyring_sources("cli", &mut bindings);
        match &bindings[0].1 {
            SchemeBinding::Token(AuthCredentialSource::Chain(sources)) => {
                assert_eq!(sources.len(), 3);
                assert!(matches!(sources[0], AuthCredentialSource::Cli(_)));
                assert!(matches!(sources[1], AuthCredentialSource::Env(_)));
                assert!(matches!(sources[2], AuthCredentialSource::Keyring { .. }));
            }
            _ => panic!("expected Chain"),
        }
    }

    #[test]
    fn inject_keyring_promotes_missing_to_keyring_alone() {
        let mut bindings = vec![(
            "scheme1".to_string(),
            SchemeBinding::Token(AuthCredentialSource::Missing),
        )];
        inject_keyring_sources("cli", &mut bindings);
        match &bindings[0].1 {
            SchemeBinding::Token(AuthCredentialSource::Keyring { service, account }) => {
                assert_eq!(service, "cli");
                assert_eq!(account, "scheme1");
            }
            _ => panic!("expected single Keyring source"),
        }
    }

    #[test]
    fn resolve_scheme_single_binding_no_arg() {
        let bindings = vec![(
            "only".to_string(),
            SchemeBinding::Token(AuthCredentialSource::Missing),
        )];
        let s = resolve_scheme(None, &bindings, &[]).unwrap();
        assert_eq!(s, "only");
    }

    #[test]
    fn resolve_scheme_explicit_wins() {
        let bindings = vec![
            ("a".to_string(), SchemeBinding::Token(AuthCredentialSource::Missing)),
            ("b".to_string(), SchemeBinding::Token(AuthCredentialSource::Missing)),
        ];
        let s = resolve_scheme(Some(&"b".to_string()), &bindings, &[]).unwrap();
        assert_eq!(s, "b");
    }

    #[test]
    fn resolve_scheme_multiple_bindings_no_arg_errors() {
        let bindings = vec![
            ("a".to_string(), SchemeBinding::Token(AuthCredentialSource::Missing)),
            ("b".to_string(), SchemeBinding::Token(AuthCredentialSource::Missing)),
        ];
        let err = resolve_scheme(None, &bindings, &[]).unwrap_err();
        match err {
            CliError::Validation(m) => {
                assert!(m.contains("--scheme"));
                assert!(m.contains("a"));
                assert!(m.contains("b"));
            }
            _ => panic!("expected Validation error"),
        }
    }

    #[test]
    fn resolve_scheme_disambiguates_via_single_login_flow() {
        // Multiple bindings, but only one has a declared login flow → use it.
        let bindings = vec![
            ("a".to_string(), SchemeBinding::Token(AuthCredentialSource::Missing)),
            ("b".to_string(), SchemeBinding::Token(AuthCredentialSource::Missing)),
        ];
        let flows: Vec<DynLoginFlow> = vec![Arc::new(TokenPasteLoginFlow::new("b"))];
        let s = resolve_scheme(None, &bindings, &flows).unwrap();
        assert_eq!(s, "b");
    }

    #[test]
    #[serial]
    fn paint_is_a_noop_when_colors_are_disabled() {
        // `paint` must emit no ANSI codes when colors are off. Force the
        // no-color path explicitly via `NO_COLOR` rather than relying on
        // stderr not being a TTY: `cargo test` captures each test's stdout
        // but leaves stderr attached to the terminal, so in an interactive
        // shell `stderr().is_terminal()` is true and `use_colors()` would
        // flip on — making this test's outcome depend on how the suite was
        // launched. `#[serial]` keeps the process-global env mutation from
        // racing the other env-touching tests in this module.
        let prev = std::env::var_os("NO_COLOR");
        std::env::set_var("NO_COLOR", "1");

        assert_eq!(green("ok"), "ok");
        assert!(!dim("shadow").contains('\x1b'));
        assert!(!yellow("warn").contains('\x1b'));
        assert!(!bold("hdr").contains('\x1b'));

        match prev {
            Some(value) => std::env::set_var("NO_COLOR", value),
            None => std::env::remove_var("NO_COLOR"),
        }
    }

    #[test]
    #[serial]
    fn with_token_resolves_scheme_from_explicit_arg_when_bindingless() {
        // ADR-0007 § always-graft: ElevenLabs (no auth_bindings, no
        // login_flows) must still accept `auth login --with-token`. With
        // --scheme passed, resolution picks it up from the flag instead
        // of bailing on the empty bindings list. (The full handle_login
        // path that reads stdin is exercised by tests/oauth_fixture_wire.rs.)
        let cmd = build_auth_command();
        let m = cmd
            .try_get_matches_from(vec![
                "auth", "login", "--with-token", "--scheme", "api-key",
            ])
            .unwrap();
        let (_, sub) = m.subcommand().unwrap();
        assert!(sub.get_flag("with-token"));
        assert_eq!(sub.get_one::<String>("scheme").map(String::as_str), Some("api-key"));
    }

    #[test]
    #[serial]
    fn with_token_errors_on_bindingless_cli_without_explicit_scheme() {
        // Same setup but no --scheme. handle_login should produce a
        // Validation error pointing the user at --scheme — instead of
        // the old "no auth schemes; nothing to log in to" error that
        // violated ADR-0007's "works on every CLI" promise.
        use crate::auth::keyring_store::{set_active_store, MockKeyringStore};
        set_active_store(Arc::new(MockKeyringStore::new()));

        let cmd = build_auth_command();
        let m = cmd
            .try_get_matches_from(vec!["auth", "login", "--with-token"])
            .unwrap();
        let (_, sub) = m.subcommand().unwrap();

        let bindings: Vec<(String, SchemeBinding)> = vec![];
        let flows: Vec<DynLoginFlow> = vec![];
        match handle_login(sub, "my-cli", &bindings, &flows) {
            Err(CliError::Validation(msg)) => {
                assert!(
                    msg.contains("declares no auth schemes") && msg.contains("--scheme"),
                    "expected 'declares no auth schemes ... --scheme' message, got: {msg}"
                );
            }
            other => panic!("expected Validation error, got: {other:?}"),
        }
    }

    #[test]
    fn expand_slots_synthesises_keyring_for_oauth_custom_binding() {
        use crate::auth::provider::NoAuthProvider;
        // OAuth flows register their auth provider as Custom; expand_slots
        // must still surface the keyring slot for `auth status`.
        let binding = SchemeBinding::Custom(std::sync::Arc::new(NoAuthProvider));
        // Use a TokenPasteLoginFlow as a stand-in for any LoginFlow declared
        // against scheme "OAuth2" — the only thing expand_slots reads is
        // scheme_name().
        let flow: DynLoginFlow = std::sync::Arc::new(TokenPasteLoginFlow::new("OAuth2"));
        let slots = expand_slots("OAuth2", &binding, &[flow], "my-cli");
        assert!(slots.alternatives.is_empty());
        assert_eq!(slots.required.len(), 1);
        assert_eq!(slots.required[0].len(), 1);
        match &slots.required[0][0] {
            AuthCredentialSource::Keyring { service, account } => {
                assert_eq!(service, "my-cli");
                assert_eq!(account, "OAuth2");
            }
            other => panic!("expected synthesised Keyring source, got {other:?}"),
        }
    }

    #[test]
    fn expand_slots_returns_empty_for_custom_with_no_login_flow() {
        use crate::auth::provider::NoAuthProvider;
        // Custom bindings whose provider exposes no credential slots and
        // have no matching login_flow stay opaque — status output shows
        // "(no credential sources bound)".
        let binding = SchemeBinding::Custom(std::sync::Arc::new(NoAuthProvider));
        let slots = expand_slots("OAuth2", &binding, &[], "my-cli");
        assert!(slots.is_empty());
    }

    #[test]
    fn expand_slots_lists_oauth2_client_credentials_env_vars() {
        use crate::auth::root_builder::{AuthSchemeBuilder, OAuth2Auth};
        // A generated client-credentials scheme lowers to a Custom binding
        // wrapping OAuth2TokenProvider. `auth status` must enumerate its
        // client-id / client-secret env vars as two independent slots rather
        // than reporting "(no credential sources bound)".
        let (name, binding) = OAuth2Auth::new("oAuth2ClientCredentials")
            .token_url("https://example.com/oauth/token")
            .client_id_env("OAUTH_CLIENT_ID")
            .client_secret_env("OAUTH_CLIENT_SECRET")
            .into_binding();
        let slots = expand_slots(&name, &binding, &[], "my-cli");
        assert_eq!(slots.required.len(), 2);
        assert!(
            matches!(&slots.required[0][..], [AuthCredentialSource::Env(e)] if e == "OAUTH_CLIENT_ID")
        );
        assert!(
            matches!(&slots.required[1][..], [AuthCredentialSource::Env(e)] if e == "OAUTH_CLIENT_SECRET")
        );
    }

    #[test]
    fn status_reports_oauth2_client_credentials_env_vars() {
        use crate::auth::root_builder::{AuthSchemeBuilder, OAuth2Auth};
        std::env::set_var("STATUS_TEST_OAUTH_CLIENT_ID", "id");
        std::env::set_var("STATUS_TEST_OAUTH_CLIENT_SECRET", "secret");
        let (name, binding) = OAuth2Auth::new("oAuth2ClientCredentials")
            .token_url("https://example.com/oauth/token")
            .client_id_env("STATUS_TEST_OAUTH_CLIENT_ID")
            .client_secret_env("STATUS_TEST_OAUTH_CLIENT_SECRET")
            .into_binding();

        let entry = status_entry_for("my-cli", &name, &binding, &[]);
        assert_eq!(entry["logged_in"], true);
        let states: Vec<&str> = entry["sources"]
            .as_array()
            .unwrap()
            .iter()
            .map(|s| s["state"].as_str().unwrap())
            .collect();
        assert_eq!(states, ["active", "active"]);

        std::env::remove_var("STATUS_TEST_OAUTH_CLIENT_SECRET");
        let entry = status_entry_for("my-cli", &name, &binding, &[]);
        assert_eq!(entry["logged_in"], false);
        std::env::remove_var("STATUS_TEST_OAUTH_CLIENT_ID");
    }

    #[test]
    fn alternative_satisfies_scheme_without_hiding_required_env_vars() {
        // A cached OAuth token authenticates on its own, but the env vars
        // that mint it must still show up: the whole point of `auth status`
        // for a client-credentials scheme is answering "did you read my
        // OAUTH_CLIENT_ID?".
        let slots = CredentialSlots {
            required: vec![
                vec![AuthCredentialSource::from_env("NO_SUCH_ALT_TEST_ID")],
                vec![AuthCredentialSource::from_env("NO_SUCH_ALT_TEST_SECRET")],
            ],
            alternatives: vec![AuthCredentialSource::Closure(
                std::sync::Arc::new(|| Some("cached-tok".to_string())),
                Some("cached OAuth token (/tmp/credentials.json)".to_string()),
            )],
        };

        let report = evaluate_slots(&slots);
        assert!(report.satisfied);
        let rendered: Vec<(&str, &str)> = report
            .lines
            .iter()
            .map(|l| (l.state, l.description.as_str()))
            .collect();
        assert_eq!(
            rendered,
            vec![
                ("active", "cached OAuth token (/tmp/credentials.json)"),
                ("missing", "NO_SUCH_ALT_TEST_ID env var"),
                ("missing", "NO_SUCH_ALT_TEST_SECRET env var"),
            ]
        );
        assert_eq!(
            report.missing_env_vars,
            vec!["NO_SUCH_ALT_TEST_ID", "NO_SUCH_ALT_TEST_SECRET"]
        );
    }

    #[test]
    fn remedy_names_missing_env_vars_when_the_scheme_never_reads_the_keyring() {
        // `auth login --with-token` writes the keyring; OAuth client
        // credentials never read it, so suggesting it would send the user
        // down a path that silently does nothing.
        let slots = CredentialSlots::required([
            vec![AuthCredentialSource::from_env("NO_SUCH_REMEDY_ID")],
            vec![AuthCredentialSource::from_env("NO_SUCH_REMEDY_SECRET")],
        ]);
        let report = evaluate_slots(&slots);
        assert!(!report.satisfied);
        assert!(!report.reads_keyring);

        let line = remedy_line("my-cli", "oAuth2ClientCredentials", &report, &[]);
        assert_eq!(
            line,
            "Not logged in. Set NO_SUCH_REMEDY_ID, NO_SUCH_REMEDY_SECRET to authenticate."
        );
    }

    #[test]
    #[serial]
    fn remedy_suggests_with_token_when_the_scheme_reads_the_keyring() {
        // Token bindings get a keyring source injected, so `--with-token`
        // really is the fix there.
        set_active_store(Arc::new(MockKeyringStore::new()));
        let slots = CredentialSlots::required([vec![
            AuthCredentialSource::from_env("NO_SUCH_REMEDY_TOKEN"),
            AuthCredentialSource::keyring("my-cli", "OAuth2"),
        ]]);
        let report = evaluate_slots(&slots);
        assert!(!report.satisfied);
        assert!(report.reads_keyring);
        assert_eq!(
            remedy_line("my-cli", "OAuth2", &report, &[]),
            "Not logged in. Run `my-cli auth login --with-token` to authenticate."
        );
    }

    #[test]
    fn remedy_points_at_the_login_flow_when_one_is_declared() {
        let slots = CredentialSlots::required([vec![AuthCredentialSource::from_env(
            "NO_SUCH_REMEDY_FLOW",
        )]]);
        let report = evaluate_slots(&slots);
        let flow: DynLoginFlow = std::sync::Arc::new(TokenPasteLoginFlow::new("OAuth2"));
        assert_eq!(
            remedy_line("my-cli", "OAuth2", &report, &[flow]),
            "Not logged in. Run `my-cli auth login` to authenticate."
        );
    }

    #[test]
    fn expand_slots_keeps_basic_halves_in_separate_slots() {
        // Username and password are both required; the password must not be
        // reported as "shadowed" by the username.
        let binding = SchemeBinding::Basic {
            username: AuthCredentialSource::from_env("USER"),
            password: AuthCredentialSource::from_env("PASS"),
        };
        let slots = expand_slots("basic", &binding, &[], "my-cli");
        assert_eq!(slots.required.len(), 2);
        assert!(matches!(&slots.required[0][..], [AuthCredentialSource::Env(e)] if e == "USER"));
        assert!(matches!(&slots.required[1][..], [AuthCredentialSource::Env(e)] if e == "PASS"));
    }

    #[test]
    fn flatten_chain_handles_nested_chains() {
        let s = AuthCredentialSource::any([
            AuthCredentialSource::from_env("A"),
            AuthCredentialSource::any([
                AuthCredentialSource::from_env("B"),
                AuthCredentialSource::literal("c"),
            ]),
        ]);
        let flat = flatten_chain(s);
        assert_eq!(flat.len(), 3);
    }

    #[test]
    fn describe_source_covers_all_variants() {
        assert_eq!(
            describe_source(&AuthCredentialSource::from_env("FOO")),
            "FOO env var"
        );
        assert_eq!(
            describe_source(&AuthCredentialSource::cli("api-token")),
            "--api-token flag"
        );
        assert!(describe_source(&AuthCredentialSource::keyring("cli", "scheme"))
            .contains("cli:scheme"));
    }

    #[test]
    #[serial]
    fn logout_clears_keyring_entry() {
        let mock = Arc::new(MockKeyringStore::new());
        mock.set("my-cli", "OAuth2", "token-abc").unwrap();
        set_active_store(mock.clone());

        let cmd = build_auth_command();
        let m = cmd
            .try_get_matches_from(vec!["auth", "logout", "--scheme", "OAuth2"])
            .unwrap();
        let bindings = vec![(
            "OAuth2".to_string(),
            SchemeBinding::Token(AuthCredentialSource::Missing),
        )];
        let (_, sub) = m.subcommand().unwrap();
        handle_logout(sub, "my-cli", &bindings).unwrap();
        let _ = handle_logout; // silence unused warning if other paths shift

        assert_eq!(mock.get("my-cli", "OAuth2").unwrap(), None);
    }

    #[test]
    #[serial]
    fn status_marks_env_as_active_keyring_as_shadowed() {
        let mock = Arc::new(MockKeyringStore::new());
        mock.set("my-cli", "OAuth2", "from-keyring").unwrap();
        set_active_store(mock);
        std::env::set_var("MY_CLI_OAUTH2_TEST", "from-env");

        let chain = AuthCredentialSource::any([
            AuthCredentialSource::from_env("MY_CLI_OAUTH2_TEST"),
            AuthCredentialSource::keyring("my-cli", "OAuth2"),
        ]);
        let slots = expand_slots("OAuth2", &SchemeBinding::Token(chain), &[], "my-cli");
        assert_eq!(slots.required.len(), 1);
        let sources = &slots.required[0];
        assert_eq!(sources.len(), 2);
        let env_resolves = sources[0].resolve().is_some();
        let keyring_resolves = sources[1].resolve().is_some();
        assert!(env_resolves);
        assert!(keyring_resolves);
        // (Status output assertion happens in handle_status, but the
        // underlying state — both resolve, env is first — is what makes
        // shadowing detectable. Direct test of handler is harder because
        // it writes to stderr.)

        std::env::remove_var("MY_CLI_OAUTH2_TEST");
    }

    #[test]
    fn inject_oauth2_caches_wires_cache_into_custom_provider() {
        use crate::auth::oauth2::{OAuth2Grant, OAuth2TokenProvider};

        let provider = Arc::new(OAuth2TokenProvider::new(
            "OAuth2",
            "https://example.com/token",
            OAuth2Grant::ClientCredentials {
                client_id_env: "CID".to_string(),
                client_secret_env: "CSEC".to_string(),
                scope: None,
            },
        ));
        assert!(!provider.has_cache());

        let mut bindings: Vec<(String, SchemeBinding)> = vec![(
            "OAuth2".to_string(),
            SchemeBinding::Custom(provider.clone()),
        )];
        inject_oauth2_caches("test-cli", &mut bindings);
        assert!(provider.has_cache());
    }

    #[test]
    fn inject_oauth2_caches_is_noop_for_token_bindings() {
        let mut bindings: Vec<(String, SchemeBinding)> = vec![(
            "bearer".to_string(),
            SchemeBinding::Token(AuthCredentialSource::from_env("MY_TOKEN")),
        )];
        // Should not panic or modify Token bindings
        inject_oauth2_caches("test-cli", &mut bindings);
        assert!(matches!(bindings[0].1, SchemeBinding::Token(_)));
    }

    #[test]
    fn inject_oauth2_caches_idempotent() {
        use crate::auth::oauth2::{OAuth2Grant, OAuth2TokenProvider};

        let provider = Arc::new(OAuth2TokenProvider::new(
            "OAuth2",
            "https://example.com/token",
            OAuth2Grant::ClientCredentials {
                client_id_env: "CID".to_string(),
                client_secret_env: "CSEC".to_string(),
                scope: None,
            },
        ));
        let mut bindings: Vec<(String, SchemeBinding)> = vec![(
            "OAuth2".to_string(),
            SchemeBinding::Custom(provider.clone()),
        )];
        inject_oauth2_caches("test-cli", &mut bindings);
        assert!(provider.has_cache());
        // Calling again should be a no-op (OnceLock prevents double-set)
        inject_oauth2_caches("other-cli", &mut bindings);
        assert!(provider.has_cache());
    }
}
