//! The `profiles` subcommand group: `create`, `list`, `use`, `remove`,
//! `current`.
//!
//! Grafted onto every CLI that opted in, through the same
//! `graft_builtin_command` path `auth` uses — so an API that owns a
//! top-level `profiles` resource gets the built-ins *folded into* its group
//! rather than colliding with it.
//!
//! `list` and `current` render through [`crate::formatter`], so
//! `--format json` works for free and the table form is consistent with
//! every other command on the CLI.

use std::collections::{BTreeMap, BTreeSet};
use std::io::{IsTerminal, Write};

use clap::{Arg, ArgAction, ArgMatches, Command};

use crate::auth::keyring_store::active_store;
use crate::auth::login::{self, DynLoginFlow};
use crate::auth::{AuthCredentialSource, SchemeBinding};
use crate::error::CliError;
use crate::profiles::selection;
use crate::profiles::store::{self, ProfileEntry, ProfileStore};
use crate::profiles::ProfilesConfig;

/// Names a profile may not take. `active` is a `profiles.toml` top-level key,
/// and the rest would make `profiles use <name>` ambiguous with a
/// subcommand.
const RESERVED_PROFILE_NAMES: &[&str] = &["create", "list", "use", "remove", "current", "env"];

/// One parameter a binding accepts, as `profiles create` needs to see it.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParameterSpec {
    /// A name the parameter answers to — either its wire name or the flag
    /// name `--help` shows. A binding contributes one entry per spelling.
    pub name: String,
    /// The values the parameter accepts, or `None` when it is unconstrained.
    ///
    /// `None` and `Some(vec![])` are deliberately different: the first means
    /// "any string", the second would mean "nothing is valid".
    pub allowed_values: Option<Vec<String>>,
}

impl ParameterSpec {
    pub fn unconstrained(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            allowed_values: None,
        }
    }

    pub fn with_values(name: impl Into<String>, values: Vec<String>) -> Self {
        Self {
            name: name.into(),
            allowed_values: Some(values),
        }
    }
}

/// The names — and, where an enum constrains them, the values — a profile's
/// `parameters` and `server_variables` may reference.
///
/// Collected from the registered bindings so `--set` can reject a name no
/// operation accepts. Without this a typo is a silent no-op: the profile
/// stores `AcountSid`, nothing ever reads it, and the user concludes
/// profiles do not work.
///
/// Values matter for the same reason names do, one step later. A profile
/// default lands in a `clap::Arg`'s `default_value`, so an enum value the
/// spec does not allow makes **every** command carrying that parameter fail
/// with `invalid value 'admin' for '--user-type'` — an error naming a flag
/// the user never passed, from a profile they set days earlier.
///
/// An empty vocabulary disables validation rather than rejecting everything
/// — a binding that cannot enumerate its parameters (GraphQL today) must not
/// make `--set` unusable.
#[derive(Debug, Clone, Default)]
pub struct Vocabulary {
    /// Normalized name → allowed values. `None` means the parameter is
    /// unconstrained *somewhere*, which is enough for any value to be valid.
    parameters: BTreeMap<String, Option<BTreeSet<String>>>,
    /// Original spellings, for error messages and suggestions.
    parameter_labels: BTreeSet<String>,
    pub server_variables: BTreeSet<String>,
}

impl Vocabulary {
    pub fn is_empty(&self) -> bool {
        self.parameters.is_empty() && self.server_variables.is_empty()
    }

    /// Fold one binding's parameters in.
    ///
    /// Allowed values are **unioned** across every operation declaring the
    /// name, and any unconstrained occurrence widens it to "anything". Both
    /// follow from what the check is for: rejecting a value that no operation
    /// would accept. A value that one operation accepts and another rejects
    /// is a legitimate configuration — the profile just does not apply
    /// cleanly to every command — and refusing it here would be wrong.
    pub fn add_parameters(&mut self, specs: impl IntoIterator<Item = ParameterSpec>) {
        for spec in specs {
            self.parameter_labels.insert(spec.name.clone());
            let key = crate::text::normalize_identifier(&spec.name);
            let entry = self.parameters.entry(key).or_insert_with(|| Some(BTreeSet::new()));
            match (entry.as_mut(), spec.allowed_values) {
                (Some(known), Some(values)) => known.extend(values),
                // Unconstrained anywhere → unconstrained everywhere.
                (Some(_), None) => *entry = None,
                (None, _) => {}
            }
        }
    }

    /// The parameter names, in their original spellings.
    pub fn parameter_labels(&self) -> &BTreeSet<String> {
        &self.parameter_labels
    }

    fn validate_parameter(&self, name: &str, value: &str) -> Result<(), CliError> {
        if self.parameters.is_empty() {
            return Ok(());
        }
        let Some(allowed) = self.parameters.get(&crate::text::normalize_identifier(name)) else {
            return Err(unknown_name_error(
                "parameter",
                name,
                &self.parameter_labels,
                "--set",
            ));
        };
        let Some(allowed) = allowed else {
            return Ok(());
        };
        if allowed.is_empty() || allowed.iter().any(|candidate| candidate == value) {
            return Ok(());
        }
        let suggestion = crate::text::nearest(value, allowed.iter().cloned())
            .map(|candidate| format!(" Did you mean `{candidate}`?"))
            .unwrap_or_default();
        Err(CliError::Validation(format!(
            "--set: `{value}` is not an accepted value for `{name}`.{suggestion} \
             Allowed: {}.",
            allowed.iter().cloned().collect::<Vec<_>>().join(", "),
        )))
    }

    fn validate_server_variable(&self, name: &str) -> Result<(), CliError> {
        if self.server_variables.is_empty() || self.contains(&self.server_variables, name) {
            return Ok(());
        }
        Err(unknown_name_error(
            "server variable",
            name,
            &self.server_variables,
            "--server-var",
        ))
    }

    /// Membership modulo spelling: a spec's `AccountSid` is matched by
    /// `account-sid` and `account_sid`, the two forms a user is likeliest to
    /// type after reading `--help`.
    fn contains(&self, set: &BTreeSet<String>, name: &str) -> bool {
        let wanted = crate::text::normalize_identifier(name);
        set.iter()
            .any(|candidate| crate::text::normalize_identifier(candidate) == wanted)
    }
}

fn unknown_name_error(
    kind: &str,
    name: &str,
    known: &BTreeSet<String>,
    flag: &str,
) -> CliError {
    let suggestion = crate::text::nearest(name, known.iter().cloned())
        .map(|candidate| format!(" Did you mean `{candidate}`?"))
        .unwrap_or_default();
    // The full list is genuinely useful for server variables (there are a
    // handful) and useless for parameters (there can be hundreds), so only
    // enumerate when it stays readable.
    let listing = if known.len() <= 12 {
        format!(
            " Known {kind}s: {}.",
            known.iter().cloned().collect::<Vec<_>>().join(", "),
        )
    } else {
        format!(
            " Run `--schema` to list the {} {kind}s this CLI accepts.",
            known.len(),
        )
    };
    CliError::Validation(format!(
        "{flag}: no operation accepts the {kind} `{name}`.{suggestion}{listing}"
    ))
}

// ── Command construction ────────────────────────────────────────────────

/// Build the `profiles` subtree.
///
/// `vocabulary` shapes the surface: each known server variable also gets a
/// convenience `--<name>` flag on `create`, so a spec that declares
/// `region` / `edge` yields `profiles create au --region au1 --edge sydney`
/// rather than the generic-but-clunky `--server-var region=au1`.
pub fn build_profiles_command(config: &ProfilesConfig, vocabulary: &Vocabulary) -> Command {
    let create = Command::new("create")
        .about("Create or update a named profile")
        .long_about(
            "Create a named bundle of request context: a credential slot, \
             parameter defaults, server variables, and an optional base URL \
             and output format.\n\n\
             Secrets are never written to profiles.toml. `--with-token` and \
             `--from-env` store the credential in the OS keychain under an \
             account scoped to this profile; the file only names that account.\n\n\
             A server-URL template variable can be set either generically \
             (`--server-var region=au1`) or through its own flag, the same one \
             an ordinary command takes (`--region au1`).",
        )
        .arg(
            Arg::new("name")
                .required(true)
                .value_name("NAME")
                .help("Profile name"),
        )
        .arg(
            Arg::new("parent")
                .long("parent")
                .value_name("PROFILE")
                .help(
                    "Inherit credential, server variables, base URL, and parameter \
                     defaults from another profile (output format is not inherited)",
                ),
        )
        .arg(
            Arg::new("set")
                .long("set")
                .value_name("KEY=VALUE")
                .action(ArgAction::Append)
                .help("Default value for an operation parameter, e.g. --set AccountSid=AC11"),
        )
        .arg(
            Arg::new("server-var")
                .long("server-var")
                .value_name("KEY=VALUE")
                .action(ArgAction::Append)
                // Name the variables this spec actually declares. There are
                // usually a handful, and without them the flag is unusable
                // without going to `--schema` first.
                .help(match server_variable_hint(vocabulary) {
                    Some(hint) => format!("Value for a server-URL template variable ({hint})"),
                    None => "Value for a server-URL template variable, e.g. --server-var region=us1"
                        .to_string(),
                }),
        )
        .arg(
            Arg::new("base-url")
                .long("base-url")
                .value_name("URL")
                .help("Explicit base-URL override for this profile"),
        )
        // Deliberately NOT `--format`: that is the global output flag on every
        // other command in the CLI, and a `create` arg with the same clap id
        // would shadow it — so `profiles create p --format json` would set the
        // profile's stored format while looking like a request for JSON
        // output. `--base-url` below *does* keep its name, because on a
        // command that sends no request the only thing it could mean is the
        // profile's.
        .arg(
            Arg::new("default-format")
                .long("default-format")
                .value_name("FORMAT")
                .help("Default output format for this profile (json, table, yaml, csv, jsonl)"),
        )
        .arg(
            Arg::new("credential")
                .long("credential")
                .value_name("ACCOUNT")
                .help(
                    "Keyring account this profile's credentials live under \
                     (defaults to the profile name)",
                ),
        )
        .arg(
            Arg::new("oauth-client-id")
                .long("oauth-client-id")
                .value_name("ID")
                .help("OAuth client id for this profile (the client secret goes to the keychain)"),
        )
        .arg(
            Arg::new("with-token")
                .long("with-token")
                .action(ArgAction::SetTrue)
                .help("Read a credential from stdin into this profile's keychain slot")
                .conflicts_with("from-env"),
        )
        .arg(
            Arg::new("from-env")
                .long("from-env")
                .action(ArgAction::SetTrue)
                .help(
                    "Capture the credential currently supplied by environment \
                     variables into this profile's keychain slot",
                ),
        )
        .arg(
            Arg::new("scheme")
                .long("scheme")
                .value_name("NAME")
                .help("Auth scheme for --with-token / --from-env (required when several are declared)"),
        )
        .arg(
            Arg::new("force")
                .long("force")
                .action(ArgAction::SetTrue)
                .help("Overwrite an existing profile instead of erroring"),
        )
        .arg(
            Arg::new("use")
                .long("use")
                .action(ArgAction::SetTrue)
                .help("Make this the active profile after creating it"),
        );

    Command::new(config.command_name.clone())
        .about("Manage named profiles (credentials, parameter defaults, regions)")
        .long_about(
            "A profile is a named bundle of request context resolved once per \
             invocation. Select one for a single command with `--profile <name>` \
             (`-p`), for a shell with the <NAME>_PROFILE environment variable, or \
             persistently with `profiles use <name>`.\n\n\
             Precedence per value is: explicit flag, then environment variable, \
             then profile, then the spec's own default. Environment variables sit \
             above profiles so a CI pipeline is never silently overridden by a \
             developer's stored profile.",
        )
        .arg_required_else_help(true)
        .subcommand(create)
        .subcommand(
            Command::new("list")
                .visible_alias("ls")
                .about("List every profile, marking the active one"),
        )
        .subcommand(
            Command::new("use")
                .about("Set the active profile")
                .arg(
                    Arg::new("name")
                        .required(true)
                        .value_name("NAME")
                        .help("Profile to activate, or `-` to clear the active profile"),
                ),
        )
        .subcommand(
            Command::new("remove")
                .visible_alias("rm")
                .about("Delete a profile and its stored credentials")
                .arg(
                    Arg::new("name")
                        .required(true)
                        .value_name("NAME")
                        .help("Profile to delete"),
                )
                .arg(
                    Arg::new("yes")
                        .long("yes")
                        .short('y')
                        .action(ArgAction::SetTrue)
                        .help("Skip the confirmation prompt"),
                ),
        )
        .subcommand(
            Command::new("current").about("Show the profile this invocation would use, and why"),
        )
}

/// A `--help` fragment naming the spec's server variables, e.g.
/// `"region, edge"`. `None` when the spec declares none, so the flag falls
/// back to a generic example rather than advertising an empty list.
fn server_variable_hint(vocabulary: &Vocabulary) -> Option<String> {
    if vocabulary.server_variables.is_empty() {
        return None;
    }
    let names: Vec<&str> = vocabulary
        .server_variables
        .iter()
        .map(String::as_str)
        .collect();
    Some(format!("this API declares: {}", names.join(", ")))
}

/// The subcommand names [`build_profiles_command`] owns.
///
/// Mirrors how `dispatch_auth` is gated on `login | logout | status`: when a
/// spec also declares a `profiles` group, only these leaves are intercepted
/// and everything else falls through to the spec's binding.
pub const BUILTIN_SUBCOMMANDS: &[&str] = &["create", "list", "ls", "use", "remove", "rm", "current"];

// ── Dispatch ────────────────────────────────────────────────────────────

/// Runtime dependencies the `profiles` subcommands need. Bundled into a
/// struct because five of the six handlers want a different subset of the
/// same six values, and threading them positionally invites a mix-up
/// between `cli_name` and a profile name.
pub struct ProfilesContext<'a> {
    pub cli_name: &'a str,
    pub auth_bindings: &'a [(String, SchemeBinding)],
    pub login_flows: &'a [DynLoginFlow],
    pub vocabulary: &'a Vocabulary,
}

/// Dispatch into the matched `profiles` subcommand.
///
/// `out` is the stdout sink used for machine-readable output; human progress
/// goes to stderr, matching `dispatch_auth`.
pub fn dispatch_profiles<W: Write>(
    matches: &ArgMatches,
    ctx: &ProfilesContext<'_>,
    out: &mut W,
) -> Result<(), CliError> {
    let mut store = open_store(ctx.cli_name)?;
    match matches.subcommand() {
        Some(("create", m)) => handle_create(m, ctx, &mut store),
        Some(("list" | "ls", m)) => handle_list(m, ctx, &store, out),
        Some(("use", m)) => handle_use(m, ctx, &mut store),
        Some(("remove" | "rm", m)) => handle_remove(m, ctx, &mut store),
        Some(("current", m)) => handle_current(m, ctx, &store, out),
        _ => Err(CliError::Validation(
            "profiles requires a subcommand: create, list, use, remove, or current".to_string(),
        )),
    }
}

/// This process's argv, for re-resolving the selection inside the `profiles`
/// group.
///
/// `dispatch_profiles` only receives the group's own `ArgMatches`, and
/// `--profile` is read pre-clap from raw argv anyway (see
/// [`selection::extract_profile_flag`]), so the raw vector is the honest
/// input here rather than a value threaded down from the parse.
fn argv() -> Vec<String> {
    std::env::args().collect()
}

fn open_store(cli_name: &str) -> Result<ProfileStore, CliError> {
    ProfileStore::for_cli(cli_name).ok_or_else(|| {
        CliError::Validation(
            "cannot locate a home directory, so profiles cannot be stored. \
             Set HOME (or USERPROFILE on Windows) and try again."
                .to_string(),
        )
    })
}

// ── create ──────────────────────────────────────────────────────────────

fn handle_create(
    matches: &ArgMatches,
    ctx: &ProfilesContext<'_>,
    store: &mut ProfileStore,
) -> Result<(), CliError> {
    let name = matches
        .get_one::<String>("name")
        .cloned()
        .expect("clap marks `name` required");
    validate_profile_name(&name)?;

    let existing = store.entry(&name);
    if existing.is_some() && !matches.get_flag("force") {
        return Err(CliError::Validation(format!(
            "profile `{name}` already exists. Pass --force to overwrite it."
        )));
    }

    if let Some(parent) = matches.get_one::<String>("parent") {
        if parent == &name {
            return Err(CliError::Validation(format!(
                "profile `{name}` cannot be its own parent"
            )));
        }
        if store.entry(parent).is_none() {
            return Err(store::unknown_profile(store, parent));
        }
    }

    // Start from the existing entry under `--force` so a re-run that only
    // passes `--set` does not silently wipe the profile's other fields.
    let mut entry = existing.unwrap_or_else(|| ProfileEntry {
        name: name.clone(),
        ..Default::default()
    });
    if let Some(parent) = matches.get_one::<String>("parent") {
        entry.parent = Some(parent.clone());
    }
    if let Some(credential) = matches.get_one::<String>("credential") {
        entry.credential = Some(credential.clone());
    }
    if let Some(client_id) = matches.get_one::<String>("oauth-client-id") {
        entry.oauth_client_id = Some(client_id.clone());
    }
    if let Some(base_url) = matches.get_one::<String>("base-url") {
        crate::output::reject_dangerous_chars(base_url, "--base-url")?;
        entry.base_url = Some(base_url.clone());
    }
    if let Some(format) = matches.get_one::<String>("default-format") {
        // Validated here rather than at read time: a profile that stores an
        // unknown format would fail every subsequent command with an error
        // that points at `--format`, a flag the user did not pass.
        crate::formatter::OutputFormat::parse(format)
            .map_err(CliError::Validation)?;
        entry.format = Some(format.clone());
    }

    for (key, value) in parse_key_values(matches, "set", "--set")? {
        ctx.vocabulary.validate_parameter(&key, &value)?;
        entry.parameters.insert(key, value);
    }
    for (key, value) in parse_key_values(matches, "server-var", "--server-var")? {
        ctx.vocabulary.validate_server_variable(&key)?;
        entry.server_variables.insert(key, value);
    }
    // A server variable's own global flag (`--region au1`) also sets it.
    //
    // Read from the propagated global rather than a `create`-local
    // convenience flag: those are registered on the root with `.global(true)`,
    // and clap copies a global into a subcommand only when the subcommand has
    // no arg with the *same id*. A second `--region` under a different id
    // (`server-var:region`) is two args with one long name, which makes clap
    // reject the whole command tree at startup — every invocation panics, not
    // just `profiles create`.
    //
    // Only `CommandLine` counts. A spec server variable's flag carries the
    // variable's `default`, so accepting `DefaultValue` here would silently
    // freeze `region = "us1"` into every profile the user creates.
    for variable in &ctx.vocabulary.server_variables {
        let Ok(Some(value)) = matches.try_get_one::<String>(variable) else {
            continue;
        };
        if matches.value_source(variable) != Some(clap::parser::ValueSource::CommandLine) {
            continue;
        }
        entry.server_variables.insert(variable.clone(), value.clone());
    }

    // Resolve now, before writing, so a bad `--parent` (cycle, depth) is
    // rejected instead of persisted and hit on the next command.
    let mut probe = store.clone();
    probe.upsert(&entry);
    let resolved = store::resolve(&probe, &name)?;

    // Credential capture happens before the write: if the keychain refuses,
    // we must not leave a profile pointing at an empty slot.
    let mut stderr = std::io::stderr();
    if matches.get_flag("with-token") || matches.get_flag("from-env") {
        let scheme = login::resolve_scheme_for(
            matches.get_one::<String>("scheme"),
            ctx.auth_bindings,
            ctx.login_flows,
        )?;
        let account = super::keyring_account_for(
            &scheme,
            resolved.credential.as_deref().unwrap_or(&name),
        );
        if matches.get_flag("with-token") {
            let token = login::read_token_from_stdin()?;
            active_store().set(ctx.cli_name, &account, &token)?;
        } else {
            let value = env_credential(ctx.auth_bindings, &scheme).ok_or_else(|| {
                CliError::Validation(format!(
                    "--from-env: no environment variable currently supplies a credential \
                     for scheme `{scheme}`. Run `{} auth status` to see which ones are read.",
                    ctx.cli_name,
                ))
            })?;
            active_store().set(ctx.cli_name, &account, &value)?;
        }
        let _ = writeln!(
            stderr,
            "{}",
            login::green(&format!(
                "✓ Stored credential for profile `{name}` (scheme {scheme}) in {}",
                active_store().backend_label(),
            )),
        );
    }

    store.upsert(&entry);
    if matches.get_flag("use") {
        store.set_active(&name);
    }
    store.save()?;

    let verb = if existing_was_updated(matches) {
        "Updated"
    } else {
        "Created"
    };
    let _ = writeln!(
        stderr,
        "{}",
        login::green(&format!(
            "✓ {verb} profile `{name}` in {}",
            store.path().display(),
        )),
    );
    if matches.get_flag("use") {
        let _ = writeln!(stderr, "  Active profile is now `{name}`.");
    } else {
        let _ = writeln!(
            stderr,
            "  Run `{} {} use {name}` to make it active, or pass `-p {name}` per command.",
            ctx.cli_name,
            profiles_command_name(),
        );
    }
    Ok(())
}

/// Whether `create` overwrote an existing profile. Read from the flag rather
/// than re-reading the store, which has already been mutated by this point.
fn existing_was_updated(matches: &ArgMatches) -> bool {
    matches.get_flag("force")
}

/// The configured group name, for hints. `profiles` unless the generator
/// renamed it; the renamed case only affects prose, so a static default is
/// acceptable rather than threading the config into every message.
fn profiles_command_name() -> &'static str {
    "profiles"
}

fn validate_profile_name(name: &str) -> Result<(), CliError> {
    if name.is_empty() {
        return Err(CliError::Validation("profile name must not be empty".to_string()));
    }
    if RESERVED_PROFILE_NAMES.contains(&name) {
        return Err(CliError::Validation(format!(
            "`{name}` is reserved and cannot be used as a profile name"
        )));
    }
    // The name becomes a TOML bare key, a keyring account suffix, and half of
    // a token-cache key. Restricting it to this set keeps all three
    // unambiguous — notably `#`, which separates the scheme from the
    // credential in a keyring account.
    if !name
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == '.')
    {
        return Err(CliError::Validation(format!(
            "profile name `{name}` contains unsupported characters. \
             Use letters, digits, `-`, `_`, and `.`."
        )));
    }
    Ok(())
}

/// Parse repeated `KEY=VALUE` flag values.
///
/// An empty key or a missing `=` is an error rather than a skip: `--set
/// AccountSid` looks like it worked, and a silently ignored default is the
/// exact failure mode this feature has to avoid.
fn parse_key_values(
    matches: &ArgMatches,
    id: &str,
    flag: &str,
) -> Result<Vec<(String, String)>, CliError> {
    let mut out = Vec::new();
    let Some(values) = matches.get_many::<String>(id) else {
        return Ok(out);
    };
    for raw in values {
        let Some((key, value)) = raw.split_once('=') else {
            return Err(CliError::Validation(format!(
                "{flag}: expected KEY=VALUE, got `{raw}`"
            )));
        };
        let key = key.trim();
        if key.is_empty() {
            return Err(CliError::Validation(format!(
                "{flag}: expected KEY=VALUE, got `{raw}` (empty key)"
            )));
        }
        out.push((key.to_string(), value.to_string()));
    }
    Ok(out)
}

/// The value an env-var credential source currently supplies for `scheme`.
///
/// Deliberately env-only: `--from-env` captures the environment, so reading
/// through the whole chain would let it capture a *keyring* value and write
/// it back to a different keyring account, which is a confusing no-op at
/// best.
fn env_credential(bindings: &[(String, SchemeBinding)], scheme: &str) -> Option<String> {
    use secrecy::ExposeSecret;
    let binding = bindings.iter().find(|(name, _)| name == scheme)?;
    login::expand_sources(scheme, &binding.1, &[], "")
        .into_iter()
        .filter(|source| matches!(source, AuthCredentialSource::Env(_)))
        .find_map(|source| source.resolve())
        .map(|secret| secret.expose_secret().to_string())
}

// ── list ────────────────────────────────────────────────────────────────

fn handle_list<W: Write>(
    matches: &ArgMatches,
    ctx: &ProfilesContext<'_>,
    store: &ProfileStore,
    out: &mut W,
) -> Result<(), CliError> {
    // Re-resolve rather than reading the installed global: the `profiles`
    // group is exempted from selection (so `use` / `remove` keep working when
    // `active` is stale), which means the global is empty here. Falling back
    // to the raw `active` key covers the stale case — the entry the user has
    // to fix is exactly the one that must still be visible.
    let active_name = selection::resolve_selection_in(store, ctx.cli_name, &argv())
        .ok()
        .flatten()
        .map(|selection| selection.profile.name)
        .or_else(|| store.active().map(str::to_string));
    let mut rows: Vec<serde_json::Value> = Vec::new();

    for entry in store.entries() {
        // Render the *resolved* view: a subaccount profile's inherited
        // credential and region are what the next request will use, and a
        // listing that showed only the literal file contents would leave the
        // user to do the inheritance in their head.
        let resolved = store::resolve(store, &entry.name).ok();
        let mut row = serde_json::Map::new();
        row.insert("profile".into(), entry.name.clone().into());
        row.insert(
            "active".into(),
            if active_name.as_deref() == Some(entry.name.as_str()) {
                "*".into()
            } else {
                "".into()
            },
        );
        if let Some(parent) = &entry.parent {
            row.insert("parent".into(), parent.clone().into());
        }
        if let Some(resolved) = &resolved {
            if let Some(credential) = &resolved.credential {
                row.insert("credential".into(), credential.clone().into());
            }
            if let Some(client_id) = &resolved.oauth_client_id {
                row.insert("oauth_client_id".into(), client_id.clone().into());
            }
            if let Some(base_url) = &resolved.base_url {
                row.insert("base_url".into(), base_url.clone().into());
            }
            if let Some(format) = &resolved.format {
                row.insert("format".into(), format.clone().into());
            }
            insert_map(&mut row, "parameters", &resolved.parameters);
            insert_map(&mut row, "server_variables", &resolved.server_variables);
        } else {
            // A profile whose parent chain is broken still has to appear —
            // otherwise the user cannot see the entry they need to fix.
            row.insert("error".into(), "unresolvable (check `parent`)".into());
        }
        rows.push(serde_json::Value::Object(row));
    }

    // The `[env]` pseudo-row: env credentials outrank every profile, so a
    // listing that omitted them would answer "which account am I about to
    // hit?" wrongly whenever one is exported. This is a rendering of what
    // `auth status` already detects, not new detection.
    if let Some(row) = env_pseudo_row(ctx) {
        rows.push(row);
    }

    let pipeline = crate::formatter::OutputPipeline::from_matches(matches, ctx.cli_name)
        .map_err(|e| CliError::Validation(e.to_string()))?;
    if rows.is_empty() && !pipeline.format.is_machine_readable() {
        let _ = writeln!(
            std::io::stderr(),
            "No profiles configured. Create one with `{} {} create <name>`.",
            ctx.cli_name,
            profiles_command_name(),
        );
        return Ok(());
    }
    pipeline
        .emit(out, &serde_json::Value::Array(rows), false, true)
        .map_err(|e| CliError::Other(e.into()))?;
    Ok(())
}

fn insert_map(
    row: &mut serde_json::Map<String, serde_json::Value>,
    key: &str,
    values: &BTreeMap<String, String>,
) {
    if values.is_empty() {
        return;
    }
    let nested: serde_json::Map<String, serde_json::Value> = values
        .iter()
        .map(|(k, v)| (k.clone(), serde_json::Value::String(v.clone())))
        .collect();
    row.insert(key.to_string(), serde_json::Value::Object(nested));
}

/// A synthetic `[env]` row when environment variables currently supply a
/// credential — which wins over any profile.
fn env_pseudo_row(ctx: &ProfilesContext<'_>) -> Option<serde_json::Value> {
    let mut sources: Vec<String> = Vec::new();
    for (scheme, binding) in ctx.auth_bindings {
        for source in login::expand_sources(scheme, binding, ctx.login_flows, ctx.cli_name) {
            if let AuthCredentialSource::Env(name) = &source {
                if source.resolve().is_some() {
                    sources.push(name.clone());
                }
            }
        }
    }
    if sources.is_empty() {
        return None;
    }
    sources.sort();
    sources.dedup();
    let mut row = serde_json::Map::new();
    row.insert("profile".into(), "[env]".into());
    row.insert("active".into(), "*".into());
    row.insert("credential".into(), sources.join(", ").into());
    row.insert(
        "note".into(),
        "environment variables take precedence over every profile".into(),
    );
    Some(serde_json::Value::Object(row))
}

// ── use ─────────────────────────────────────────────────────────────────

fn handle_use(
    matches: &ArgMatches,
    ctx: &ProfilesContext<'_>,
    store: &mut ProfileStore,
) -> Result<(), CliError> {
    let name = matches
        .get_one::<String>("name")
        .cloned()
        .expect("clap marks `name` required");
    let mut stderr = std::io::stderr();

    // `-` clears, mirroring `cd -`-style conventions and giving a way back
    // to unprofiled behaviour without hand-editing the file.
    if name == "-" {
        store.clear_active();
        store.save()?;
        let _ = writeln!(
            stderr,
            "{}",
            login::green("✓ Cleared the active profile."),
        );
        return Ok(());
    }

    if store.entry(&name).is_none() {
        return Err(store::unknown_profile(store, &name));
    }
    // Reject a profile that cannot resolve rather than activating it — a
    // broken `active` pointer makes every subsequent command fail.
    store::resolve(store, &name)?;
    store.set_active(&name);
    store.save()?;
    let _ = writeln!(
        stderr,
        "{}",
        login::green(&format!("✓ Active profile is now `{name}`.")),
    );
    warn_if_env_overrides(&mut stderr, ctx);
    Ok(())
}

/// Warn when `<BIN>_PROFILE` or credential env vars will win over the
/// profile the user just selected — the "I switched but nothing changed"
/// footgun, same shape as `auth login`'s shadow warning (ADR-0008).
fn warn_if_env_overrides<W: Write>(out: &mut W, ctx: &ProfilesContext<'_>) {
    let env_var = selection::profile_env_var(ctx.cli_name);
    if std::env::var(&env_var).is_ok_and(|v| !v.trim().is_empty()) {
        let _ = writeln!(
            out,
            "{}",
            login::yellow(&format!(
                "⚠ Warning: `{env_var}` is set; it selects the profile regardless of \
                 this setting. Unset it to use the active profile."
            )),
        );
        return;
    }
    if env_pseudo_row(ctx).is_some() {
        let _ = writeln!(
            out,
            "{}",
            login::yellow(
                "⚠ Warning: credential environment variables are set; they take \
                 precedence over this profile's stored credential. Run `auth status` \
                 to see which."
            ),
        );
    }
}

// ── remove ──────────────────────────────────────────────────────────────

fn handle_remove(
    matches: &ArgMatches,
    ctx: &ProfilesContext<'_>,
    store: &mut ProfileStore,
) -> Result<(), CliError> {
    let name = matches
        .get_one::<String>("name")
        .cloned()
        .expect("clap marks `name` required");
    let entry = store
        .entry(&name)
        .ok_or_else(|| store::unknown_profile(store, &name))?;

    // A child that inherits from this profile would be left dangling.
    let dependents: Vec<String> = store
        .entries()
        .into_iter()
        .filter(|other| other.parent.as_deref() == Some(name.as_str()))
        .map(|other| other.name)
        .collect();
    if !dependents.is_empty() {
        return Err(CliError::Validation(format!(
            "profile `{name}` is the parent of {}. Remove or re-parent {} first.",
            dependents.join(", "),
            if dependents.len() == 1 { "it" } else { "them" },
        )));
    }

    let mut stderr = std::io::stderr();
    if !matches.get_flag("yes") {
        // Non-TTY stdin means a script or an agent is driving; prompting
        // there would hang forever (the M17 contract).
        if !std::io::stdin().is_terminal() {
            return Err(CliError::Validation(format!(
                "refusing to remove profile `{name}` without confirmation. \
                 Pass --yes when stdin is not a terminal."
            )));
        }
        let _ = write!(
            stderr,
            "Remove profile `{name}` and its stored credentials? [y/N] ",
        );
        let _ = stderr.flush();
        let mut answer = String::new();
        std::io::BufRead::read_line(&mut std::io::stdin().lock(), &mut answer)
            .map_err(|e| CliError::Other(e.into()))?;
        if !matches!(answer.trim().to_ascii_lowercase().as_str(), "y" | "yes") {
            let _ = writeln!(stderr, "Aborted.");
            return Ok(());
        }
    }

    // Resolve before removal so we know which keyring account and token-cache
    // namespace belonged to this profile.
    let credential = store::resolve(store, &name)
        .ok()
        .and_then(|resolved| resolved.credential)
        .unwrap_or_else(|| name.clone());

    // Only purge credentials this profile owned. A profile that borrowed its
    // parent's `credential` must not delete the parent's token on the way
    // out — that would log the user out of the tenant they kept.
    let owns_credential = entry.parent.is_none() || entry.credential.is_some();
    if owns_credential {
        for (scheme, _) in ctx.auth_bindings {
            let account = super::keyring_account_for(scheme, &credential);
            active_store().delete(ctx.cli_name, &account)?;
        }
        if let Some(cache) = crate::auth::TokenCache::for_cli_unprofiled(ctx.cli_name) {
            cache.purge_profile(&credential)?;
        }
    }

    store.remove(&name);
    store.save()?;
    let _ = writeln!(
        stderr,
        "{}",
        login::green(&format!("✓ Removed profile `{name}`.")),
    );
    if !owns_credential {
        let _ = writeln!(
            stderr,
            "  Kept the credential in `{credential}`, which profile `{}` shares.",
            entry.parent.as_deref().unwrap_or("(parent)"),
        );
    }
    Ok(())
}

// ── current ─────────────────────────────────────────────────────────────

fn handle_current<W: Write>(
    matches: &ArgMatches,
    ctx: &ProfilesContext<'_>,
    store: &ProfileStore,
    out: &mut W,
) -> Result<(), CliError> {
    let pipeline = crate::formatter::OutputPipeline::from_matches(matches, ctx.cli_name)
        .map_err(|e| CliError::Validation(e.to_string()))?;

    // Re-resolve rather than reading the installed global: `profiles` is
    // exempted from selection (so `profiles use` still works when `active`
    // is stale), which means the global is empty here.
    let selected = selection::resolve_selection_in(store, ctx.cli_name, &argv())?;

    let payload = match &selected {
        Some(selection) => {
            let profile = &selection.profile;
            let mut map = serde_json::Map::new();
            map.insert("profile".into(), profile.name.clone().into());
            map.insert("source".into(), selection.source.label().into());
            if let Some(credential) = &profile.credential {
                map.insert("credential".into(), credential.clone().into());
            }
            if let Some(base_url) = &profile.base_url {
                map.insert("base_url".into(), base_url.clone().into());
            }
            if let Some(format) = &profile.format {
                map.insert("format".into(), format.clone().into());
            }
            insert_map(&mut map, "parameters", &profile.parameters);
            insert_map(&mut map, "server_variables", &profile.server_variables);
            if let Some(env_row) = env_pseudo_row(ctx) {
                // Say so explicitly: the profile is selected, but its
                // credential is not the one that will be sent.
                map.insert("credential_overridden_by_env".into(), env_row["credential"].clone());
            }
            serde_json::Value::Object(map)
        }
        None => serde_json::json!({
            "profile": serde_json::Value::Null,
            "source": "none",
        }),
    };

    if pipeline.format.is_machine_readable() {
        pipeline
            .emit(out, &payload, false, true)
            .map_err(|e| CliError::Other(e.into()))?;
        return Ok(());
    }

    let mut stderr = std::io::stderr();
    match selected {
        Some(_) => {
            pipeline
                .emit(out, &payload, false, true)
                .map_err(|e| CliError::Other(e.into()))?;
        }
        None => {
            let _ = writeln!(
                stderr,
                "No profile selected. Commands run with flags, environment \
                 variables, and spec defaults only.",
            );
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn vocabulary() -> Vocabulary {
        let mut vocabulary = Vocabulary {
            server_variables: ["region", "edge"].iter().map(|s| s.to_string()).collect(),
            ..Default::default()
        };
        vocabulary.add_parameters([
            ParameterSpec::unconstrained("AccountSid"),
            ParameterSpec::unconstrained("PageSize"),
            ParameterSpec::with_values(
                "UserType",
                vec!["All".to_string(), "Managed".to_string()],
            ),
        ]);
        vocabulary
    }

    fn create_matches(args: &[&str]) -> ArgMatches {
        let config = ProfilesConfig::default();
        build_profiles_command(&config, &vocabulary())
            .try_get_matches_from(args)
            .expect("args must parse")
            .subcommand_matches("create")
            .expect("create must match")
            .clone()
    }

    // ── name validation ─────────────────────────────────────────────────

    #[test]
    fn reserved_and_malformed_names_are_rejected() {
        for name in ["list", "create", "env", "", "has space", "with#hash", "sl/ash"] {
            assert!(
                validate_profile_name(name).is_err(),
                "`{name}` should be rejected",
            );
        }
    }

    #[test]
    fn ordinary_names_are_accepted() {
        for name in ["prod", "tenant-acme", "au_1", "v1.2"] {
            assert!(validate_profile_name(name).is_ok(), "`{name}` should be accepted");
        }
    }

    // ── KEY=VALUE parsing ───────────────────────────────────────────────

    #[test]
    fn parses_repeated_key_values() {
        let m = create_matches(&[
            "profiles", "create", "p", "--set", "AccountSid=AC11", "--set", "PageSize=10",
        ]);
        let pairs = parse_key_values(&m, "set", "--set").unwrap();
        assert_eq!(
            pairs,
            vec![
                ("AccountSid".to_string(), "AC11".to_string()),
                ("PageSize".to_string(), "10".to_string()),
            ],
        );
    }

    #[test]
    fn a_value_containing_equals_keeps_its_tail() {
        // Base64 and query-string-ish values contain `=`; splitting on the
        // last one would corrupt them.
        let m = create_matches(&["profiles", "create", "p", "--set", "AccountSid=a=b=c"]);
        let pairs = parse_key_values(&m, "set", "--set").unwrap();
        assert_eq!(pairs[0].1, "a=b=c");
    }

    #[test]
    fn a_missing_equals_is_an_error_not_a_silent_skip() {
        let m = create_matches(&["profiles", "create", "p", "--set", "AccountSid"]);
        let err = parse_key_values(&m, "set", "--set").unwrap_err().to_string();
        assert!(err.contains("expected KEY=VALUE"), "{err}");
    }

    #[test]
    fn an_empty_key_is_an_error() {
        let m = create_matches(&["profiles", "create", "p", "--set", "=AC11"]);
        assert!(parse_key_values(&m, "set", "--set").is_err());
    }

    // ── vocabulary validation ───────────────────────────────────────────

    #[test]
    fn a_known_parameter_passes_in_any_spelling() {
        for spelling in ["AccountSid", "account-sid", "account_sid", "ACCOUNTSID"] {
            assert!(
                vocabulary().validate_parameter(spelling, "AC11").is_ok(),
                "`{spelling}` should be accepted",
            );
        }
    }

    #[test]
    fn an_unknown_parameter_is_rejected_with_a_suggestion() {
        // The silent-no-op failure mode this check exists to prevent.
        let err = vocabulary()
            .validate_parameter("AcountSid", "AC11")
            .unwrap_err()
            .to_string();
        assert!(err.contains("no operation accepts"), "{err}");
        assert!(err.contains("Did you mean `AccountSid`?"), "{err}");
    }

    #[test]
    fn an_unknown_parameter_with_no_near_match_still_lists_the_known_ones() {
        let err = vocabulary()
            .validate_parameter("totally-unrelated", "x")
            .unwrap_err()
            .to_string();
        assert!(!err.contains("Did you mean"), "{err}");
        assert!(err.contains("AccountSid"), "{err}");
    }

    #[test]
    fn an_unconstrained_parameter_accepts_any_value() {
        assert!(vocabulary()
            .validate_parameter("AccountSid", "anything at all")
            .is_ok());
    }

    #[test]
    fn a_value_outside_an_enum_is_rejected_at_write_time() {
        // Otherwise the profile stores `admin`, clap installs it as
        // `--user-type`'s default, and *every* command carrying that
        // parameter fails on a flag the caller never passed.
        let err = vocabulary()
            .validate_parameter("UserType", "admin")
            .unwrap_err()
            .to_string();
        assert!(err.contains("not an accepted value"), "{err}");
        assert!(err.contains("All, Managed"), "{err}");
    }

    #[test]
    fn a_near_miss_enum_value_gets_a_suggestion() {
        let err = vocabulary()
            .validate_parameter("UserType", "managed")
            .unwrap_err()
            .to_string();
        assert!(err.contains("Did you mean `Managed`?"), "{err}");
    }

    #[test]
    fn an_enum_value_the_spec_allows_passes() {
        assert!(vocabulary().validate_parameter("UserType", "Managed").is_ok());
    }

    #[test]
    fn allowed_values_union_across_operations() {
        // Two operations constrain the same parameter differently. A value
        // either accepts is legitimate: the profile just does not apply
        // cleanly to both commands.
        let mut vocabulary = Vocabulary::default();
        vocabulary.add_parameters([
            ParameterSpec::with_values("status", vec!["open".to_string()]),
            ParameterSpec::with_values("status", vec!["closed".to_string()]),
        ]);
        assert!(vocabulary.validate_parameter("status", "open").is_ok());
        assert!(vocabulary.validate_parameter("status", "closed").is_ok());
        assert!(vocabulary.validate_parameter("status", "pending").is_err());
    }

    #[test]
    fn an_unconstrained_occurrence_widens_a_constrained_one() {
        // One operation takes `status` as a free string, so no value can be
        // rejected outright.
        let mut vocabulary = Vocabulary::default();
        vocabulary.add_parameters([
            ParameterSpec::with_values("status", vec!["open".to_string()]),
            ParameterSpec::unconstrained("status"),
        ]);
        assert!(vocabulary.validate_parameter("status", "whatever").is_ok());
    }

    #[test]
    fn order_does_not_change_the_widening() {
        let mut vocabulary = Vocabulary::default();
        vocabulary.add_parameters([
            ParameterSpec::unconstrained("status"),
            ParameterSpec::with_values("status", vec!["open".to_string()]),
        ]);
        assert!(vocabulary.validate_parameter("status", "whatever").is_ok());
    }

    #[test]
    fn an_unknown_server_variable_is_rejected() {
        let err = vocabulary()
            .validate_server_variable("regio")
            .unwrap_err()
            .to_string();
        assert!(err.contains("Did you mean `region`?"), "{err}");
    }

    #[test]
    fn an_empty_vocabulary_validates_nothing() {
        // A binding that cannot enumerate its parameters must not make
        // `--set` unusable.
        let empty = Vocabulary::default();
        assert!(empty.validate_parameter("whatever", "anything").is_ok());
        assert!(empty.validate_server_variable("whatever").is_ok());
    }

    // ── command surface ─────────────────────────────────────────────────

    #[test]
    fn create_registers_no_per_server_variable_flag() {
        // Regression guard. Spec server-variable flags are registered on the
        // root with `.global(true)`, and clap copies a global into a
        // subcommand only when the subcommand has no arg with the same *id*.
        // A `create`-local `--region` under the id `server-var:region` is
        // therefore two args sharing one long name, which makes clap reject
        // the whole command tree at startup — so *every* invocation of the
        // binary panics, not just `profiles create`. `handle_create` reads the
        // propagated global instead.
        let vocab = Vocabulary {
            server_variables: ["region", "edge"].iter().map(|s| s.to_string()).collect(),
            ..Default::default()
        };
        let command = build_profiles_command(&ProfilesConfig::default(), &vocab);
        let create = command.find_subcommand("create").expect("create subcommand");
        let longs: Vec<&str> = create.get_arguments().filter_map(|a| a.get_long()).collect();
        assert!(!longs.contains(&"region"), "{longs:?}");
        assert!(!longs.contains(&"edge"), "{longs:?}");
        // The generic form is what `create` owns.
        assert!(longs.contains(&"server-var"), "{longs:?}");
    }

    #[test]
    fn create_does_not_shadow_the_global_format_flag() {
        // `--format` is the output flag on every other command; a `create`
        // arg with the same clap id would shadow it, so
        // `profiles create p --format json` would quietly set the profile's
        // stored format while looking like a request for JSON output.
        let command = build_profiles_command(&ProfilesConfig::default(), &Vocabulary::default());
        let create = command.find_subcommand("create").expect("create subcommand");
        let longs: Vec<&str> = create.get_arguments().filter_map(|a| a.get_long()).collect();
        assert!(!longs.contains(&"format"), "{longs:?}");
        assert!(longs.contains(&"default-format"), "{longs:?}");
    }

    #[test]
    fn with_token_and_from_env_are_mutually_exclusive() {
        let parsed = build_profiles_command(&ProfilesConfig::default(), &vocabulary())
            .try_get_matches_from(["profiles", "create", "p", "--with-token", "--from-env"]);
        assert!(parsed.is_err());
    }

    #[test]
    fn the_group_name_is_configurable() {
        let command = build_profiles_command(
            &ProfilesConfig::default().command_name("tenants"),
            &Vocabulary::default(),
        );
        assert_eq!(command.get_name(), "tenants");
    }

    #[test]
    fn every_builtin_subcommand_is_declared_for_the_fold_gate() {
        // `graft_builtin_command` folds into a spec-owned group of the same
        // name, and dispatch is gated on BUILTIN_SUBCOMMANDS. A leaf missing
        // from that list would be grafted but never reachable.
        let command = build_profiles_command(&ProfilesConfig::default(), &Vocabulary::default());
        for sub in command.get_subcommands() {
            assert!(
                BUILTIN_SUBCOMMANDS.contains(&sub.get_name()),
                "`{}` is not in BUILTIN_SUBCOMMANDS",
                sub.get_name(),
            );
            for alias in sub.get_visible_aliases() {
                assert!(
                    BUILTIN_SUBCOMMANDS.contains(&alias),
                    "alias `{alias}` is not in BUILTIN_SUBCOMMANDS",
                );
            }
        }
    }
}
