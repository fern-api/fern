//! High-level API for building CLIs from OpenAPI specs.
//!
//! [`CliApp`] provides a builder-style API that lets consumers create a
//! fully-functional CLI in just a few lines. [`AppContext`] exposes the
//! loaded spec and executor so that custom command handlers can call the
//! API programmatically.

use std::collections::HashMap;

use crate::auth::{AuthCredentialSource, AuthStrategy, DynAuthProvider, SchemeBinding};
use crate::cli_args;
use crate::custom_commands::CustomCommandRegistry;
use crate::error::{print_error_json, CliError};
use crate::formatter;
use crate::openapi::commands;
use crate::openapi::discovery::{JsonSchema, RestDescription, RestMethod, RestResource};
use crate::openapi::executor;

/// Split a slash-delimited prefix string into its path components, dropping
/// empty segments so accidental leading/trailing slashes are forgiving.
fn split_prefix(prefix: &str) -> Vec<String> {
    prefix
        .split('/')
        .filter(|s| !s.is_empty())
        .map(str::to_string)
        .collect()
}

/// Merge `incoming` resources into `target` at the given nested namespace
/// path. Empty path = flat top-level merge. Multi-segment path = walk/create
/// intermediate resources, merge at the leaf.
///
/// **Stutter elision:** at the leaf, if `incoming` contains a top-level
/// resource whose name matches the leaf namespace, that resource's methods
/// and sub-resources are *hoisted* into the namespace itself — eliminating
/// the `myapi v3 customers customers get` repetition that would
/// otherwise occur when a spec's primary domain matches the namespace name.
/// Other top-level resources from the spec become children of the
/// namespace as usual.
fn merge_into_path(
    target: &mut HashMap<String, RestResource>,
    path: &[String],
    mut incoming: HashMap<String, RestResource>,
) -> Result<(), CliError> {
    if path.is_empty() {
        for key in incoming.keys() {
            if target.contains_key(key) {
                return Err(CliError::Discovery(format!(
                    "Resource key collision: '{key}' appears in multiple specs"
                )));
            }
        }
        target.extend(incoming);
        return Ok(());
    }

    if path.len() == 1 {
        let leaf = path[0].clone();
        let entry = target.entry(leaf.clone()).or_insert_with(|| RestResource {
            resources: HashMap::new(),
            methods: HashMap::new(),
        });

        // Hoist a matching-name resource from the spec into the namespace.
        if let Some(matching) = incoming.remove(&leaf) {
            for (k, v) in matching.methods {
                if entry.methods.contains_key(&k) {
                    return Err(CliError::Discovery(format!(
                        "Method key collision: '{k}' under namespace '{leaf}'"
                    )));
                }
                entry.methods.insert(k, v);
            }
            for (k, v) in matching.resources {
                if entry.resources.contains_key(&k) {
                    return Err(CliError::Discovery(format!(
                        "Resource key collision: '{k}' under namespace '{leaf}'"
                    )));
                }
                entry.resources.insert(k, v);
            }
        }

        for (k, v) in incoming {
            if entry.resources.contains_key(&k) {
                return Err(CliError::Discovery(format!(
                    "Resource key collision: '{k}' under namespace '{leaf}'"
                )));
            }
            entry.resources.insert(k, v);
        }
        return Ok(());
    }

    let head = path[0].clone();
    let entry = target.entry(head).or_insert_with(|| RestResource {
        resources: HashMap::new(),
        methods: HashMap::new(),
    });
    merge_into_path(&mut entry.resources, &path[1..], incoming)
}

/// Replace `{name}` substrings in `s` with values from `subs`. Variables not
/// in the map are left literal so dry-run output and downstream errors can
/// still pinpoint what's missing.
fn substitute_url_vars(s: &str, subs: &HashMap<String, String>) -> String {
    let mut out = s.to_string();
    for (name, value) in subs {
        out = out.replace(&format!("{{{name}}}"), value);
    }
    out
}

/// Walk the merged doc and substitute server variables in every `root_url`
/// (top-level + per-method, since per-operation server overrides each have
/// their own URL).
fn apply_server_var_substitutions(
    doc: &mut crate::openapi::discovery::RestDescription,
    subs: &HashMap<String, String>,
) {
    if subs.is_empty() {
        return;
    }
    doc.root_url = substitute_url_vars(&doc.root_url, subs);
    for server in &mut doc.servers {
        server.url = substitute_url_vars(&server.url, subs);
    }
    fn walk(res: &mut crate::openapi::discovery::RestResource, subs: &HashMap<String, String>) {
        for method in res.methods.values_mut() {
            method.root_url = substitute_url_vars(&method.root_url, subs);
            for server in &mut method.servers {
                server.url = substitute_url_vars(&server.url, subs);
            }
        }
        for sub in res.resources.values_mut() {
            walk(sub, subs);
        }
    }
    for res in doc.resources.values_mut() {
        walk(res, subs);
    }
}

/// Apply generator-supplied env-var overrides to every idempotent
/// operation's synthetic idempotency-header parameter. The parser
/// already populated `MethodParameter.env_var` from each
/// `IdempotencyHeader.env` declared in the spec; this pass overlays the
/// builder map so calls like `.idempotency_header_env("Idempotency-Key",
/// "API_IDEMPOTENCY_KEY")` win over a value baked into the spec.
///
/// Keys in `envs` are matched against the entry's `name` first, then
/// its `header` value — letting generators register against whichever
/// identifier they emit at the call site.
fn apply_idempotency_header_envs(
    doc: &mut crate::openapi::discovery::RestDescription,
    envs: &HashMap<String, String>,
) {
    if envs.is_empty() || doc.idempotency_headers.is_empty() {
        return;
    }

    // Resolve each idempotency header's wire header name to an env var,
    // checking the `name` field first and falling back to `header`.
    // Collected up front so the per-method walk below is O(headers) per
    // method instead of O(headers * builder_entries).
    let mut header_to_env: HashMap<String, String> = HashMap::new();
    for h in &doc.idempotency_headers {
        let resolved = h
            .name
            .as_deref()
            .and_then(|n| envs.get(n))
            .or_else(|| envs.get(&h.header));
        if let Some(env_var) = resolved {
            header_to_env.insert(h.header.clone(), env_var.clone());
        }
    }
    if header_to_env.is_empty() {
        return;
    }

    fn walk(
        res: &mut crate::openapi::discovery::RestResource,
        header_to_env: &HashMap<String, String>,
    ) {
        for method in res.methods.values_mut() {
            if !method.idempotent {
                continue;
            }
            for (header, env_var) in header_to_env {
                if let Some(param) = method.parameters.get_mut(header) {
                    if param.location.as_deref() == Some("header") {
                        param.env_var = Some(env_var.clone());
                    }
                }
            }
        }
        for sub in res.resources.values_mut() {
            walk(sub, header_to_env);
        }
    }
    for res in doc.resources.values_mut() {
        walk(res, &header_to_env);
    }
}

fn merge_schemas(
    acc: &mut HashMap<String, JsonSchema>,
    incoming: HashMap<String, JsonSchema>,
) -> Result<(), CliError> {
    // Multi-spec setups commonly share schema names (`ErrorResponse`,
    // `Pagination`, `Meta`) across many specs authored from the same
    // template — collisions are the norm, not a bug.
    // First write wins; schemas are only used for best-effort request-body
    // validation, so a worst-case mismatch surfaces as a client-side
    // validation warning, not silent corruption. A future structural-equality
    // check could promote real differences back to an error.
    for (key, schema) in incoming {
        acc.entry(key).or_insert(schema);
    }
    Ok(())
}

/// Merge security-scheme declarations from another spec into the accumulator.
/// First write wins on collisions — multi-spec setups frequently re-declare a
/// shared `bearerAuth` from a common template, and a structural-equality check
/// would surface noise rather than help. Each operation's
/// `security_requirements` are denormalized into the operation itself at parse
/// time, so schemes only need to be merged at the top level for the eventual
/// `RoutingAuthProvider` registry.
fn merge_security_schemes(
    acc: &mut HashMap<String, crate::openapi::discovery::SecurityScheme>,
    incoming: HashMap<String, crate::openapi::discovery::SecurityScheme>,
) {
    for (key, scheme) in incoming {
        acc.entry(key).or_insert(scheme);
    }
}

/// Merge `x-fern-sdk-variables` declarations across specs. First write
/// wins on name collisions, mirroring [`merge_schemas`] and
/// [`merge_security_schemes`]. Multi-spec setups that share a common
/// variable across two OpenAPI files should only register the flag once
/// at the root, and a single source of truth is what makes resolution
/// deterministic.
fn merge_sdk_variables(
    acc: &mut Vec<crate::openapi::discovery::SdkVariable>,
    incoming: Vec<crate::openapi::discovery::SdkVariable>,
) {
    use std::collections::HashSet;
    let existing: HashSet<String> = acc.iter().map(|v| v.name.clone()).collect();
    for var in incoming {
        if !existing.contains(&var.name) {
            acc.push(var);
        }
    }
}

/// Returns true when the kebab-cased flag derived from an
/// `x-fern-sdk-variables` declaration collides with a built-in CLI flag
/// (`--params`, `--format`, `--dry-run`, …). Registering a global with
/// the same long name would panic clap's debug_assert at command tree
/// construction; the caller skips the offending entry and emits a
/// `tracing::warn!` so the spec author can rename the variable.
pub(crate) fn sdk_variable_collides_with_builtin(kebab: &str) -> bool {
    crate::openapi::commands::BUILTIN_FLAG_NAMES.contains(&kebab)
}

/// Merge `x-fern-global-headers` declarations across specs. First write
/// wins on header-name collisions, mirroring [`merge_sdk_variables`].
/// Multi-spec setups that share a common header across two OpenAPI files
/// should only register the flag once at the root.
fn merge_global_headers(
    acc: &mut Vec<crate::openapi::discovery::GlobalHeader>,
    incoming: Vec<crate::openapi::discovery::GlobalHeader>,
) {
    use std::collections::HashSet;
    let existing: HashSet<String> = acc.iter().map(|h| h.header.clone()).collect();
    for h in incoming {
        if !existing.contains(&h.header) {
            acc.push(h);
        }
    }
}

/// Derive the kebab-cased CLI flag (`--<flag>`) for a global header.
/// Prefers `name` (the SDK display identifier) when present; otherwise
/// falls back to kebab-casing the wire header name. Mirrors the
/// `flag_name_override` pathway used by `x-fern-idempotency-headers`.
pub(crate) fn global_header_flag_name(h: &crate::openapi::discovery::GlobalHeader) -> String {
    let source = h.name.as_deref().unwrap_or(h.header.as_str());
    crate::text::to_kebab_flag(source)
}

/// Stable clap arg ID for a global header. Anchored to the wire header
/// name so per-op parameter lookups (which key off the same string)
/// remain consistent with what clap returns.
pub(crate) fn global_header_arg_id(h: &crate::openapi::discovery::GlobalHeader) -> String {
    format!("__global_header::{}", h.header)
}

/// Returns true when the kebab-cased flag derived from an
/// `x-fern-global-headers` entry collides with a built-in CLI flag
/// (`--params`, `--format`, …) or an already-registered global. clap
/// would panic in debug builds on collision; we skip the offending entry
/// with a `tracing::warn!` so the spec still loads.
fn global_header_flag_collides_with_builtin(kebab: &str) -> bool {
    crate::openapi::commands::BUILTIN_FLAG_NAMES.contains(&kebab)
}

/// Resolve a global header value from `matched_args`, the env, and the
/// configured default — in that order. Returns `None` when none of the
/// three sources produced a value, OR when the resolved value is empty
/// or whitespace-only (callers shouldn't stamp a header like `X-API-Stage:`
/// on the wire — that's almost always a user mistake worth surfacing as a
/// required-header error, and matches the env-var-handling convention).
///
/// `matched_args.get_one::<String>` already incorporates clap's
/// `.env()` and `.default_value()` bindings, so the lookup is a single
/// read; the explicit env/default fields on [`GlobalHeader`] are what
/// feed those clap bindings at registration time.
pub(crate) fn resolve_global_header_value(
    matched_args: &clap::ArgMatches,
    h: &crate::openapi::discovery::GlobalHeader,
) -> Option<String> {
    matched_args
        .get_one::<String>(&global_header_arg_id(h))
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
}

/// True when an operation declares a `header`-located parameter with
/// the same wire-name as a global header AND the user supplied a value
/// for it in `params`. HTTP header names are case-insensitive per RFC
/// 7230 §3.2, so the lookup is `eq_ignore_ascii_case` rather than
/// `HashMap::contains_key` / `HashMap::get`.
pub(crate) fn per_op_header_param_overrides_global(
    params: &serde_json::Map<String, serde_json::Value>,
    method: &RestMethod,
    wire_name: &str,
) -> bool {
    let supplied = params
        .keys()
        .any(|k| k.eq_ignore_ascii_case(wire_name));
    if !supplied {
        return false;
    }
    method
        .parameters
        .iter()
        .any(|(k, p)| k.eq_ignore_ascii_case(wire_name) && p.location.as_deref() == Some("header"))
}

/// Build the structured validation error used when a required global
/// header has neither a CLI/env/default value nor a per-op override.
/// Shared by both the built-in command path
/// ([`build_global_header_overrides`]) and the custom-command path
/// ([`AppContext::extra_headers_for`]) so users get the same message
/// regardless of which dispatcher they hit.
fn missing_required_global_header_error(h: &crate::openapi::discovery::GlobalHeader) -> CliError {
    let flag = global_header_flag_name(h);
    let env_hint = match &h.env {
        Some(e) => format!(" or set ${e}"),
        None => String::new(),
    };
    CliError::Validation(format!(
        "Missing required global header '{}': provide --{}{}",
        h.header, flag, env_hint
    ))
}

/// Shared implementation of the per-op-aware required-header walk.
/// Both [`build_global_header_overrides`] (built-in path) and
/// [`AppContext::extra_headers_for`] (custom-command path) call this
/// helper, differing only in how a header's value is resolved — the
/// built-in path reads directly from clap's `ArgMatches`, the
/// custom-command path looks up the pre-resolved map.
///
/// Walks `doc_global_headers` and for each entry:
///   * skips if the operation declares a same-named header param that
///     the user supplied (per-op wins);
///   * emits `(wire-name, value)` if the resolver returns a non-empty
///     value;
///   * errors if the header is required (`optional: false`) and neither
///     a resolved value nor a per-op override is present.
///
/// The resolver closure is responsible for any trimming / empty-string
/// filtering — see [`resolve_global_header_value`] for the canonical
/// implementation.
fn finalize_global_header_overrides<R>(
    doc_global_headers: &[crate::openapi::discovery::GlobalHeader],
    method: &RestMethod,
    per_op_params: &serde_json::Map<String, serde_json::Value>,
    mut resolver: R,
) -> Result<Vec<(String, String)>, CliError>
where
    R: FnMut(&crate::openapi::discovery::GlobalHeader) -> Option<String>,
{
    let mut out = Vec::new();
    for h in doc_global_headers {
        let overridden_by_per_op =
            per_op_header_param_overrides_global(per_op_params, method, &h.header);
        let resolved = resolver(h);
        match (resolved, overridden_by_per_op) {
            (Some(value), false) => out.push((h.header.clone(), value)),
            (Some(_), true) => { /* per-op wins, do not stamp */ }
            (None, true) => { /* per-op satisfies the required check */ }
            (None, false) => {
                if !h.optional {
                    return Err(missing_required_global_header_error(h));
                }
            }
        }
    }
    Ok(out)
}

/// Build the resolved `(wire-name, value)` list of `x-fern-global-headers`
/// to stamp on every outgoing request for this invocation.
///
/// The resolution chain per header is `CLI flag > env var > default`,
/// implemented by clap's `.env()` + `.default_value()` bindings — see
/// the registration loop in `run_async`.
///
/// Per-operation overrides: if the operation declares a `header`-located
/// parameter with the same (case-insensitive) wire-name AND the user
/// supplied a value for it (present in `params`), the global header is
/// suppressed; the per-op value wins both on the wire and in the
/// required-header satisfiability check. This mirrors Fern's importer
/// behavior where a header parameter declared on the operation replaces
/// the global.
///
/// Errors when a `required` (i.e. `optional: false`) global header has
/// neither a CLI/env/default value nor a per-op override.
pub(crate) fn build_global_header_overrides(
    matched_args: &clap::ArgMatches,
    doc: &RestDescription,
    method: &RestMethod,
    params: &serde_json::Map<String, serde_json::Value>,
) -> Result<Vec<(String, String)>, CliError> {
    finalize_global_header_overrides(&doc.global_headers, method, params, |h| {
        resolve_global_header_value(matched_args, h)
    })
}

/// Compose the root `--help` footer from the optional global-headers
/// section, the optional auth section, and the always-present runtime
/// footer. Sections are joined with a single newline; absent sections
/// are skipped entirely (no stray blank dividers).
///
/// Extracted so the section-skipping logic is unit-testable in
/// isolation — the clap `Command` it eventually feeds into is opaque
/// and harder to introspect from tests.
pub(crate) fn compose_root_after_help_sections(
    global_headers_section: Option<&str>,
    auth_section: Option<&str>,
    footer: &str,
) -> String {
    let mut sections: Vec<&str> = Vec::with_capacity(3);
    if let Some(s) = global_headers_section {
        sections.push(s);
    }
    if let Some(s) = auth_section {
        sections.push(s);
    }
    sections.push(footer);
    sections.join("\n")
}

/// Result of [`register_global_flags_with_help`] — carries both the
/// augmented command and the optional `Global headers:` help section
/// so callers can compose the root after-help footer.
struct RegisterGlobalFlagsResult {
    cmd: clap::Command,
    global_headers_section: Option<String>,
}

/// Register all global flags (server variables, SDK variables, global
/// headers, auth CLI args) onto `cmd`. Returns the augmented command.
/// Used by the completion path where the help-section text is not needed.
fn register_global_flags(
    cmd: clap::Command,
    server_vars: &[ServerVar],
    doc: &RestDescription,
    auth_bindings: &[(String, crate::auth::SchemeBinding)],
) -> clap::Command {
    register_global_flags_with_help(cmd, server_vars, doc, auth_bindings).cmd
}

/// Register all global flags and return both the command and the
/// optional `Global headers:` section for the root help footer. The
/// normal path uses this variant to compose the after-help text.
fn register_global_flags_with_help(
    mut cmd: clap::Command,
    server_vars: &[ServerVar],
    doc: &RestDescription,
    auth_bindings: &[(String, crate::auth::SchemeBinding)],
) -> RegisterGlobalFlagsResult {
    for var in server_vars {
        let kebab = var.name.replace('_', "-");
        let help_text = var
            .description
            .clone()
            .unwrap_or_else(|| {
                format!("Value for the {{{}}} URL template variable", var.name)
            });
        let mut arg = clap::Arg::new(var.name.clone())
            .long(kebab)
            .global(true)
            .value_name(var.name.to_uppercase())
            .help(help_text);
        if let Some(env) = &var.env_var {
            arg = arg.env(env.clone());
        }
        if let Some(default) = &var.default {
            arg = arg.default_value(default.clone());
        }
        cmd = cmd.arg(arg);
    }

    for var in &doc.sdk_variables {
        let kebab = crate::text::to_kebab_flag(&var.name);
        if sdk_variable_collides_with_builtin(&kebab) {
            tracing::warn!(
                "x-fern-sdk-variables entry '{}' would register --{} which \
                 collides with a built-in flag; skipping. Rename the \
                 variable in the spec to avoid the collision.",
                var.name,
                kebab,
            );
            continue;
        }
        let env_name = crate::text::to_screaming_snake(&var.name);
        let help_text = var.description.clone().unwrap_or_else(|| {
            format!(
                "Value for the SDK variable '{}' (substituted into path templates)",
                var.name
            )
        });
        let arg = clap::Arg::new(var.name.clone())
            .long(kebab)
            .global(true)
            .value_name(env_name.clone())
            .help(help_text)
            .env(env_name);
        cmd = cmd.arg(arg);
    }

    use std::collections::HashSet;
    let mut registered_kebabs: HashSet<String> = HashSet::new();
    let mut global_header_help_pairs: Vec<(String, String)> = Vec::new();
    for h in &doc.global_headers {
        let kebab = global_header_flag_name(h);
        if global_header_flag_collides_with_builtin(&kebab) {
            tracing::warn!(
                "x-fern-global-headers entry '{}' would register --{} which \
                 collides with a built-in flag; skipping. Rename via \
                 `name:` in the spec to avoid the collision.",
                h.header,
                kebab,
            );
            continue;
        }
        if !registered_kebabs.insert(kebab.clone()) {
            tracing::warn!(
                "x-fern-global-headers entry '{}' would register --{} which \
                 duplicates an earlier global-header flag; skipping.",
                h.header,
                kebab,
            );
            continue;
        }
        let value_name = crate::text::to_screaming_snake(&kebab);
        let mut help_lines: Vec<String> =
            vec![format!("Global header `{}` (sent on every request).", h.header)];
        if let Some(env) = &h.env {
            help_lines.push(format!("Env: {env}."));
        }
        if let Some(def) = &h.default {
            help_lines.push(format!("Default: {def}."));
        } else if !h.optional {
            help_lines.push("Required.".to_string());
        }
        let help_text = help_lines.join(" ");
        let prefix = format!("--{kebab} <{value_name}>");
        global_header_help_pairs.push((prefix, help_text.clone()));
        let mut arg = clap::Arg::new(global_header_arg_id(h))
            .long(kebab)
            .global(true)
            .hide(true)
            .value_name(value_name)
            .help(help_text);
        if let Some(env) = &h.env {
            arg = arg.env(env.clone());
        }
        if let Some(def) = &h.default {
            arg = arg.default_value(def.clone());
        }
        cmd = cmd.arg(arg);
    }
    let global_headers_section: Option<String> = if global_header_help_pairs.is_empty() {
        None
    } else {
        let prefix_width = global_header_help_pairs
            .iter()
            .map(|(p, _)| p.chars().count())
            .max()
            .unwrap_or(0);
        let rows: Vec<String> = global_header_help_pairs
            .iter()
            .map(|(prefix, help)| {
                let pad = prefix_width.saturating_sub(prefix.chars().count());
                format!("  {prefix}{:pad$}  {help}", "", pad = pad)
            })
            .collect();
        Some(format!("Global headers:\n{}", rows.join("\n")))
    };

    for arg_name in crate::auth::collect_binding_cli_args(auth_bindings) {
        cmd = cmd.arg(
            clap::Arg::new(arg_name.clone())
                .long(arg_name.clone())
                .global(true)
                .value_name(arg_name.to_uppercase().replace('-', "_"))
                .help(format!("Credential value for auth source `{arg_name}`")),
        );
    }

    RegisterGlobalFlagsResult { cmd, global_headers_section }
}

/// A custom command handler function.
///
/// Receives the parsed [`clap::ArgMatches`] for the subcommand and an
/// [`AppContext`] that provides access to the spec, auth token, and
/// executor.
pub type HandlerFn = crate::custom_commands::HandlerFn<AppContext>;

/// Internal entry describing one OpenAPI spec to be merged.
pub(crate) struct SpecEntry {
    yaml: String,
    /// Empty = flat at the top level. One entry = wrap under that prefix.
    /// Multiple = wrap under nested resources (`["v3", "customers"]` →
    /// `v3.customers.*`). Path is constructed from slash-delimited input on
    /// the public API.
    prefix_path: Vec<String>,
    /// Overlay documents to apply before parsing.
    overlays: Vec<String>,
    /// Optional overrides YAML strings that are deep-merged onto the base spec
    /// before parsing. Applied sequentially — later overrides take precedence.
    /// Matches the Fern CLI `generators.yml` `overrides:` key behavior:
    /// maps merge key-by-key, arrays replace wholesale, `null` deletes keys.
    overrides: Vec<String>,
}

/// A server-URL template variable like `{store_hash}` in
/// `https://api.example.com/stores/{store_hash}/v3`. Resolved at runtime
/// from a CLI flag (`--<name>`), an env var, or a built-in default — first
/// match wins.
#[derive(Clone)]
pub(crate) struct ServerVar {
    /// OpenAPI variable name as it appears in the URL template (`store_hash`).
    name: String,
    /// Env var consulted when the flag isn't passed (e.g. `MYAPI_STORE_HASH`).
    env_var: Option<String>,
    /// Fallback default (for variables that have one — tenant/store
    /// identifiers typically don't).
    default: Option<String>,
    /// One-line `--help` string.
    description: Option<String>,
}

/// Builder for a schema-driven CLI application (OpenAPI).
pub struct CliApp {
    pub(crate) name: String,
    pub(crate) specs: Vec<SpecEntry>,
    title_override: Option<String>,
    description_override: Option<String>,
    /// Auth bindings registered via [`auth_scheme`](Self::auth_scheme),
    /// [`auth_basic_scheme`](Self::auth_basic_scheme), and
    /// [`auth_provider`](Self::auth_provider). The constructed provider is
    /// built from these (lowered against the spec's
    /// `components.securitySchemes`).
    auth_bindings: Vec<(String, SchemeBinding)>,
    /// Override for how bindings compose. Defaults to [`AuthStrategy::Auto`]
    /// — the spec drives the choice. Generators that already know the
    /// API's auth model can pin a specific strategy.
    auth_strategy: AuthStrategy,
    /// Trust roots parsed at builder-call time. Storing parsed certs (not
    /// raw bytes) means the validation error message lives in one place
    /// — at the call site of `extra_root_cert`, where it's most useful.
    extra_root_certs: Vec<reqwest::Certificate>,
    /// Raw PEM bytes for each trust root added via `extra_root_cert`, kept
    /// alongside the parsed `extra_root_certs` above. Threaded through to
    /// `HttpConfig::with_parsed_root_certs` so transport-neutral callers
    /// (`HttpConfig::resolve`) can hand PEM to non-reqwest TLS connectors
    /// (e.g. `tokio-tungstenite`).
    extra_root_certs_pem: Vec<Vec<u8>>,
    pub(crate) custom_commands: CustomCommandRegistry<AppContext>,
    pub(crate) server_vars: Vec<ServerVar>,
    /// Generator-supplied environment-variable overrides for spec-root
    /// idempotency headers (parsed from `x-fern-idempotency-headers`).
    /// Keyed by the entry's `name` (preferred) or `header` value;
    /// `CliApp::build_doc` applies these to every idempotent operation's
    /// synthetic header parameter so the `--<flag>` accepts the value
    /// from the env var as a fallback.
    idempotency_header_envs: HashMap<String, String>,
    /// Compile-time preset audiences. Operations whose
    /// `x-fern-audiences` doesn't intersect this set are dropped from
    /// the command tree before clap ever sees them. Empty (the default)
    /// = no filter — every operation is included.
    ///
    /// Configured by the binary's `main.rs` via [`Self::audiences`]; not
    /// exposed as a CLI flag, mirroring fern's intent that audience
    /// selection is a build-time decision baked into the generated SDK
    /// (`packages/cli/api-importers/openapi/openapi-ir-parser/src/openapi/v3/generateIr.ts:117-143`).
    audiences: Vec<String>,
}

impl CliApp {
    /// Create a new CLI application with the given binary name.
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            specs: Vec::new(),
            title_override: None,
            description_override: None,
            auth_bindings: Vec::new(),
            auth_strategy: AuthStrategy::Auto,
            extra_root_certs: Vec::new(),
            extra_root_certs_pem: Vec::new(),
            custom_commands: CustomCommandRegistry::new(),
            server_vars: Vec::new(),
            idempotency_header_envs: HashMap::new(),
            audiences: Vec::new(),
        }
    }

    /// Pin the CLI surface to operations tagged with one of the given
    /// `x-fern-audiences` values. Operations without an
    /// `x-fern-audiences` tag, or whose tags don't intersect this set,
    /// are dropped from the command tree at build time — they don't
    /// appear in `--help`, JSON help, completions, or anywhere else.
    ///
    /// Multiple audiences union (OR): an operation tagged with *any* of
    /// the listed audiences survives. Calling `.audiences([])` (or not
    /// calling this at all) is a no-op — every operation is included.
    ///
    /// Audience selection is a compile-time decision baked into each
    /// binary's `main.rs`, not a runtime flag. This mirrors fern's
    /// importer semantics
    /// (`packages/cli/api-importers/openapi/openapi-ir-parser/src/openapi/v3/generateIr.ts:117-143`),
    /// where the audience filter physically removes operations from the
    /// IR rather than hiding them at execution time.
    ///
    /// ```ignore
    /// CliApp::new("my-public-api")
    ///     .spec(include_str!("openapi.json"))
    ///     .audiences(["public"])
    ///     .run();
    /// ```
    pub fn audiences<I, S>(mut self, audiences: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        self.audiences = audiences
            .into_iter()
            .map(Into::into)
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();
        self
    }

    /// Register an environment-variable fallback for a spec-root
    /// idempotency header (declared via `x-fern-idempotency-headers`).
    ///
    /// `name` matches against the entry's `name` field first, then its
    /// `header` field — whichever the generator finds most convenient at
    /// the call site. When the user invokes an idempotent operation
    /// without the corresponding `--<flag>`, the value is taken from the
    /// named environment variable.
    ///
    /// ```ignore
    /// CliApp::new("api")
    ///     .spec(include_str!("openapi.json"))
    ///     .idempotency_header_env("Idempotency-Key", "API_IDEMPOTENCY_KEY")
    ///     .run();
    /// ```
    ///
    /// This is the cli-sdk entry point referenced by FER-9852, where the
    /// generator emits one call per parsed idempotency header. The
    /// header itself is only sent on operations marked
    /// `x-fern-idempotent: true`; non-idempotent operations are
    /// unaffected.
    pub fn idempotency_header_env(mut self, name: &str, env_var: &str) -> Self {
        self.idempotency_header_envs.insert(name.to_string(), env_var.to_string());
        self
    }

    /// Register a server-URL template variable (e.g. `{store_hash}`).
    ///
    /// Auto-generates a global `--<name>` flag (with kebab-cased name) and
    /// resolves the value at request time from, in order:
    ///   1. The CLI flag
    ///   2. The given env var (if any)
    ///   3. The built-in default (if any)
    ///   4. Otherwise, errors with a helpful message
    ///
    /// Used for multi-tenant APIs where every URL is parameterized
    /// (e.g. `https://api.example.com/stores/{store_hash}/v3`). Variables
    /// referenced in `servers[].url` but not registered here remain literal
    /// in the URL (and the request will fail at send time), so registering
    /// them is effectively required.
    pub fn server_var(
        mut self,
        name: &str,
        env_var: Option<&str>,
        default: Option<&str>,
        description: Option<&str>,
    ) -> Self {
        self.server_vars.push(ServerVar {
            name: name.to_string(),
            env_var: env_var.map(str::to_string),
            default: default.map(str::to_string),
            description: description.map(str::to_string),
        });
        self
    }

    /// Add an OpenAPI spec YAML string. May be called multiple times; specs are flat-merged.
    /// Typically used with `include_str!`.
    pub fn spec(mut self, yaml: &str) -> Self {
        self.specs.push(SpecEntry {
            yaml: yaml.to_string(),
            prefix_path: Vec::new(),
            overlays: Vec::new(),
            overrides: Vec::new(),
        });
        self
    }

    /// Add an OpenAPI spec with a Fern-style overrides file applied before parsing.
    ///
    /// The override YAML is deep-merged onto the spec: maps merge key-by-key
    /// (override wins on leaf collisions), arrays replace wholesale, and
    /// `null` values delete the corresponding key. This matches the Fern CLI's
    /// `generators.yml` `overrides:` behavior.
    ///
    /// Use this to add `x-fern-sdk-group-name`, `x-fern-sdk-method-name`, or
    /// any other spec-level patches without modifying the upstream spec.
    pub fn spec_with_overrides(mut self, yaml: &str, overrides: &str) -> Self {
        self.specs.push(SpecEntry {
            yaml: yaml.to_string(),
            prefix_path: Vec::new(),
            overlays: Vec::new(),
            overrides: vec![overrides.to_string()],
        });
        self
    }

    /// Add an OpenAPI spec whose resources are wrapped under `prefix`. Use
    /// slashes to nest: `"v3/customers"` puts the spec's resources under
    /// `v3.customers.*`. Multiple `spec_under` calls with the same path
    /// merge into a shared namespace; inner-resource collisions error.
    pub fn spec_under(mut self, prefix: &str, yaml: &str) -> Self {
        self.specs.push(SpecEntry {
            yaml: yaml.to_string(),
            prefix_path: split_prefix(prefix),
            overlays: Vec::new(),
            overrides: Vec::new(),
        });
        self
    }

    /// Like [`spec_under`](Self::spec_under), but with a Fern-style overrides
    /// file deep-merged onto the spec before parsing.
    pub fn spec_under_with_overrides(
        mut self,
        prefix: &str,
        yaml: &str,
        overrides: &str,
    ) -> Self {
        self.specs.push(SpecEntry {
            yaml: yaml.to_string(),
            prefix_path: split_prefix(prefix),
            overlays: Vec::new(),
            overrides: vec![overrides.to_string()],
        });
        self
    }

    /// Add multiple specs that all merge under the same `prefix` (flat).
    /// Equivalent to repeated `spec_under` calls; inner-resource collisions
    /// across the specs error at startup.
    pub fn specs_under<I, S>(mut self, prefix: &str, yamls: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: AsRef<str>,
    {
        let path = split_prefix(prefix);
        for yaml in yamls {
            self.specs.push(SpecEntry {
                yaml: yaml.as_ref().to_string(),
                prefix_path: path.clone(),
                overlays: Vec::new(),
                overrides: Vec::new(),
            });
        }
        self
    }

    /// Add multiple specs under `prefix`, each given its own sub-namespace.
    /// `specs_under_named("v3", [("customers", yaml1), ("orders", yaml2)])`
    /// produces `v3.customers.*` and `v3.orders.*` — what `specs_under`
    /// would flatten, this preserves per-spec scoping. Useful when specs
    /// share cross-cutting tags (`Metafields`) that would otherwise collide
    /// once flattened.
    pub fn specs_under_named<I, K, V>(mut self, prefix: &str, named: I) -> Self
    where
        I: IntoIterator<Item = (K, V)>,
        K: AsRef<str>,
        V: AsRef<str>,
    {
        let parent = split_prefix(prefix);
        for (sub, yaml) in named {
            let mut path = parent.clone();
            path.extend(split_prefix(sub.as_ref()));
            self.specs.push(SpecEntry {
                yaml: yaml.as_ref().to_string(),
                prefix_path: path,
                overlays: Vec::new(),
                overrides: Vec::new(),
            });
        }
        self
    }

    /// Like [`specs_under_named`](Self::specs_under_named), but each entry is
    /// a `(name, yaml, overrides_yaml)` triple. The overrides file is
    /// deep-merged onto the spec before parsing.
    ///
    /// ```ignore
    /// CliApp::new("myapi")
    ///     .specs_under_named_with_overrides("v3", [
    ///         ("customers",
    ///          include_str!("specs/management/customers.v3.yml"),
    ///          include_str!("overrides/management/customers.v3.yml")),
    ///     ])
    /// ```
    pub fn specs_under_named_with_overrides<I, K, V, O>(
        mut self,
        prefix: &str,
        named: I,
    ) -> Self
    where
        I: IntoIterator<Item = (K, V, O)>,
        K: AsRef<str>,
        V: AsRef<str>,
        O: AsRef<str>,
    {
        let parent = split_prefix(prefix);
        for (sub, yaml, overrides) in named {
            let mut path = parent.clone();
            path.extend(split_prefix(sub.as_ref()));
            self.specs.push(SpecEntry {
                yaml: yaml.as_ref().to_string(),
                prefix_path: path,
                overlays: Vec::new(),
                overrides: vec![overrides.as_ref().to_string()],
            });
        }
        self
    }

    /// Add an [OpenAPI Overlay](https://spec.openapis.org/overlay/latest.html)
    /// to the most recently added spec. Overlays are applied in order before
    /// the spec is parsed into the internal representation.
    ///
    /// # Panics
    ///
    /// Panics if called before `.spec()` or `.spec_under()`.
    ///
    /// # Example
    ///
    /// ```rust,ignore
    /// use fern_cli_sdk::openapi::CliApp;
    ///
    /// CliApp::new("my-api")
    ///     .spec(include_str!("openapi.json"))
    ///     .overlay(include_str!("overlay.yaml"))
    ///     .auth_scheme_env("bearerAuth", "MY_API_TOKEN")
    ///     .run()
    /// ```
    pub fn overlay(mut self, overlay_yaml: &str) -> Self {
        let entry = self
            .specs
            .last_mut()
            .expect("overlay() called before spec(); add a spec first");
        entry.overlays.push(overlay_yaml.to_string());
        self
    }

    /// Override the top-level --help title, regardless of what the spec(s) declare.
    pub fn title(mut self, t: &str) -> Self {
        self.title_override = Some(t.to_string());
        self
    }

    /// Override the top-level --help description, regardless of what the spec(s) declare.
    pub fn description(mut self, d: &str) -> Self {
        self.description_override = Some(d.to_string());
        self
    }

    /// Build the merged `RestDescription` from all registered specs.
    pub(crate) fn build_doc(&self) -> Result<RestDescription, CliError> {
        if self.specs.is_empty() {
            return Err(CliError::Discovery(
                "No spec provided. Call .spec() on CliApp.".to_string(),
            ));
        }

        let mut merged: Option<RestDescription> = None;

        for entry in &self.specs {
            // 1. Apply overlays (RFC 7396 style) first.
            let effective_yaml = crate::openapi::overlay::apply_overlays_to_spec(
                &entry.yaml,
                &entry.overlays,
            )?;

            // 2. Apply Fern-style overrides (deep-merge) on top.
            let spec_doc = if entry.overrides.is_empty() {
                crate::openapi::load_openapi_spec(&effective_yaml, &self.name)?
            } else {
                let mut value: serde_yaml::Value = serde_yaml::from_str(&effective_yaml)
                    .map_err(|e| CliError::Discovery(
                        format!("Failed to parse OpenAPI spec: {e}"),
                    ))?;
                for ovr in &entry.overrides {
                    let override_value: serde_yaml::Value = serde_yaml::from_str(ovr)
                        .map_err(|e| CliError::Discovery(
                            format!("Failed to parse overrides YAML: {e}"),
                        ))?;
                    value = crate::openapi::deep_merge_yaml(value, override_value);
                }
                crate::openapi::load_openapi_spec_from_value(value, &self.name)?
            };

            match merged {
                None => {
                    let mut base = spec_doc;
                    let resources = std::mem::take(&mut base.resources);
                    base.resources = HashMap::new();
                    merge_into_path(&mut base.resources, &entry.prefix_path, resources)?;
                    merged = Some(base);
                }
                Some(ref mut acc) => {
                    merge_into_path(&mut acc.resources, &entry.prefix_path, spec_doc.resources)?;
                    merge_schemas(&mut acc.schemas, spec_doc.schemas)?;
                    merge_security_schemes(&mut acc.security_schemes, spec_doc.security_schemes);
                    merge_sdk_variables(&mut acc.sdk_variables, spec_doc.sdk_variables);
                    merge_global_headers(&mut acc.global_headers, spec_doc.global_headers);
                }
            }
        }

        let mut doc = merged.expect("at least one spec was processed");
        if let Some(ref t) = self.title_override {
            doc.title = Some(t.clone());
        }
        if let Some(ref d) = self.description_override {
            doc.description = Some(d.clone());
        }

        // Apply generator-supplied idempotency-header env overrides.
        // The parser populates each idempotent operation's synthetic
        // header MethodParameter with `env_var = entry.env` from the
        // spec; this pass lets the generator override or supply that
        // mapping post-hoc (FER-9852 builder API) so end users don't
        // need to edit the spec to wire a new env var.
        if !self.idempotency_header_envs.is_empty() {
            apply_idempotency_header_envs(&mut doc, &self.idempotency_header_envs);
        }

        Ok(doc)
    }

    /// Shorthand for `auth_scheme(name, AuthCredentialSource::from_env(env))`.
    /// Covers the 80% case — most callers bind a scheme to one env var.
    ///
    /// ```ignore
    /// CliApp::new("api")
    ///     .spec(include_str!("openapi.json"))
    ///     .auth_scheme_env("bearerAuth", "API_TOKEN")
    ///     .run();
    /// ```
    pub fn auth_scheme_env(self, scheme_name: &str, env_var: &str) -> Self {
        self.auth_scheme(scheme_name, AuthCredentialSource::from_env(env_var))
    }

    /// Shorthand for `auth_scheme(name, AuthCredentialSource::cli(arg_name))`.
    /// Auto-registers a global `--<arg_name>` flag at run time. Accepts
    /// either `"api-token"` or `"--api-token"`.
    pub fn auth_scheme_cli(self, scheme_name: &str, arg_name: &str) -> Self {
        self.auth_scheme(scheme_name, AuthCredentialSource::cli(arg_name))
    }

    /// Shorthand for `auth_scheme(name, AuthCredentialSource::file(path))`.
    /// `~` and `~/` are expanded against `$HOME`.
    pub fn auth_scheme_file(self, scheme_name: &str, path: impl AsRef<std::path::Path>) -> Self {
        self.auth_scheme(scheme_name, AuthCredentialSource::file(path))
    }

    /// Bind a credential source to a single-value auth scheme declared in the
    /// spec's `components.securitySchemes` (bearer / apiKey / oauth2).
    ///
    /// `scheme_name` should match the spec key. The credential's resolved
    /// value is sent according to the scheme's declared shape:
    ///
    /// | Scheme               | Outgoing                              |
    /// | -------------------- | ------------------------------------- |
    /// | `http: bearer`       | `Authorization: Bearer <value>`       |
    /// | `apiKey, in: header` | `<name>: <value>`                     |
    /// | `oauth2`             | `Authorization: Bearer <value>`       |
    ///
    /// When any operation in the spec declares per-endpoint `security:`,
    /// the constructed provider is a [`RoutingAuthProvider`][rap] that picks
    /// the right scheme per request. Otherwise it's a plain
    /// [`AnyAuthProvider`][aap] that tries each binding in order.
    ///
    /// [rap]: crate::auth::RoutingAuthProvider
    /// [aap]: crate::auth::AnyAuthProvider
    pub fn auth_scheme(mut self, scheme_name: &str, source: AuthCredentialSource) -> Self {
        self.auth_bindings
            .push((scheme_name.to_string(), SchemeBinding::Token(source)));
        self
    }

    /// Bind separate username and password sources to an `http: basic` scheme.
    /// Both must resolve for the provider to attach `Authorization: Basic
    /// base64(user:pass)`; if either is missing the binding contributes no
    /// credentials.
    pub fn auth_basic_scheme(
        mut self,
        scheme_name: &str,
        username: AuthCredentialSource,
        password: AuthCredentialSource,
    ) -> Self {
        self.auth_bindings.push((
            scheme_name.to_string(),
            SchemeBinding::Basic { username, password },
        ));
        self
    }

    /// Bind a single source to the *username* half of an `http: basic`
    /// scheme; password goes out as the empty string. Use for APIs that
    /// expect the credential in the basic-auth username slot (Close,
    /// Stripe-with-key-as-username, etc.).
    ///
    /// Equivalent to [`auth_basic_scheme`] with the password set to an
    /// always-resolving zero-length source, but distinct because the
    /// SDK's `has_credentials()` check only looks at the username here —
    /// callers don't need to invent a sentinel for the unused half.
    ///
    /// [`auth_basic_scheme`]: Self::auth_basic_scheme
    pub fn auth_basic_scheme_username_only(
        mut self,
        scheme_name: &str,
        username: AuthCredentialSource,
    ) -> Self {
        self.auth_bindings.push((
            scheme_name.to_string(),
            SchemeBinding::BasicUsernameOnly(username),
        ));
        self
    }

    /// Symmetric counterpart to [`auth_basic_scheme_username_only`] — bind
    /// a single source to the basic-auth password while the username goes
    /// out empty. Used by APIs that put the token in the password slot.
    ///
    /// [`auth_basic_scheme_username_only`]: Self::auth_basic_scheme_username_only
    pub fn auth_basic_scheme_password_only(
        mut self,
        scheme_name: &str,
        password: AuthCredentialSource,
    ) -> Self {
        self.auth_bindings.push((
            scheme_name.to_string(),
            SchemeBinding::BasicPasswordOnly(password),
        ));
        self
    }

    /// Plug in a fully-custom [`AuthProvider`][crate::auth::AuthProvider] for
    /// a scheme name. Useful when the spec uses a scheme the SDK doesn't
    /// model out-of-the-box (mTLS-derived headers, request signing, OAuth2
    /// client-credentials with token refresh, etc.).
    ///
    /// Accepts any concrete `AuthProvider` by value and wraps it in [`Arc`]
    /// internally. For pre-built `Arc<dyn AuthProvider>` values (sharing a
    /// provider across multiple binders), use [`auth_provider_shared`].
    ///
    /// [`auth_provider_shared`]: Self::auth_provider_shared
    pub fn auth_provider<P>(self, scheme_name: &str, provider: P) -> Self
    where
        P: crate::auth::AuthProvider + 'static,
    {
        self.auth_provider_shared(scheme_name, std::sync::Arc::new(provider))
    }

    /// Same as [`auth_provider`] but takes an already-built
    /// [`DynAuthProvider`]. Use this when sharing one provider across
    /// multiple bindings or storing custom providers in a registry.
    ///
    /// [`auth_provider`]: Self::auth_provider
    pub fn auth_provider_shared(
        mut self,
        scheme_name: &str,
        provider: DynAuthProvider,
    ) -> Self {
        self.auth_bindings.push((
            scheme_name.to_string(),
            SchemeBinding::Custom(provider),
        ));
        self
    }

    /// Pin how the bound auth schemes compose into a single provider.
    /// Defaults to [`AuthStrategy::Auto`], which derives the strategy from
    /// the spec (Routing if any operation declares per-endpoint security,
    /// otherwise Any).
    ///
    /// Generators that know their API's auth model statically can override
    /// this — most importantly to express the [`All`][a] case (every
    /// scheme on every request) which the spec doesn't always model.
    ///
    /// [a]: AuthStrategy::All
    pub fn auth_strategy(mut self, strategy: AuthStrategy) -> Self {
        self.auth_strategy = strategy;
        self
    }

    /// Register a custom top-level subcommand with its handler function.
    ///
    /// Equivalent to [`command_under`](Self::command_under) with an empty path.
    pub fn command(mut self, cmd: clap::Command, handler: HandlerFn) -> Self {
        self.custom_commands.register(cmd, handler);
        self
    }

    /// Register a custom subcommand under an existing path in the spec-derived
    /// command tree. Useful for adding a new leaf alongside spec-generated
    /// commands (e.g. grafting `webhooks verify` next to a spec-generated
    /// `webhooks list` and `webhooks create`).
    ///
    /// - `path` — the parent path the command should be grafted under. An
    ///   empty path registers the command at the top level. Intermediate
    ///   parents that do not yet exist are auto-created.
    /// - `cmd` — the leaf [`clap::Command`]. Its name becomes the final
    ///   segment of the path.
    /// - `handler` — invoked with the [`clap::ArgMatches`] for the leaf and
    ///   the [`AppContext`].
    ///
    /// If a subcommand with the same leaf name already exists at the target
    /// path (e.g. from the OpenAPI spec), it is **replaced** by `cmd` —
    /// custom commands take precedence on leaf collisions.
    pub fn command_under<S: AsRef<str>>(
        mut self,
        path: &[S],
        cmd: clap::Command,
        handler: HandlerFn,
    ) -> Self {
        self.custom_commands.register_under(path, cmd, handler);
        self
    }

    /// Register an extra trust root that this CLI will accept on top of the
    /// system's default roots. `pem` must be a PEM-encoded certificate (or
    /// concatenated PEM bundle), typically loaded with `include_bytes!`.
    ///
    /// Useful for distributing a CLI inside an organization where every
    /// machine should trust the company's internal CA out of the box, without
    /// asking each user to set `<NAME>_CA_BUNDLE`.
    ///
    /// ```ignore
    /// # // ignored: needs a real PEM file at the include path.
    /// CliApp::new("internal-tool")
    ///     .spec(include_str!("openapi.json"))
    ///     .extra_root_cert(include_bytes!("../certs/corp-ca.pem"))
    ///     .run()
    /// ```
    ///
    /// Panics if the bytes don't parse as PEM, or if the PEM contains no
    /// certificates. Failing fast at startup is preferable to silently
    /// shipping a CLI that ignores its bundled cert.
    pub fn extra_root_cert(mut self, pem: &[u8]) -> Self {
        // Share the validation path with `HttpConfig::with_extra_root_cert`
        // so error wording stays in sync between the panicking builder API
        // and the Result-returning lower-level API.
        let certs = crate::http::parse_extra_root_cert(pem)
            .unwrap_or_else(|e| panic!("CliApp::extra_root_cert: {e}"));
        self.extra_root_certs.extend(certs);
        self.extra_root_certs_pem.push(pem.to_vec());
        self
    }

    /// Run the CLI application. This is the main entry point.
    ///
    /// Builds a tokio runtime internally so the caller's `main()` does not
    /// need to be async.
    pub fn run(self) {
        // Reset SIGPIPE to default so piped output (e.g. `| head`) doesn't
        // panic. Must happen before any I/O.
        crate::reset_sigpipe();

        // Load .env file if present (silently ignored if missing)
        let _ = dotenvy::dotenv();

        // Initialize structured logging (no-op if env vars are unset)
        crate::init_logging(&self.name);

        let rt = tokio::runtime::Runtime::new().expect("Failed to create tokio runtime");
        if let Err(err) = rt.block_on(self.run_async()) {
            print_error_json(&err);
            std::process::exit(err.exit_code());
        }
    }

    /// The async implementation of the CLI run loop.
    async fn run_async(mut self) -> Result<(), CliError> {
        let args: Vec<String> = std::env::args().collect();

        // Handle --version early (before loading spec)
        if args.iter().any(|a| cli_args::is_version_flag(a)) {
            println!("{} {}", self.name, env!("CARGO_PKG_VERSION"));
            return Ok(());
        }

        // Build the HTTP config once per run. Holds the binary name (used to
        // scope env-var lookups) and any compile-time trust roots. The roots
        // were already validated at builder time; we just thread the parsed
        // certs through.
        let http_config = crate::http::HttpConfig::new(&self.name)?
            .with_parsed_root_certs(
                self.extra_root_certs.iter().cloned(),
                self.extra_root_certs_pem.iter().cloned(),
            );

        // Load and merge all API specs
        let mut doc = self.build_doc()?;

        // Apply the audience filter *before* anything else inspects
        // `doc`. The filter physically removes operations whose
        // `x-fern-audiences` doesn't intersect the binary's preset
        // audience set, so excluded operations never appear in:
        //   - the JSON help output below (`render_json_help`),
        //   - the clap command tree (`build_cli`),
        //   - `--help` for any subcommand,
        //   - completions / introspection.
        //
        // Mirrors fern-api/fern's "drop from IR" semantics
        // (`openapi-ir-parser/src/openapi/v3/generateIr.ts:117-143`).
        // The audience list is configured by the binary's `main.rs` via
        // [`Self::audiences`] — a compile-time preset, not a runtime
        // flag. An empty preset is a no-op (every operation included).
        commands::filter_doc_by_audiences(&mut doc, &self.audiences);

        // Intercept --help --format json before clap parses, to emit machine-readable output
        if cli_args::wants_json_help(&args) {
            let path = cli_args::extract_subcommand_path(&args);
            return crate::openapi::help::render_json_help(&doc, &path);
        }

        // Intercept `<cli> completion <shell>` early — before normal API
        // dispatch — so a spec resource named "completion" doesn't collide.
        // Builds the full command tree (including global flags) so the
        // generated script covers the entire CLI surface.
        if crate::completions::wants_completion(&args) {
            // Extract the shell name: positional #1 (since `completion`
            // is positional #0), applying the same BOOLEAN_FLAGS-aware
            // skip logic so `--base-url <URL>` doesn't leak as the shell.
            let raw_shell_arg: Option<&str> =
                crate::early_intercept::nth_positional(&args, 1);

            let base = self
                .custom_commands
                .graft_into(commands::build_cli(&doc))
                .subcommand(crate::completions::completion_command())
                .subcommand(crate::man::man_command());

            match raw_shell_arg {
                Some(s) => match crate::completions::parse_shell(s) {
                    Some(shell) => {
                        let mut full_cmd = register_global_flags(
                            base,
                            &self.server_vars,
                            &doc,
                            &self.auth_bindings,
                        );
                        crate::completions::generate_completion(
                            shell,
                            &mut full_cmd,
                            &self.name,
                        )
                        .map_err(|e| CliError::Other(e.into()))?;
                        return Ok(());
                    }
                    None => {
                        return Err(CliError::Validation(format!(
                            "invalid shell: '{s}'. Expected one of: bash, zsh, fish, powershell, elvish"
                        )));
                    }
                },
                None => {
                    // No shell argument — print friendly help and exit 0.
                    let mut full_cmd = register_global_flags(
                        base,
                        &self.server_vars,
                        &doc,
                        &self.auth_bindings,
                    );
                    if let Some(sub) = full_cmd.find_subcommand_mut("completion") {
                        sub.print_help().ok();
                    }
                    return Ok(());
                }
            }
        }

        // Intercept `<cli> man` early — same pattern as completion above.
        // If `--help` / `-h` appears after `man`, fall through to normal
        // clap dispatch so the subcommand help (with EXAMPLES) is shown
        // instead of generating the man page.
        if crate::man::wants_man(&args) {
            let has_help = args.iter().skip(1).skip_while(|a| a.as_str() != "man").skip(1)
                .any(|a| a == "--help" || a == "-h");
            let base = self
                .custom_commands
                .graft_into(commands::build_cli(&doc))
                .subcommand(crate::completions::completion_command())
                .subcommand(crate::man::man_command());
            let mut full_cmd =
                register_global_flags(base, &self.server_vars, &doc, &self.auth_bindings);
            if has_help {
                if let Some(sub) = full_cmd.find_subcommand_mut("man") {
                    sub.print_help().ok();
                }
                return Ok(());
            }
            crate::man::generate_man(full_cmd, &self.name)
                .map_err(|e| CliError::Other(e.into()))?;
            return Ok(());
        }

        // Build the dynamic command tree, then graft custom commands into
        // it. Empty path → top-level. On leaf-name collision with a
        // spec-generated command, custom wins. The `completion` and `man`
        // subcommands are also registered here so they appear in `--help`.
        let base = self
            .custom_commands
            .graft_into(commands::build_cli(&doc))
            .subcommand(crate::completions::completion_command())
            .subcommand(crate::man::man_command());

        let RegisterGlobalFlagsResult { cmd: mut cli, global_headers_section } =
            register_global_flags_with_help(base, &self.server_vars, &doc, &self.auth_bindings);

        let auth_section = crate::auth::render_auth_help_section(&self.auth_bindings);
        cli = cli.after_help(compose_root_after_help_sections(
            global_headers_section.as_deref(),
            auth_section.as_deref(),
            &commands::after_help_footer(&doc.name),
        ));

        // Parse args. clap raises a special `DisplayHelp*` "error" both for
        // explicit `--help` and for the implicit help from
        // `arg_required_else_help` — neither is a real failure, so print to
        // stdout and exit 0 instead of wrapping in a validation error JSON.
        let matches = cli.try_get_matches_from(&args).map_err(|e| {
            if e.kind() == clap::error::ErrorKind::DisplayHelp
                || e.kind() == clap::error::ErrorKind::DisplayHelpOnMissingArgumentOrSubcommand
                || e.kind() == clap::error::ErrorKind::DisplayVersion
            {
                print!("{e}");
                std::process::exit(0);
            }
            CliError::Validation(e.to_string())
        })?;

        // Finalize auth bindings against the parsed matches. After this,
        // any `AuthCredentialSource::Cli(name)` in the bindings is replaced
        // with a closure reading from the matches — so `build_auth_provider`
        // (called below for both custom-command dispatch and regular
        // execution) sees a fully resolvable provider.
        if !self.auth_bindings.is_empty() {
            let matches_arc = std::sync::Arc::new(matches.clone());
            self.auth_bindings = crate::auth::finalize_bindings(
                std::mem::take(&mut self.auth_bindings),
                &matches_arc,
            );
        }

        // Substitute server variables in root_urls. Clap pulls from --flag
        // first, then the registered env var (via .env()), then the default,
        // so a single get_one lookup covers the full priority chain.
        if !self.server_vars.is_empty() {
            let mut substitutions: std::collections::HashMap<String, String> =
                std::collections::HashMap::new();
            for var in &self.server_vars {
                if let Some(value) = matches.get_one::<String>(&var.name) {
                    substitutions.insert(var.name.clone(), value.clone());
                }
            }
            apply_server_var_substitutions(&mut doc, &substitutions);
        }

        // Dispatch to a custom command if one was invoked.
        if !self.custom_commands.is_empty() {
            let auth_provider = self.build_auth_provider(&doc);
            // Resolve global headers once for custom-command handlers.
            // Required-header validation is deferred until execute/invoke
            // is called, because the per-op override check needs to know
            // the operation. Here we only collect CLI/env/default values.
            let resolved_global_headers: Vec<(String, String)> = doc
                .global_headers
                .iter()
                .filter_map(|h| resolve_global_header_value(&matches, h).map(|v| (h.header.clone(), v)))
                .collect();
            let ctx = AppContext {
                doc: doc.clone(),
                auth_provider,
                http_config: http_config.clone(),
                global_headers: resolved_global_headers,
            };
            if let Some(result) = self.custom_commands.dispatch(&matches, &ctx) {
                return result;
            }
        }

        // Build the output pipeline (format + color + later: --fields/--jq/--template).
        let pipeline = formatter::OutputPipeline::from_matches(&matches)
            .map_err(|e| CliError::Validation(e.to_string()))?;

        // Walk the subcommand tree to find the target method
        let (method, matched_args) = resolve_method_from_matches(&doc, &matches)?;

        let params_override = matched_args
            .get_one::<String>("params")
            .map(|s| s.as_str());
        let params = collect_params_from_flags(matched_args, method, params_override)?;
        let params_json_string = serde_json::to_string(&params)
            .map_err(|e| CliError::Validation(format!("Failed to serialize params: {e}")))?;
        let params_json: Option<&str> = if params.is_empty() {
            None
        } else {
            Some(&params_json_string)
        };
        // Resolve the configured `x-fern-global-headers` (CLI > env >
        // default) and check that required ones have a value, deferring
        // to per-op overrides where the operation declares a header
        // parameter with the same wire-name. Built once per invocation
        // and stamped on every outgoing request inside the executor.
        let global_header_overrides =
            build_global_header_overrides(matched_args, &doc, method, &params)?;
        let body_json = matched_args
            .try_get_one::<String>("json")
            .ok()
            .flatten()
            .map(|s| s.as_str());
        // The binary-body flag name is per-operation (driven by
        // `x-fern-parameter-name` or the schema's `format: binary` default).
        // Look it up only for methods that declare one. The raw value is
        // parsed by the executor into one of three forms — plain path,
        // `@<path>`, or `-` for stdin — so we only reject control characters
        // here (and only on the path-bearing forms).
        let binary_body_path = method
            .binary_request_body
            .as_ref()
            .and_then(|b| {
                matched_args
                    .try_get_one::<String>(&b.flag_name)
                    .ok()
                    .flatten()
                    .map(|s| (b.flag_name.clone(), s.as_str()))
            });
        if let Some((ref flag, p)) = binary_body_path {
            let stripped = p.strip_prefix('@').unwrap_or(p);
            if stripped != "-" {
                crate::output::reject_dangerous_chars(stripped, &format!("--{flag}"))?;
            }
        }
        let binary_body_path = binary_body_path.as_ref().map(|(_, p)| *p);
        let output_path = matched_args
            .get_one::<String>("output")
            .map(|s| s.as_str());

        // Validate file paths against traversal
        let output_path_buf = if let Some(p) = output_path {
            Some(crate::validate::validate_safe_file_path(p, "--output")?)
        } else {
            None
        };
        let output_path = output_path_buf.as_deref().and_then(|p| p.to_str());

        let dry_run = matched_args.get_flag("dry-run");

        // Build pagination config with API-specific token names
        let pagination = build_pagination_config(matched_args, &doc);

        // Build the auth provider once, from the registered bindings
        // lowered against the spec's `components.securitySchemes`.
        let auth_provider = self.build_auth_provider(&doc);

        // --base-url flag wins; otherwise {NAME}_BASE_URL env var.
        let base_url_override_owned = cli_args::resolve_base_url_override(&matches, &self.name)?;
        let base_url_override = base_url_override_owned.as_deref();

        // Honor `x-fern-sdk-return-value` extraction unless the caller
        // passes `--no-extract`. The flag is a debugging escape hatch
        // that prints the full response body; matches the upstream
        // behavior of falling back to the raw response when the SDK
        // can't (or shouldn't) project to the named property.
        let no_extract = matched_args.get_flag("no-extract");

        // Honor `--no-retry` as a debug-only opt-out. When set, the
        // executor skips the retry wrapper regardless of the operation's
        // `x-fern-retries` policy — including transient network errors —
        // so failures surface immediately. Aligns with the open design
        // question called out in the FER-9864 PR description.
        let no_retry = matched_args.get_flag("no-retry");

        // `--no-stream` is only registered on operations with
        // `x-fern-streaming` (see `build_method_command`). Use
        // `try_get_one` so the flag-absent case is a clean false
        // rather than a panic on unknown-arg lookup.
        let no_stream = matched_args
            .try_get_one::<bool>("no-stream")
            .ok()
            .flatten()
            .copied()
            .unwrap_or(false);

        // Execute
        executor::execute_method(
            &doc,
            method,
            params_json,
            body_json,
            &auth_provider,
            output_path,
            None, // no upload
            binary_body_path,
            dry_run,
            &pagination,
            &pipeline,
            false,
            base_url_override,
            &http_config,
            no_extract,
            no_retry,
            no_stream,
            &global_header_overrides,
        )
        .await
        .map(|_| ())
    }

    /// Construct the [`DynAuthProvider`] used for this run from the
    /// registered bindings. With no bindings, returns a `NoAuthProvider`
    /// — the CLI runs unauthenticated.
    fn build_auth_provider(&self, doc: &RestDescription) -> DynAuthProvider {
        let has_per_endpoint = doc.resources.values().any(resource_has_per_endpoint_security);
        crate::auth::build_provider_with_strategy(
            &self.auth_bindings,
            &doc.security_schemes,
            self.auth_strategy,
            has_per_endpoint,
        )
    }
}

/// Runtime context passed to custom command handlers.
///
/// Provides access to the loaded API spec, the constructed auth provider,
/// and a convenience method for executing API methods.
pub struct AppContext {
    doc: RestDescription,
    auth_provider: DynAuthProvider,
    http_config: crate::http::HttpConfig,
    /// Resolved `x-fern-global-headers` for this CLI invocation
    /// (CLI flag > env var > default, computed up front in `run_async`).
    /// Per-op overrides are applied at the call site of `execute_method`
    /// — see [`AppContext::extra_headers_for`].
    global_headers: Vec<(String, String)>,
}

impl AppContext {
    /// Compute the per-op `extra_headers` slice from the pre-resolved
    /// global headers, suppressing entries whose wire-name is also
    /// supplied as a per-op `header` parameter via `params_json`
    /// (per-op wins, mirroring the built-in command path).
    ///
    /// Required-header validation lives here rather than at
    /// `AppContext` construction time because per-op overrides depend
    /// on the specific operation being invoked: a required global
    /// header with no resolved value is allowed when the operation
    /// itself declares the same header as a per-op parameter (the
    /// per-op value takes its place on the wire). This mirrors
    /// `build_global_header_overrides` on the built-in command path so
    /// custom-command handlers get the same validation error shape.
    fn extra_headers_for(
        &self,
        method: &RestMethod,
        params_json: Option<&str>,
    ) -> Result<Vec<(String, String)>, CliError> {
        let params: serde_json::Map<String, serde_json::Value> = match params_json {
            Some(s) if !s.trim().is_empty() => serde_json::from_str(s)
                .map_err(|e| CliError::Validation(format!("Invalid params JSON: {e}")))?,
            _ => serde_json::Map::new(),
        };
        // HTTP header names are case-insensitive per RFC 7230 §3.2 — key
        // the lookup table by lowercased wire-name so a custom-command
        // handler that resolved `x-api-stage` still satisfies the spec's
        // declared `X-API-Stage` global.
        let resolved_by_wire: std::collections::HashMap<String, &str> = self
            .global_headers
            .iter()
            .map(|(n, v)| (n.to_ascii_lowercase(), v.as_str()))
            .collect();
        finalize_global_header_overrides(&self.doc.global_headers, method, &params, |h| {
            resolved_by_wire
                .get(&h.header.to_ascii_lowercase())
                .map(|v| (*v).to_string())
        })
    }

    /// Execute an API method by name, using the same executor as built-in
    /// commands.
    pub fn execute(
        &self,
        method: &RestMethod,
        params_json: Option<&str>,
        body_json: Option<&str>,
        output_format: &formatter::OutputFormat,
    ) -> Result<(), CliError> {
        let pagination = executor::PaginationConfig {
            page_all: false,
            page_limit: 10,
            page_delay_ms: 100,
            token_query_param: self
                .doc
                .pagination_token_query_param
                .clone()
                .unwrap_or_else(|| "pageToken".to_string()),
            token_response_path: self
                .doc
                .pagination_token_response_path
                .clone()
                .unwrap_or_else(|| "nextPageToken".to_string()),
        };

        let pipeline = formatter::OutputPipeline {
            format: output_format.clone(),
            color_mode: formatter::ColorMode::default(),
        };
        let extra_headers = self.extra_headers_for(method, params_json)?;

        // Custom commands dispatch from inside `run_async`, which is itself
        // driven by a tokio runtime. Naively calling `block_on` from a sync
        // handler panics ("Cannot start a runtime from within a runtime").
        // `block_in_place` parks the current worker so `block_on` is legal.
        tokio::task::block_in_place(|| {
            tokio::runtime::Handle::current().block_on(executor::execute_method(
                &self.doc,
                method,
                params_json,
                body_json,
                &self.auth_provider,
                None,
                None,
                None,
                false,
                &pagination,
                &pipeline,
                false,
                None,
                &self.http_config,
                // TODO(mcp/programmatic): programmatic callers always
                // honor `x-fern-sdk-return-value` (matches typed-SDK
                // semantics). If/when an MCP-tool surface wraps this
                // path and needs to expose `--no-extract` to its
                // clients, plumb a flag through `AppContext::execute`
                // rather than flipping this constant.
                false,
                // Programmatic callers always honor `x-fern-retries`
                // — the debug-only `--no-retry` flag is intentionally
                // a CLI-only surface. If/when an MCP-tool path needs
                // to disable retries for stability/debugging, plumb
                // a flag through `AppContext::execute` rather than
                // flipping this constant.
                false,
                // Same trade-off for `--no-stream`: programmatic callers
                // chaining streaming endpoints almost always want the
                // events emitted as they arrive (stdout printing path);
                // forcing buffered mode here would block the entire
                // response in memory. The CLI surface keeps the
                // streaming default; only the CLI front-end exposes the
                // opt-in buffered toggle.
                false,
                &extra_headers,
            ))
        })
        .map(|_| ())
    }

    /// Invoke an API method and return the parsed JSON response.
    ///
    /// Like [`execute`](Self::execute) but captures the response instead of
    /// printing it, and accepts a `binary_body_path` for operations with a
    /// binary request body (e.g. a multipart file upload). Designed for
    /// custom commands that chain multiple API calls.
    pub fn invoke(
        &self,
        method: &RestMethod,
        params_json: Option<&str>,
        body_json: Option<&str>,
        binary_body_path: Option<&str>,
    ) -> Result<serde_json::Value, CliError> {
        let pagination = executor::PaginationConfig {
            page_all: false,
            page_limit: 10,
            page_delay_ms: 100,
            token_query_param: self
                .doc
                .pagination_token_query_param
                .clone()
                .unwrap_or_else(|| "pageToken".to_string()),
            token_response_path: self
                .doc
                .pagination_token_response_path
                .clone()
                .unwrap_or_else(|| "nextPageToken".to_string()),
        };

        let extra_headers = self.extra_headers_for(method, params_json)?;
        // See note in `execute` — `block_in_place` is required because the
        // handler runs inside the outer tokio runtime.
        let value = tokio::task::block_in_place(|| {
            tokio::runtime::Handle::current().block_on(executor::execute_method(
                &self.doc,
                method,
                params_json,
                body_json,
                &self.auth_provider,
                None,
                None,
                binary_body_path,
                false,
                &pagination,
                &formatter::OutputPipeline::default(),
                true, // capture_output
                None,
                &self.http_config,
                // See TODO in `execute` above — same trade-off applies
                // here: chained custom commands expect the
                // spec-promised subvalue, not the raw envelope.
                false,
                // Programmatic callers always honor `x-fern-retries`
                // (see note in `execute`).
                false,
                // `invoke` captures the response into a `serde_json::Value`
                // for callers that chain multiple API calls. Stream-mode
                // makes no sense here — the executor would have to invent
                // an ordering decision (last event? array of events?)
                // when the caller just wants a typed value back. Force
                // buffered semantics so the captured value mirrors the
                // unary-response shape callers already handle.
                true,
                &extra_headers,
            ))
        })?;

        value.ok_or_else(|| {
            CliError::Other(anyhow::anyhow!(
                "API method returned no value (non-JSON or empty body)"
            ))
        })
    }

    /// Returns a reference to the loaded API spec.
    pub fn spec(&self) -> &RestDescription {
        &self.doc
    }

    /// Returns a reference to the HTTP/TLS configuration for this CLI run.
    ///
    /// Holds the binary name (used to scope `<NAME>_*` env vars) and any
    /// compile-time trust roots. Non-reqwest transports — e.g. the
    /// [`websocket`](crate::websocket) module — call
    /// [`HttpConfig::resolve`](crate::http::HttpConfig::resolve) on this to
    /// build their own TLS connectors while honoring the same env vars
    /// users already configure for the HTTP path.
    ///
    /// Auth credentials are intentionally *not* exposed via `AppContext`:
    /// transports needing a credential value take an
    /// [`AuthCredentialSource`](crate::auth::AuthCredentialSource) directly
    /// at the call site. See `docs/adr/0001-auth-provider-no-cred-extraction.md`.
    pub fn http_config(&self) -> &crate::http::HttpConfig {
        &self.http_config
    }

}

/// Walk a resource (and its sub-resources) for any method that declares
/// `security_requirements`. Used by `build_auth_provider` to feed the
/// per-endpoint flag into `build_provider_with_strategy`.
fn resource_has_per_endpoint_security(resource: &RestResource) -> bool {
    if resource
        .methods
        .values()
        .any(|m| m.security_requirements.is_some())
    {
        return true;
    }
    resource.resources.values().any(resource_has_per_endpoint_security)
}

/// Recursively walks clap ArgMatches to find the leaf method and its matches.
pub fn resolve_method_from_matches<'a>(
    doc: &'a RestDescription,
    matches: &'a clap::ArgMatches,
) -> Result<(&'a RestMethod, &'a clap::ArgMatches), CliError> {
    let mut path: Vec<&str> = Vec::new();
    let mut current_matches = matches;

    while let Some((sub_name, sub_matches)) = current_matches.subcommand() {
        path.push(sub_name);
        current_matches = sub_matches;
    }

    if path.is_empty() {
        return Err(CliError::Validation(
            "No resource or method specified".to_string(),
        ));
    }

    let resource_name = path[0];
    let resource = doc
        .resources
        .get(resource_name)
        .ok_or_else(|| CliError::Validation(format!("Resource '{resource_name}' not found")))?;

    let mut current_resource = resource;

    for &name in &path[1..path.len() - 1] {
        if let Some(sub) = current_resource.resources.get(name) {
            current_resource = sub;
        } else {
            return Err(CliError::Validation(format!(
                "Sub-resource '{name}' not found"
            )));
        }
    }

    let method_name = path[path.len() - 1];

    if let Some(method) = current_resource.methods.get(method_name) {
        return Ok((method, current_matches));
    }

    Err(CliError::Validation(format!(
        "Method '{method_name}' not found on resource. Available methods: {:?}",
        current_resource.methods.keys().collect::<Vec<_>>()
    )))
}

/// Collect individual flag values into a params map.
/// Values from --params JSON override individual flags.
///
/// When a parameter has a `default_value` from `x-fern-default` and
/// the user did not supply the flag, clap surfaces the default as a
/// stringified value. We detect this via `ArgMatches::value_source`
/// and substitute the originally-typed JSON so numbers and booleans
/// keep their wire type — strings pass through unchanged.
///
/// Parameters whose only default comes from the OpenAPI standard
/// `default:` keyword (stored on `documentation_default_value`) do
/// **not** get a clap default, so `get_one` returns `None` and the
/// `let-else continue` below correctly omits them from the outgoing
/// request — the API server applies its own default.
pub(crate) fn collect_params_from_flags(
    matched_args: &clap::ArgMatches,
    method: &crate::openapi::discovery::RestMethod,
    params_override: Option<&str>,
) -> Result<serde_json::Map<String, serde_json::Value>, CliError> {
    let mut params = serde_json::Map::new();

    // Collect values from individual flags. Three extensions interact here:
    //
    // 1. `x-fern-sdk-variable`: variable-bound path params are NOT
    //    registered as per-op flags (see `commands::build_resource_command`);
    //    their value comes from the root-level global flag registered in
    //    `run_async` from `doc.sdk_variables`. clap propagates global args
    //    down to subcommand matches so we look them up by the variable
    //    name on the same `matched_args`. If the global is unset, defer
    //    the validation error until AFTER the `--params` JSON override is
    //    applied below — `--params` is documented as "overrides individual
    //    flags" and must be allowed to act as a fallback here too,
    //    mirroring how plain path params behave when their per-op flag is
    //    absent.
    //
    // 2. `x-fern-default`: when clap surfaced an `x-fern-default` value
    //    (i.e. the user omitted the flag and the parameter had a
    //    `default_value` populated by `x-fern-default`), use the
    //    originally-typed JSON value so numbers/booleans keep their
    //    wire type instead of arriving as strings.
    //
    // 3. `x-fern-enum`: for user-supplied values on (non-variable-bound)
    //    parameters that declare enum aliases, resolve the display
    //    alias back to the wire value so the executor only ever sees
    //    what the server expects.
    let mut missing_variable_bound: Vec<(String, String)> = Vec::new();
    for (param_name, param_def) in &method.parameters {
        if let Some(var_name) = param_def.variable_reference.as_deref() {
            // Global flag ids match the variable name (see `run_async`).
            // clap's `.env(...)` on the global arg already covers the
            // env-var fallback before we get here, so a missing value
            // means neither CLI flag nor env var was provided.
            match matched_args.get_one::<String>(var_name) {
                Some(value) => {
                    params.insert(
                        param_name.clone(),
                        serde_json::Value::String(value.clone()),
                    );
                }
                None => {
                    missing_variable_bound.push((param_name.clone(), var_name.to_string()));
                }
            }
            continue;
        }
        if param_def.repeated {
            if let Some(values) = matched_args.get_many::<String>(param_name) {
                let arr: Vec<serde_json::Value> = values
                    .map(|v| serde_json::Value::String(v.clone()))
                    .collect();
                params.insert(param_name.clone(), serde_json::Value::Array(arr));
            }
            continue;
        }

        let Some(value) = matched_args.get_one::<String>(param_name) else {
            continue;
        };
        let from_default = matched_args.value_source(param_name)
            == Some(clap::parser::ValueSource::DefaultValue);
        let json_value = match (from_default, &param_def.default_value) {
            (true, Some(typed)) => typed.clone(),
            _ => {
                // For object-typed params (e.g. deepObject query parameters),
                // attempt JSON parsing so deepObject serialization receives a
                // Value::Object rather than a string.
                if param_def.param_type.as_deref() == Some("object") {
                    serde_json::from_str(value.as_str())
                        .unwrap_or_else(|_| serde_json::Value::String(value.clone()))
                } else {
                    let wire = param_def
                        .resolve_enum_display_to_wire(value.as_str())
                        .into_owned();
                    serde_json::Value::String(wire)
                }
            }
        };
        params.insert(param_name.clone(), json_value);
    }

    // Override with --params JSON if provided (--params wins).
    if let Some(json_str) = params_override {
        let overrides: serde_json::Map<String, serde_json::Value> =
            serde_json::from_str(json_str)
                .map_err(|e| CliError::Validation(format!("Invalid --params JSON: {e}")))?;
        for (key, value) in overrides {
            params.insert(key, value);
        }
    }

    // Now that --params has had its say, check whether any variable-bound
    // parameter is still unsupplied. Only then emit the validation error
    // naming both the global CLI flag and its env-var fallback.
    for (param_name, var_name) in missing_variable_bound {
        if !params.contains_key(&param_name) {
            let kebab = crate::text::to_kebab_flag(&var_name);
            let env = crate::text::to_screaming_snake(&var_name);
            return Err(CliError::Validation(format!(
                "Missing required SDK variable '{var_name}': provide --{kebab}, \
                 set ${env}, or include it in --params"
            )));
        }
    }

    Ok(params)
}

pub(crate) fn build_pagination_config(
    matches: &clap::ArgMatches,
    doc: &RestDescription,
) -> executor::PaginationConfig {
    executor::PaginationConfig {
        page_all: matches.get_flag("page-all"),
        page_limit: matches
            .get_one::<u32>("page-limit")
            .copied()
            .unwrap_or(10),
        page_delay_ms: matches
            .get_one::<u64>("page-delay")
            .copied()
            .unwrap_or(100),
        token_query_param: doc
            .pagination_token_query_param
            .clone()
            .unwrap_or_else(|| "pageToken".to_string()),
        token_response_path: doc
            .pagination_token_response_path
            .clone()
            .unwrap_or_else(|| "nextPageToken".to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ------------------------------------------------------------------
    // x-fern-global-headers (FER-9864 P2) — registration helpers.
    // ------------------------------------------------------------------

    /// `global_header_flag_name` honors `name:` (kebab-cased) when set,
    /// otherwise falls back to kebab-casing the wire header. This is
    /// the same precedence the upstream Fern importer uses.
    #[test]
    fn test_global_header_flag_name_respects_name_field_then_header() {
        let h_with_name = crate::openapi::discovery::GlobalHeader {
            header: "X-API-Stage".into(),
            name: Some("apiStage".into()),
            optional: false,
            env: None,
            default: None,
        };
        assert_eq!(global_header_flag_name(&h_with_name), "api-stage");

        let h_no_name = crate::openapi::discovery::GlobalHeader {
            header: "X-Tenant-Id".into(),
            name: None,
            optional: false,
            env: None,
            default: None,
        };
        assert_eq!(global_header_flag_name(&h_no_name), "x-tenant-id");
    }

    /// The clap arg ID for a global header must be namespaced so it
    /// can't collide with any per-op parameter HashMap key. The wire
    /// header is preserved verbatim so the executor's lookup against
    /// `RestMethod.parameters` stays straightforward.
    #[test]
    fn test_global_header_arg_id_is_namespaced_by_wire_name() {
        let h = crate::openapi::discovery::GlobalHeader {
            header: "X-API-Stage".into(),
            name: Some("apiStage".into()),
            optional: false,
            env: None,
            default: None,
        };
        assert_eq!(global_header_arg_id(&h), "__global_header::X-API-Stage");
    }

    /// `build_global_header_overrides` errors with a message naming the
    /// flag, env var, and wire-header name when a required header has
    /// no value source. Pins the human-facing error shape required by
    /// the FER-9864 acceptance criteria ("required-without-value
    /// fails"), at the level where the validation actually lives.
    #[test]
    fn test_build_global_header_overrides_errors_when_required_missing() {
        use crate::openapi::discovery::{GlobalHeader, RestDescription, RestMethod};
        use clap::Command;

        let doc = RestDescription {
            global_headers: vec![GlobalHeader {
                header: "X-API-Stage".into(),
                name: Some("apiStage".into()),
                optional: false,
                env: Some("FIXTURE_API_STAGE".into()),
                default: None,
            }],
            ..Default::default()
        };
        let method = RestMethod::default();

        // Use a clap Command with NO defaults bound for the arg —
        // simulating "user passed nothing, env unset, no default".
        let cmd = Command::new("test").arg(
            clap::Arg::new(global_header_arg_id(&doc.global_headers[0]))
                .long(global_header_flag_name(&doc.global_headers[0]))
                .global(true),
        );
        let matches = cmd.try_get_matches_from(["test"]).unwrap();
        let params = serde_json::Map::new();

        let err = build_global_header_overrides(&matches, &doc, &method, &params).unwrap_err();
        let msg = format!("{err}");
        assert!(
            msg.contains("--api-stage"),
            "error should name the CLI flag: {msg}"
        );
        assert!(
            msg.contains("FIXTURE_API_STAGE"),
            "error should name the env var: {msg}"
        );
        assert!(
            msg.contains("X-API-Stage"),
            "error should name the wire header: {msg}"
        );
    }

    /// When the user supplies a per-op header parameter with the same
    /// wire-name as a global header, the per-op value wins and the
    /// global is dropped from the override list. Mirrors the upstream
    /// Fern importer's per-op-wins behavior so operators get a single
    /// override surface for collision cases.
    #[test]
    fn test_build_global_header_overrides_per_op_param_wins() {
        use crate::openapi::discovery::{
            GlobalHeader, MethodParameter, RestDescription, RestMethod,
        };
        use clap::Command;
        use std::collections::HashMap;

        let doc = RestDescription {
            global_headers: vec![GlobalHeader {
                header: "X-API-Stage".into(),
                name: Some("apiStage".into()),
                optional: false,
                env: None,
                default: Some("production".into()),
            }],
            ..Default::default()
        };

        // Per-op method declares `X-API-Stage` as a header parameter.
        let mut parameters: HashMap<String, MethodParameter> = HashMap::new();
        parameters.insert(
            "X-API-Stage".into(),
            MethodParameter {
                location: Some("header".into()),
                ..Default::default()
            },
        );
        let method = RestMethod {
            parameters,
            ..Default::default()
        };

        // Simulate clap matches with the global default applied.
        let cmd = Command::new("test").arg(
            clap::Arg::new(global_header_arg_id(&doc.global_headers[0]))
                .long(global_header_flag_name(&doc.global_headers[0]))
                .default_value("production")
                .global(true),
        );
        let matches = cmd.try_get_matches_from(["test"]).unwrap();

        // The per-op `params` map contains a value for the same wire-name.
        let mut params = serde_json::Map::new();
        params.insert("X-API-Stage".into(), serde_json::json!("canary"));

        let overrides =
            build_global_header_overrides(&matches, &doc, &method, &params).unwrap();
        assert!(
            overrides.is_empty(),
            "per-op param suppresses the global override, got: {overrides:?}",
        );
    }

    #[test]
    fn test_sdk_variable_collides_with_builtin_flags() {
        // Variables whose kebab form matches any built-in per-op flag
        // must be flagged as colliding so the global registration site
        // can skip them with a warning instead of letting clap panic.
        // Cover the names that are most likely to be picked accidentally.
        for builtin in ["params", "format", "dry-run", "base-url", "page-all", "output", "json"] {
            assert!(
                sdk_variable_collides_with_builtin(builtin),
                "expected '{builtin}' to collide with a built-in flag",
            );
        }
        // Plain identifiers and innocuous variable names must NOT collide.
        for ok in ["garden-id", "tenant-id", "page-token", "uuid", "client-id"] {
            assert!(
                !sdk_variable_collides_with_builtin(ok),
                "expected '{ok}' NOT to collide with a built-in flag",
            );
        }
    }

    #[test]
    fn test_cli_app_builder() {
        let app = CliApp::new("test-cli")
            .spec("openapi: 3.0.0\ninfo:\n  title: Test\n  version: '1.0'\npaths: {}")
            .auth_scheme_env("bearer", "TEST_TOKEN");

        assert_eq!(app.name, "test-cli");
        assert_eq!(app.specs.len(), 1);
        assert_eq!(app.auth_bindings.len(), 1);
        assert_eq!(app.auth_bindings[0].0, "bearer");
    }

    #[test]
    fn test_auth_scheme_records_token_binding() {
        let app = CliApp::new("t")
            .spec("openapi: 3.0.0\ninfo:\n  title: T\n  version: '1.0'\npaths: {}")
            .auth_scheme("bearerAuth", AuthCredentialSource::from_env("API_TOKEN"));
        assert_eq!(app.auth_bindings.len(), 1);
        assert_eq!(app.auth_bindings[0].0, "bearerAuth");
        match &app.auth_bindings[0].1 {
            SchemeBinding::Token(_) => {}
            other => panic!("expected Token, got {other:?}"),
        }
    }

    #[test]
    fn test_auth_basic_scheme_records_basic_binding() {
        let app = CliApp::new("t")
            .spec("openapi: 3.0.0\ninfo:\n  title: T\n  version: '1.0'\npaths: {}")
            .auth_basic_scheme(
                "basic",
                AuthCredentialSource::from_env("U"),
                AuthCredentialSource::from_env("P"),
            );
        assert!(matches!(
            app.auth_bindings[0].1,
            SchemeBinding::Basic { .. },
        ));
    }

    #[test]
    fn test_auth_basic_scheme_username_only_records_specialized_binding() {
        let app = CliApp::new("t")
            .spec("openapi: 3.0.0\ninfo:\n  title: T\n  version: '1.0'\npaths: {}")
            .auth_basic_scheme_username_only("basic", AuthCredentialSource::from_env("KEY"));
        assert!(matches!(
            app.auth_bindings[0].1,
            SchemeBinding::BasicUsernameOnly(_),
        ));
    }

    #[test]
    fn test_auth_basic_scheme_password_only_records_specialized_binding() {
        let app = CliApp::new("t")
            .spec("openapi: 3.0.0\ninfo:\n  title: T\n  version: '1.0'\npaths: {}")
            .auth_basic_scheme_password_only("basic", AuthCredentialSource::from_env("KEY"));
        assert!(matches!(
            app.auth_bindings[0].1,
            SchemeBinding::BasicPasswordOnly(_),
        ));
    }

    #[test]
    fn test_cli_app_custom_command() {
        fn handler(
            _matches: &clap::ArgMatches,
            _ctx: &AppContext,
        ) -> Result<(), CliError> {
            Ok(())
        }

        let app = CliApp::new("test")
            .spec("openapi: 3.0.0\ninfo:\n  title: Test\n  version: '1.0'\npaths: {}")
            .command(clap::Command::new("custom"), handler);

        assert_eq!(app.custom_commands.len(), 1);
        assert!(app.custom_commands.entries()[0].0.is_empty());
        assert_eq!(app.custom_commands.entries()[0].1.get_name(), "custom");
    }

    #[test]
    fn test_cli_app_command_under_records_path() {
        fn handler(_m: &clap::ArgMatches, _c: &AppContext) -> Result<(), CliError> { Ok(()) }
        let app = CliApp::new("test")
            .spec("openapi: 3.0.0\ninfo:\n  title: T\n  version: '1.0'\npaths: {}")
            .command_under(&["webhooks"], clap::Command::new("verify"), handler);
        assert_eq!(app.custom_commands.len(), 1);
        assert_eq!(app.custom_commands.entries()[0].0, vec!["webhooks".to_string()]);
        assert_eq!(app.custom_commands.entries()[0].1.get_name(), "verify");
    }

    #[test]
    fn test_resolve_method_from_matches_basic() {
        let mut resources = std::collections::HashMap::new();
        let mut files_res = crate::openapi::discovery::RestResource::default();
        files_res.methods.insert(
            "list".to_string(),
            crate::openapi::discovery::RestMethod {
                id: Some("files.list".to_string()),
                http_method: "GET".to_string(),
                ..Default::default()
            },
        );
        resources.insert("files".to_string(), files_res);

        let doc = RestDescription {
            name: "test".to_string(),
            resources,
            ..Default::default()
        };

        let cmd = clap::Command::new("cli")
            .subcommand(clap::Command::new("files").subcommand(clap::Command::new("list")));

        let matches = cmd.get_matches_from(vec!["cli", "files", "list"]);
        let (method, _) = resolve_method_from_matches(&doc, &matches).unwrap();
        assert_eq!(method.id.as_deref(), Some("files.list"));
    }

    #[test]
    fn test_resolve_method_from_matches_nested() {
        let mut resources = std::collections::HashMap::new();
        let mut files_res = crate::openapi::discovery::RestResource::default();
        let mut permissions_res = crate::openapi::discovery::RestResource::default();
        permissions_res.methods.insert(
            "get".to_string(),
            crate::openapi::discovery::RestMethod {
                id: Some("files.permissions.get".to_string()),
                ..Default::default()
            },
        );
        files_res
            .resources
            .insert("permissions".to_string(), permissions_res);
        resources.insert("files".to_string(), files_res);

        let doc = RestDescription {
            name: "test".to_string(),
            resources,
            ..Default::default()
        };

        let cmd =
            clap::Command::new("cli").subcommand(clap::Command::new("files").subcommand(
                clap::Command::new("permissions").subcommand(clap::Command::new("get")),
            ));

        let matches = cmd.get_matches_from(vec!["cli", "files", "permissions", "get"]);
        let (method, _) = resolve_method_from_matches(&doc, &matches).unwrap();
        assert_eq!(method.id.as_deref(), Some("files.permissions.get"));
    }

    #[test]
    fn test_resolve_method_empty_path() {
        let doc = RestDescription {
            name: "test".to_string(),
            ..Default::default()
        };

        let cmd = clap::Command::new("cli");
        let matches = cmd.get_matches_from(vec!["cli"]);
        let result = resolve_method_from_matches(&doc, &matches);
        assert!(result.is_err());
    }

    /// `AppContext::extra_headers_for` mirrors the built-in command
    /// path: a required global header with no resolved value and no
    /// per-op override fails with a validation error that names both
    /// the CLI flag and the env var. This is the regression test for
    /// the custom-command-handler path that previously dropped the
    /// header silently.
    #[test]
    fn test_app_context_extra_headers_required_missing_errors() {
        use crate::openapi::discovery::{GlobalHeader, RestDescription, RestMethod};

        let doc = RestDescription {
            global_headers: vec![GlobalHeader {
                header: "X-API-Stage".into(),
                name: Some("apiStage".into()),
                optional: false,
                env: Some("FIXTURE_API_STAGE".into()),
                default: None,
            }],
            ..Default::default()
        };
        let ctx = AppContext {
            doc,
            auth_provider: crate::auth::no_auth_provider(),
            http_config: crate::http::HttpConfig::new("test").unwrap(),
            // Note: the custom-command path's filter_map silently
            // dropped this required header. With the fix,
            // extra_headers_for surfaces a validation error.
            global_headers: Vec::new(),
        };
        let method = RestMethod::default();
        let err = ctx.extra_headers_for(&method, None).unwrap_err();
        let msg = format!("{err}");
        assert!(msg.contains("--api-stage"), "should name flag: {msg}");
        assert!(msg.contains("FIXTURE_API_STAGE"), "should name env: {msg}");
        assert!(msg.contains("X-API-Stage"), "should name wire header: {msg}");
    }

    /// A required global header with no resolved value is permitted
    /// when the operation itself declares a same-named header
    /// parameter that the user supplied — the per-op value will be
    /// sent on the wire in place of the global. Mirrors the built-in
    /// command path's per-op-wins behavior.
    #[test]
    fn test_app_context_extra_headers_per_op_param_satisfies_required() {
        use crate::openapi::discovery::{
            GlobalHeader, MethodParameter, RestDescription, RestMethod,
        };
        use std::collections::HashMap;

        let doc = RestDescription {
            global_headers: vec![GlobalHeader {
                header: "X-API-Stage".into(),
                name: Some("apiStage".into()),
                optional: false,
                env: None,
                default: None,
            }],
            ..Default::default()
        };
        let ctx = AppContext {
            doc,
            auth_provider: crate::auth::no_auth_provider(),
            http_config: crate::http::HttpConfig::new("test").unwrap(),
            global_headers: Vec::new(),
        };
        let mut parameters: HashMap<String, MethodParameter> = HashMap::new();
        parameters.insert(
            "X-API-Stage".into(),
            MethodParameter {
                location: Some("header".into()),
                ..Default::default()
            },
        );
        let method = RestMethod {
            parameters,
            ..Default::default()
        };
        let params_json = r#"{"X-API-Stage":"canary"}"#;
        let headers = ctx
            .extra_headers_for(&method, Some(params_json))
            .expect("per-op override should satisfy the required global header");
        assert!(headers.is_empty(), "per-op wins: globals dropped: {headers:?}");
    }

    /// An optional global header with no resolved value is silently
    /// omitted (no error). Pins the negative case so a future
    /// over-strict change to the required-header guard doesn't start
    /// failing optional headers too.
    #[test]
    fn test_app_context_extra_headers_optional_missing_is_ok() {
        use crate::openapi::discovery::{GlobalHeader, RestDescription, RestMethod};

        let doc = RestDescription {
            global_headers: vec![GlobalHeader {
                header: "X-Tenant-Id".into(),
                name: None,
                optional: true,
                env: None,
                default: None,
            }],
            ..Default::default()
        };
        let ctx = AppContext {
            doc,
            auth_provider: crate::auth::no_auth_provider(),
            http_config: crate::http::HttpConfig::new("test").unwrap(),
            global_headers: Vec::new(),
        };
        let method = RestMethod::default();
        let headers = ctx.extra_headers_for(&method, None).expect("optional ok");
        assert!(headers.is_empty(), "optional with no value: {headers:?}");
    }

    /// Multi-spec merge: when two specs declare the same wire-name in
    /// `x-fern-global-headers`, the first write wins and the second is
    /// silently dropped. Mirrors `merge_sdk_variables` and keeps the
    /// resolved flag registry deterministic across spec ordering.
    #[test]
    fn test_merge_global_headers_first_write_wins() {
        use crate::openapi::discovery::GlobalHeader;

        let mut acc = vec![GlobalHeader {
            header: "X-API-Stage".into(),
            name: Some("apiStage".into()),
            optional: false,
            env: Some("FIRST_STAGE".into()),
            default: Some("production".into()),
        }];
        let incoming = vec![
            // Same wire-name → must be dropped, preserving the first env / default.
            GlobalHeader {
                header: "X-API-Stage".into(),
                name: Some("stage".into()),
                optional: true,
                env: Some("SECOND_STAGE".into()),
                default: Some("staging".into()),
            },
            // Distinct wire-name → must be appended.
            GlobalHeader {
                header: "X-Tenant-Id".into(),
                name: None,
                optional: true,
                env: None,
                default: None,
            },
        ];
        merge_global_headers(&mut acc, incoming);
        assert_eq!(acc.len(), 2, "got: {acc:?}");
        assert_eq!(acc[0].header, "X-API-Stage");
        assert_eq!(acc[0].env.as_deref(), Some("FIRST_STAGE"));
        assert_eq!(acc[0].default.as_deref(), Some("production"));
        assert!(!acc[0].optional);
        assert_eq!(acc[1].header, "X-Tenant-Id");
    }

    /// Per-op-override match must be case-insensitive per RFC 7230 §3.2.
    /// A spec that declares `X-API-Stage` globally and `x-api-stage` as a
    /// header param on a single op should treat them as the same header
    /// — the per-op value wins and the global is suppressed (rather than
    /// both landing on the wire).
    #[test]
    fn test_per_op_header_param_override_is_case_insensitive() {
        use crate::openapi::discovery::{GlobalHeader, MethodParameter, RestDescription, RestMethod};
        use std::collections::HashMap;

        let doc = RestDescription {
            global_headers: vec![GlobalHeader {
                header: "X-API-Stage".into(),
                name: Some("apiStage".into()),
                optional: false,
                env: None,
                default: None,
            }],
            ..Default::default()
        };
        // Per-op param uses lowercase wire-name; case-insensitive lookup
        // must still treat this as an override of the global.
        let mut parameters: HashMap<String, MethodParameter> = HashMap::new();
        parameters.insert(
            "x-api-stage".into(),
            MethodParameter {
                location: Some("header".into()),
                ..Default::default()
            },
        );
        let method = RestMethod {
            parameters,
            ..Default::default()
        };
        let ctx = AppContext {
            doc,
            auth_provider: crate::auth::no_auth_provider(),
            http_config: crate::http::HttpConfig::new("test").unwrap(),
            global_headers: Vec::new(),
        };
        // User supplied the per-op param under a third casing — the
        // override should still kick in, satisfying the required check
        // without a CLI flag / env value.
        let headers = ctx
            .extra_headers_for(&method, Some(r#"{"X-Api-Stage": "canary"}"#))
            .expect(
                "per-op override should satisfy required-header check regardless of casing",
            );
        assert!(
            headers.is_empty(),
            "global header must be suppressed when per-op param overrides it: {headers:?}",
        );
    }

    /// `--api-stage ""` (or trimming-only whitespace) must NOT resolve
    /// to `Some("")`. `resolve_global_header_value` trims and treats
    /// empties as "no value supplied", so the required-header guard
    /// fires instead of silently sending an empty `X-API-Stage:` header.
    /// Pins the fix for the self-review finding noted in PR #45.
    #[test]
    fn test_resolve_global_header_value_filters_empty_and_whitespace() {
        use crate::openapi::discovery::GlobalHeader;

        let h = GlobalHeader {
            header: "X-API-Stage".into(),
            name: Some("apiStage".into()),
            optional: false,
            env: None,
            default: None,
        };
        let cmd = clap::Command::new("t").arg(
            clap::Arg::new(global_header_arg_id(&h))
                .long(global_header_flag_name(&h)),
        );
        // Empty string flag value → None.
        let m = cmd.clone().get_matches_from(["t", "--api-stage", ""]);
        assert!(
            resolve_global_header_value(&m, &h).is_none(),
            "empty flag value must resolve to None",
        );
        // Whitespace-only flag value → None.
        let m = cmd.clone().get_matches_from(["t", "--api-stage", "   "]);
        assert!(
            resolve_global_header_value(&m, &h).is_none(),
            "whitespace-only flag value must resolve to None",
        );
        // Normal value → Some(trimmed).
        let m = cmd.get_matches_from(["t", "--api-stage", "  canary  "]);
        assert_eq!(
            resolve_global_header_value(&m, &h).as_deref(),
            Some("canary"),
        );
    }

    /// `compose_root_after_help_sections` joins present sections with
    /// the footer and skips any `None` sections cleanly. Pins the
    /// neither-auth-nor-global-headers regression target raised in PR
    /// #45's self-review.
    #[test]
    fn test_compose_root_after_help_sections_skips_absent() {
        let footer = "Standard env vars: …";
        let g = "Global headers:\n  --api-stage <STAGE>  …";
        let a = "Authentication:\n  bearer  …";

        // Both absent: only the footer.
        assert_eq!(
            compose_root_after_help_sections(None, None, footer),
            footer,
            "no global headers, no auth → only the footer is rendered",
        );
        // Auth only: same as the pre-FER-9864 baseline.
        assert_eq!(
            compose_root_after_help_sections(None, Some(a), footer),
            format!("{a}\n{footer}"),
        );
        // Globals only: no auth section.
        assert_eq!(
            compose_root_after_help_sections(Some(g), None, footer),
            format!("{g}\n{footer}"),
        );
        // Both present: globals first, then auth, then footer.
        assert_eq!(
            compose_root_after_help_sections(Some(g), Some(a), footer),
            format!("{g}\n{a}\n{footer}"),
        );
    }

    #[test]
    fn test_app_context_spec_accessor() {
        let doc = RestDescription {
            name: "test".to_string(),
            ..Default::default()
        };
        let ctx = AppContext {
            doc,
            auth_provider: crate::auth::no_auth_provider(),
            http_config: crate::http::HttpConfig::new("test").unwrap(),
            global_headers: Vec::new(),
        };
        assert_eq!(ctx.spec().name, "test");
    }

    #[test]
    fn test_collect_params_individual_flags() {
        let mut params = std::collections::HashMap::new();
        params.insert(
            "uuid".to_string(),
            crate::openapi::discovery::MethodParameter {
                param_type: Some("string".to_string()),
                location: Some("path".to_string()),
                required: true,
                ..Default::default()
            },
        );

        let method = crate::openapi::discovery::RestMethod {
            parameters: params,
            ..Default::default()
        };

        let cmd = clap::Command::new("test")
            .arg(clap::Arg::new("uuid").long("uuid"))
            .arg(clap::Arg::new("params").long("params"));

        let matches = cmd.get_matches_from(vec!["test", "--uuid", "abc-123"]);
        let result = collect_params_from_flags(&matches, &method, None).unwrap();
        assert_eq!(result.get("uuid").unwrap().as_str().unwrap(), "abc-123");
    }

    #[test]
    fn test_collect_params_override_wins() {
        let mut params = std::collections::HashMap::new();
        params.insert(
            "uuid".to_string(),
            crate::openapi::discovery::MethodParameter::default(),
        );

        let method = crate::openapi::discovery::RestMethod {
            parameters: params,
            ..Default::default()
        };

        let cmd = clap::Command::new("test")
            .arg(clap::Arg::new("uuid").long("uuid"))
            .arg(clap::Arg::new("params").long("params"));

        let matches = cmd.get_matches_from(vec![
            "test",
            "--uuid",
            "from-flag",
            "--params",
            r#"{"uuid":"from-json"}"#,
        ]);
        let override_str = matches.get_one::<String>("params").map(|s| s.as_str());
        let result = collect_params_from_flags(&matches, &method, override_str).unwrap();
        assert_eq!(result.get("uuid").unwrap().as_str().unwrap(), "from-json");
    }

    #[test]
    fn test_collect_params_empty_when_no_flags() {
        let method = crate::openapi::discovery::RestMethod::default();
        let cmd = clap::Command::new("test").arg(clap::Arg::new("params").long("params"));
        let matches = cmd.get_matches_from(vec!["test"]);
        let result = collect_params_from_flags(&matches, &method, None).unwrap();
        assert!(result.is_empty());
    }

    // ------------------------------------------------------------------
    // CliApp::idempotency_header_env — generator-side env-var wiring for
    // FER-9852, implemented in cli-sdk for FER-9864 P1. Verifies the
    // builder overlays env vars on every idempotent operation's
    // synthetic header MethodParameter (and skips non-idempotent
    // siblings).
    // ------------------------------------------------------------------

    const IDEMPOTENCY_SPEC: &str = r#"
openapi: 3.0.2
info:
  title: Idempotency Builder Test
  version: "1.0"
servers:
  - url: https://api.example.com
x-fern-idempotency-headers:
  - header: Idempotency-Key
    name: idempotency_key
paths:
  /payments:
    get:
      x-fern-sdk-group-name: [payments]
      x-fern-sdk-method-name: list
      operationId: payments_list
      responses:
        "200":
          description: ok
    post:
      x-fern-sdk-group-name: [payments]
      x-fern-sdk-method-name: create
      operationId: payments_create
      x-fern-idempotent: true
      responses:
        "201":
          description: ok
"#;

    #[test]
    fn test_idempotency_header_env_matches_by_name() {
        // Generator wires env var by `name` field (kebab/snake form,
        // not the wire header). Should land on the idempotent op's
        // synthetic param.
        let doc = CliApp::new("test")
            .spec(IDEMPOTENCY_SPEC)
            .idempotency_header_env("idempotency_key", "API_IDEMPOTENCY_KEY")
            .build_doc()
            .unwrap();
        let create = &doc.resources["payments"].methods["create"];
        let p = create.parameters.get("Idempotency-Key").unwrap();
        assert_eq!(p.env_var.as_deref(), Some("API_IDEMPOTENCY_KEY"));
    }

    #[test]
    fn test_idempotency_header_env_matches_by_header() {
        // Falls back to the wire header name when `name` isn't matched.
        let doc = CliApp::new("test")
            .spec(IDEMPOTENCY_SPEC)
            .idempotency_header_env("Idempotency-Key", "API_IDEMPOTENCY_KEY")
            .build_doc()
            .unwrap();
        let create = &doc.resources["payments"].methods["create"];
        let p = create.parameters.get("Idempotency-Key").unwrap();
        assert_eq!(p.env_var.as_deref(), Some("API_IDEMPOTENCY_KEY"));
    }

    #[test]
    fn test_idempotency_header_env_skips_non_idempotent_ops() {
        let doc = CliApp::new("test")
            .spec(IDEMPOTENCY_SPEC)
            .idempotency_header_env("idempotency_key", "API_IDEMPOTENCY_KEY")
            .build_doc()
            .unwrap();
        let list = &doc.resources["payments"].methods["list"];
        assert!(!list.idempotent);
        assert!(
            !list.parameters.contains_key("Idempotency-Key"),
            "non-idempotent op must have no idempotency-header param at all",
        );
    }

    fn pagination_cmd() -> clap::Command {
        clap::Command::new("test")
            .arg(
                clap::Arg::new("page-all")
                    .long("page-all")
                    .action(clap::ArgAction::SetTrue),
            )
            .arg(
                clap::Arg::new("page-limit")
                    .long("page-limit")
                    .value_parser(clap::value_parser!(u32)),
            )
            .arg(
                clap::Arg::new("page-delay")
                    .long("page-delay")
                    .value_parser(clap::value_parser!(u64)),
            )
    }

    #[test]
    fn test_build_pagination_config_defaults() {
        let doc = RestDescription::default();
        let matches = pagination_cmd().get_matches_from(vec!["test"]);
        let config = build_pagination_config(&matches, &doc);
        assert!(!config.page_all);
        assert_eq!(config.page_limit, 10);
        assert_eq!(config.page_delay_ms, 100);
        assert_eq!(config.token_query_param, "pageToken");
        assert_eq!(config.token_response_path, "nextPageToken");
    }

    #[test]
    fn test_build_pagination_config_uses_doc_token_names() {
        let doc = RestDescription {
            pagination_token_query_param: Some("cursor".to_string()),
            pagination_token_response_path: Some("meta.next_cursor".to_string()),
            ..Default::default()
        };
        let matches = pagination_cmd().get_matches_from(vec!["test"]);
        let config = build_pagination_config(&matches, &doc);
        assert_eq!(config.token_query_param, "cursor");
        assert_eq!(config.token_response_path, "meta.next_cursor");
    }

    #[test]
    fn test_resolve_method_resource_not_found() {
        let doc = RestDescription::default();
        let cmd =
            clap::Command::new("cli").subcommand(clap::Command::new("unknown"));
        let matches = cmd.get_matches_from(vec!["cli", "unknown"]);
        let err = resolve_method_from_matches(&doc, &matches).unwrap_err();
        assert!(err.to_string().contains("Resource 'unknown' not found"));
    }

    #[test]
    fn test_resolve_method_method_not_found() {
        let mut resources = std::collections::HashMap::new();
        resources.insert("files".to_string(), crate::openapi::discovery::RestResource::default());
        let doc = RestDescription { resources, ..Default::default() };

        let cmd = clap::Command::new("cli")
            .subcommand(clap::Command::new("files").subcommand(clap::Command::new("delete")));
        let matches = cmd.get_matches_from(vec!["cli", "files", "delete"]);
        let err = resolve_method_from_matches(&doc, &matches).unwrap_err();
        assert!(err.to_string().contains("Method 'delete' not found"));
    }

    #[test]
    fn test_resolve_method_sub_resource_not_found() {
        let mut resources = std::collections::HashMap::new();
        resources.insert("files".to_string(), crate::openapi::discovery::RestResource::default());
        let doc = RestDescription { resources, ..Default::default() };

        let cmd = clap::Command::new("cli").subcommand(
            clap::Command::new("files").subcommand(
                clap::Command::new("permissions").subcommand(clap::Command::new("list")),
            ),
        );
        let matches = cmd.get_matches_from(vec!["cli", "files", "permissions", "list"]);
        let err = resolve_method_from_matches(&doc, &matches).unwrap_err();
        assert!(err.to_string().contains("Sub-resource 'permissions' not found"));
    }

    #[test]
    fn test_collect_params_invalid_json_override() {
        let method = crate::openapi::discovery::RestMethod::default();
        let cmd = clap::Command::new("test").arg(clap::Arg::new("params").long("params"));
        let matches = cmd.get_matches_from(vec!["test"]);
        let err =
            collect_params_from_flags(&matches, &method, Some("{not valid json}")).unwrap_err();
        assert!(err.to_string().contains("Invalid --params JSON"));
    }

    #[test]
    fn test_multi_spec_flat_merge() {
        // Two specs with non-overlapping resources should merge
        let spec_a = r#"
openapi: "3.0.0"
info:
  title: "API A"
  version: "1.0"
servers:
  - url: "https://api-a.example.com"
paths:
  /users:
    get:
      x-fern-sdk-group-name: ["users"]
      x-fern-sdk-method-name: list
      responses:
        "200":
          description: ok
"#;
        let spec_b = r#"
openapi: "3.0.0"
info:
  title: "API B"
  version: "1.0"
servers:
  - url: "https://api-b.example.com"
paths:
  /orders:
    get:
      x-fern-sdk-group-name: ["orders"]
      x-fern-sdk-method-name: list
      responses:
        "200":
          description: ok
"#;
        let app = CliApp::new("test").spec(spec_a).spec(spec_b);
        let doc = app.build_doc().unwrap();
        assert!(doc.resources.contains_key("users"));
        assert!(doc.resources.contains_key("orders"));
    }

    #[test]
    fn test_multi_spec_collision_error() {
        let spec = r#"
openapi: "3.0.0"
info:
  title: "API"
  version: "1.0"
paths:
  /users:
    get:
      x-fern-sdk-group-name: ["users"]
      x-fern-sdk-method-name: list
      responses:
        "200":
          description: ok
"#;
        let app = CliApp::new("test").spec(spec).spec(spec);
        let result = app.build_doc();
        assert!(result.is_err());
        let msg = result.unwrap_err().to_string();
        assert!(msg.contains("users"), "error should name the colliding key");
    }

    #[test]
    fn test_title_description_override() {
        let spec = r#"
openapi: "3.0.0"
info:
  title: "Original Title"
  description: "Original description"
  version: "1.0"
paths: {}
"#;
        let app = CliApp::new("test")
            .spec(spec)
            .title("My Custom Title")
            .description("My custom description");
        let doc = app.build_doc().unwrap();
        assert_eq!(doc.title.as_deref(), Some("My Custom Title"));
        assert_eq!(doc.description.as_deref(), Some("My custom description"));
    }

    #[test]
    fn test_spec_under_namespaces_resources() {
        let spec = r#"
openapi: "3.0.0"
info:
  title: "Billing API"
  version: "1.0"
servers:
  - url: "https://billing.example.com"
paths:
  /invoices:
    get:
      x-fern-sdk-group-name: ["invoices"]
      x-fern-sdk-method-name: list
      responses:
        "200":
          description: ok
"#;
        let app = CliApp::new("test").spec_under("billing", spec);
        let doc = app.build_doc().unwrap();
        assert!(doc.resources.contains_key("billing"));
        let billing = doc.resources.get("billing").unwrap();
        assert!(billing.resources.contains_key("invoices"));
    }

    #[test]
    fn test_security_schemes_merge_across_multi_spec() {
        // When two specs each declare `components.securitySchemes`, the
        // merged doc should contain the union. Without merging, the second
        // spec's schemes would silently disappear and the eventual
        // RoutingAuthProvider registry would be missing entries — operations
        // referencing those schemes would fall through to passthrough.
        let spec_a = r#"
openapi: "3.0.0"
info: { title: A, version: "1.0" }
servers: [{ url: "https://a.example.com" }]
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer }
paths:
  /alpha:
    get:
      x-fern-sdk-group-name: ["alpha"]
      x-fern-sdk-method-name: list
      responses: { "200": { description: ok } }
"#;
        let spec_b = r#"
openapi: "3.0.0"
info: { title: B, version: "1.0" }
servers: [{ url: "https://b.example.com" }]
components:
  securitySchemes:
    apiKey: { type: apiKey, in: header, name: X-Api-Key }
paths:
  /beta:
    get:
      x-fern-sdk-group-name: ["beta"]
      x-fern-sdk-method-name: list
      responses: { "200": { description: ok } }
"#;
        let doc = CliApp::new("multi").spec(spec_a).spec(spec_b).build_doc().unwrap();
        // Both schemes from both specs survive the merge.
        assert!(
            doc.security_schemes.contains_key("bearerAuth"),
            "spec A's scheme missing: {:?}",
            doc.security_schemes,
        );
        assert!(
            doc.security_schemes.contains_key("apiKey"),
            "spec B's scheme missing: {:?}",
            doc.security_schemes,
        );
    }

    #[test]
    fn test_merge_security_schemes_first_write_wins() {
        use crate::openapi::discovery::SecurityScheme;
        let mut acc = HashMap::new();
        acc.insert("bearerAuth".to_string(), SecurityScheme::HttpBearer);
        let mut incoming = HashMap::new();
        // Same name, different shape — first write wins, like merge_schemas.
        incoming.insert(
            "bearerAuth".to_string(),
            SecurityScheme::ApiKeyHeader {
                name: "X-Api-Key".to_string(),
            },
        );
        merge_security_schemes(&mut acc, incoming);
        assert_eq!(acc["bearerAuth"], SecurityScheme::HttpBearer);
    }

    #[test]
    fn test_merge_schemas_first_write_wins_on_duplicate() {
        // Multi-spec setups commonly share schema names (`ErrorResponse`,
        // `Pagination`). A strict-error policy makes such setups
        // unworkable; first-write-wins lets specs share without manual
        // de-duplication.
        let mut acc = HashMap::new();
        acc.insert(
            "ErrorResponse".to_string(),
            crate::openapi::discovery::JsonSchema {
                description: Some("first".to_string()),
                ..Default::default()
            },
        );
        let mut incoming = HashMap::new();
        incoming.insert(
            "ErrorResponse".to_string(),
            crate::openapi::discovery::JsonSchema {
                description: Some("second".to_string()),
                ..Default::default()
            },
        );
        merge_schemas(&mut acc, incoming).expect("collision should not error");
        assert_eq!(
            acc["ErrorResponse"].description.as_deref(),
            Some("first"),
            "first write should win"
        );
    }

    #[test]
    fn test_specs_under_batch_helper() {
        // specs_under accepts an iterator of yamls and registers each under
        // the same prefix. Sanity check it actually wires through.
        let s1 = r#"
openapi: "3.0.0"
info: { title: A, version: "1.0" }
servers: [{ url: "https://x.com" }]
paths:
  /alpha:
    get:
      x-fern-sdk-group-name: ["alpha"]
      x-fern-sdk-method-name: list
      responses: { "200": { description: ok } }
"#;
        let s2 = r#"
openapi: "3.0.0"
info: { title: B, version: "1.0" }
servers: [{ url: "https://x.com" }]
paths:
  /beta:
    get:
      x-fern-sdk-group-name: ["beta"]
      x-fern-sdk-method-name: list
      responses: { "200": { description: ok } }
"#;
        let app = CliApp::new("t").specs_under("ns", [s1, s2]);
        let doc = app.build_doc().unwrap();
        let ns = &doc.resources["ns"];
        assert!(ns.resources.contains_key("alpha"));
        assert!(ns.resources.contains_key("beta"));
    }

    #[test]
    fn test_spec_under_accepts_slash_delimited_path() {
        // Slash splits into nested namespaces equivalent to specs_under_named.
        let spec = r#"
openapi: "3.0.0"
info: { title: T, version: "1.0" }
servers: [{ url: "https://x.com" }]
paths:
  /widgets:
    get:
      x-fern-sdk-group-name: ["widgets"]
      x-fern-sdk-method-name: list
      responses: { "200": { description: ok } }
"#;
        let doc = CliApp::new("t")
            .spec_under("v3/products", spec)
            .build_doc()
            .unwrap();
        let v3 = doc.resources.get("v3").expect("v3 namespace");
        let products = v3.resources.get("products").expect("nested products");
        assert!(products.resources.contains_key("widgets"));
    }

    #[test]
    fn test_spec_under_merges_multiple_specs_into_same_prefix() {
        // Two specs sharing a prefix should merge under it (not error).
        // Supports use cases where many specs all need to live under a
        // single namespace (e.g. a versioned `v2` group).
        let spec_a = r#"
openapi: "3.0.0"
info: { title: "A", version: "1.0" }
servers: [{ url: "https://a.example.com" }]
paths:
  /alpha:
    get:
      x-fern-sdk-group-name: ["alpha"]
      x-fern-sdk-method-name: list
      responses: { "200": { description: ok } }
"#;
        let spec_b = r#"
openapi: "3.0.0"
info: { title: "B", version: "1.0" }
servers: [{ url: "https://b.example.com" }]
paths:
  /beta:
    get:
      x-fern-sdk-group-name: ["beta"]
      x-fern-sdk-method-name: list
      responses: { "200": { description: ok } }
"#;
        let app = CliApp::new("test")
            .spec_under("v2", spec_a)
            .spec_under("v2", spec_b);
        let doc = app.build_doc().unwrap();
        let v2 = doc.resources.get("v2").expect("v2 prefix should exist");
        assert!(v2.resources.contains_key("alpha"));
        assert!(v2.resources.contains_key("beta"));
    }

    #[test]
    fn test_spec_under_collides_on_inner_resource() {
        // Two specs with the same inner resource under the same prefix collide.
        let spec = r#"
openapi: "3.0.0"
info: { title: "T", version: "1.0" }
servers: [{ url: "https://x.example.com" }]
paths:
  /things:
    get:
      x-fern-sdk-group-name: ["things"]
      x-fern-sdk-method-name: list
      responses: { "200": { description: ok } }
"#;
        let err = CliApp::new("test")
            .spec_under("v2", spec)
            .spec_under("v2", spec)
            .build_doc()
            .expect_err("inner-key collision should error");
        assert!(err.to_string().contains("things"), "error: {err}");
    }

    #[test]
    fn test_spec_under_hoists_matching_top_level_resource() {
        // When the namespace name matches a top-level resource in the spec,
        // hoist that resource's methods into the namespace itself — so users
        // type `customers get` instead of `customers customers get`.
        let spec = r#"
openapi: "3.0.0"
info: { title: "T", version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /customers:
    get:
      tags: [Customers]
      operationId: getCustomers
      responses: { "200": { description: ok } }
  /customers/{id}/addresses:
    get:
      tags: [Addresses]
      operationId: getAddresses
      responses: { "200": { description: ok } }
"#;
        let app = CliApp::new("t").spec_under("customers", spec);
        let doc = app.build_doc().unwrap();
        let customers = doc.resources.get("customers").expect("namespace exists");
        // Methods from the spec's `customers` resource hoisted into namespace.
        assert!(customers.methods.contains_key("get-customers"));
        // Sibling top-level resources (`addresses`) become children of the namespace.
        assert!(customers.resources.contains_key("addresses"));
        // No double-nested `customers.customers` from the hoist.
        assert!(!customers.resources.contains_key("customers"));
    }

    #[test]
    fn test_specs_under_named_creates_nested_namespaces() {
        let spec_a = r#"
openapi: "3.0.0"
info: { title: "A", version: "1.0" }
servers: [{ url: "https://a.example.com" }]
paths:
  /alpha:
    get:
      x-fern-sdk-group-name: ["alpha"]
      x-fern-sdk-method-name: list
      responses: { "200": { description: ok } }
"#;
        let spec_b = r#"
openapi: "3.0.0"
info: { title: "B", version: "1.0" }
servers: [{ url: "https://b.example.com" }]
paths:
  /beta:
    get:
      x-fern-sdk-group-name: ["beta"]
      x-fern-sdk-method-name: list
      responses: { "200": { description: ok } }
"#;
        let app = CliApp::new("t").specs_under_named(
            "v3",
            [("alpha", spec_a), ("beta", spec_b)],
        );
        let doc = app.build_doc().unwrap();
        let v3 = doc.resources.get("v3").expect("v3 namespace");
        // Both specs nested under their own sub-namespace inside v3 (with hoist).
        assert!(v3.resources.contains_key("alpha"));
        assert!(v3.resources.contains_key("beta"));
        let alpha = &v3.resources["alpha"];
        assert!(alpha.methods.contains_key("list"));
    }

    #[test]
    fn test_substitute_url_vars_replaces_known_and_leaves_unknown() {
        let mut subs = HashMap::new();
        subs.insert("store_hash".to_string(), "abc123".to_string());
        let url = "https://api.example.com/stores/{store_hash}/v3/customers/{customer_id}";
        let out = substitute_url_vars(url, &subs);
        // Known var substituted, unknown left literal so the failure mode is
        // visible in dry-run output and downstream error messages.
        assert_eq!(
            out,
            "https://api.example.com/stores/abc123/v3/customers/{customer_id}"
        );
    }

    #[test]
    fn test_apply_server_var_substitutions_walks_nested_resources() {
        let spec = r#"
openapi: "3.0.0"
info: { title: "T", version: "1.0" }
servers: [{ url: "https://api.example.com/stores/{store_hash}/v3" }]
paths:
  /a/{id}/b:
    get:
      x-fern-sdk-group-name: ["a", "b"]
      x-fern-sdk-method-name: get
      responses: { "200": { description: ok } }
"#;
        let mut doc = CliApp::new("t").spec(spec).build_doc().unwrap();
        let mut subs = HashMap::new();
        subs.insert("store_hash".to_string(), "xyz".to_string());
        apply_server_var_substitutions(&mut doc, &subs);

        let nested_method = doc.resources["a"].resources["b"].methods.get("get").unwrap();
        assert_eq!(nested_method.root_url, "https://api.example.com/stores/xyz/v3");
    }

    #[test]
    fn test_apply_server_var_substitutions_walks_named_servers() {
        // Spec combines `{store_hash}` URL template variables with
        // `x-fern-server-name` named servers. The substitution pass
        // must rewrite the named-server URLs too — otherwise
        // `resolve_named_server_url` reads back an unsubstituted URL
        // and the executor sends the request to a literal
        // `{store_hash}` host.
        let spec = r#"
openapi: "3.0.0"
info: { title: "T", version: "1.0" }
servers:
  - url: "https://api.example.com/stores/{store_hash}/v3"
    x-fern-server-name: Production
  - url: "https://staging.example.com/stores/{store_hash}/v3"
    x-fern-server-name: Staging
paths:
  /uploads:
    post:
      x-fern-sdk-group-name: ["uploads"]
      x-fern-sdk-method-name: create
      servers:
        - url: "https://upload.example.com/stores/{store_hash}/v3"
          x-fern-server-name: Upload
      responses: { "200": { description: ok } }
"#;
        let mut doc = CliApp::new("t").spec(spec).build_doc().unwrap();
        let mut subs = HashMap::new();
        subs.insert("store_hash".to_string(), "abc123".to_string());
        apply_server_var_substitutions(&mut doc, &subs);

        // Top-level named servers are substituted.
        assert_eq!(doc.servers.len(), 2);
        assert_eq!(doc.servers[0].name.as_deref(), Some("Production"));
        assert_eq!(doc.servers[0].url, "https://api.example.com/stores/abc123/v3");
        assert_eq!(doc.servers[1].name.as_deref(), Some("Staging"));
        assert_eq!(doc.servers[1].url, "https://staging.example.com/stores/abc123/v3");

        // Per-operation `servers:` overrides are substituted too.
        let create = doc.resources["uploads"].methods.get("create").unwrap();
        assert_eq!(create.servers.len(), 1);
        assert_eq!(create.servers[0].name.as_deref(), Some("Upload"));
        assert_eq!(
            create.servers[0].url,
            "https://upload.example.com/stores/abc123/v3",
        );
    }

    #[test]
    fn test_spec_under_root_url_on_methods() {
        let spec = r#"
openapi: "3.0.0"
info:
  title: "Billing API"
  version: "1.0"
servers:
  - url: "https://billing.example.com"
paths:
  /invoices:
    get:
      x-fern-sdk-group-name: ["invoices"]
      x-fern-sdk-method-name: list
      responses:
        "200":
          description: ok
"#;
        let app = CliApp::new("test").spec_under("billing", spec);
        let doc = app.build_doc().unwrap();
        let billing = doc.resources.get("billing").unwrap();
        let invoices = billing.resources.get("invoices").unwrap();
        let list = invoices.methods.get("list").unwrap();
        assert_eq!(list.root_url, "https://billing.example.com");
    }

    #[test]
    fn test_per_method_root_url_set_by_openapi_parser() {
        let spec = r#"
openapi: "3.0.0"
info:
  title: "API"
  version: "1.0"
servers:
  - url: "https://myapi.example.com"
paths:
  /things:
    get:
      x-fern-sdk-group-name: ["things"]
      x-fern-sdk-method-name: list
      responses:
        "200":
          description: ok
"#;
        let doc = crate::openapi::load_openapi_spec(spec, "myapi").unwrap();
        let method = doc.resources["things"].methods["list"].clone();
        assert_eq!(method.root_url, "https://myapi.example.com");
    }

    #[test]
    fn test_overlay_applied_before_parsing() {
        let spec = r#"
openapi: "3.0.0"
info:
  title: Plant API
  version: "1.0"
servers:
  - url: https://api.plants.example.com
paths:
  /plants:
    get:
      operationId: list-plants
      summary: List plants
      x-fern-sdk-group-name:
        - plants
      x-fern-sdk-method-name: list
      responses:
        "200":
          description: ok
"#;
        let overlay = r#"
overlay: "1.0.0"
info:
  title: Add description
  version: "1.0"
actions:
  - target: "$.info"
    update:
      description: "A plant management API"
"#;
        let app = CliApp::new("plant-api").spec(spec).overlay(overlay);
        let doc = app.build_doc().unwrap();
        assert_eq!(doc.description, Some("A plant management API".to_string()));
        assert!(doc.resources.contains_key("plants"));
    }

    #[test]
    fn test_overlay_adds_fern_extensions() {
        let spec = r#"
openapi: "3.0.0"
info:
  title: Plant API
  version: "1.0"
servers:
  - url: https://api.plants.example.com
paths:
  /plants:
    get:
      operationId: list-plants
      summary: List plants
      responses:
        "200":
          description: ok
"#;
        // Overlay adds the fern extensions that were missing
        let overlay = r#"
overlay: "1.0.0"
info:
  title: Add fern extensions
  version: "1.0"
actions:
  - target: "$.paths['/plants'].get"
    update:
      x-fern-sdk-group-name:
        - plants
      x-fern-sdk-method-name: list
"#;
        let app = CliApp::new("plant-api").spec(spec).overlay(overlay);
        let doc = app.build_doc().unwrap();
        assert!(doc.resources.contains_key("plants"));
        assert!(doc.resources["plants"].methods.contains_key("list"));
    }

    #[test]
    fn test_multiple_overlays_on_same_spec() {
        let spec = r#"
openapi: "3.0.0"
info:
  title: Plant API
  version: "1.0"
servers:
  - url: https://api.plants.example.com
paths:
  /plants:
    get:
      operationId: list-plants
      summary: List plants
      x-fern-sdk-group-name:
        - plants
      x-fern-sdk-method-name: list
      responses:
        "200":
          description: ok
"#;
        let overlay1 = r#"
overlay: "1.0.0"
info:
  title: Overlay 1
  version: "1.0"
actions:
  - target: "$.info"
    update:
      description: "Plant API v1"
"#;
        let overlay2 = r#"
overlay: "1.0.0"
info:
  title: Overlay 2
  version: "1.0"
actions:
  - target: "$.info"
    update:
      contact:
        name: "Plant Store"
"#;
        let app = CliApp::new("plant-api")
            .spec(spec)
            .overlay(overlay1)
            .overlay(overlay2);
        let doc = app.build_doc().unwrap();
        assert_eq!(doc.description, Some("Plant API v1".to_string()));
        assert!(doc.resources.contains_key("plants"));
    }

    // -----------------------------------------------------------------------
    // Overrides integration tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_spec_with_overrides_applies_fern_extensions() {
        let base = r#"
openapi: "3.0.0"
info: { title: T, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /customers:
    get:
      tags: [Customers]
      operationId: getCustomers
      responses: { "200": { description: ok } }
"#;
        let overrides = r#"
paths:
  /customers:
    get:
      x-fern-sdk-group-name: [customers]
      x-fern-sdk-method-name: list
"#;
        let app = CliApp::new("test").spec_with_overrides(base, overrides);
        let doc = app.build_doc().unwrap();
        let customers = &doc.resources["customers"];
        assert!(
            customers.methods.contains_key("list"),
            "overrides should rename method to 'list', got: {:?}",
            customers.methods.keys().collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_spec_under_with_overrides() {
        let base = r#"
openapi: "3.0.0"
info: { title: T, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /items:
    get:
      tags: [Items]
      operationId: getItems
      responses: { "200": { description: ok } }
"#;
        let overrides = r#"
paths:
  /items:
    get:
      x-fern-sdk-group-name: [items]
      x-fern-sdk-method-name: list
"#;
        let app = CliApp::new("test").spec_under_with_overrides("v3", base, overrides);
        let doc = app.build_doc().unwrap();
        let v3 = &doc.resources["v3"];
        let items = &v3.resources["items"];
        assert!(
            items.methods.contains_key("list"),
            "overrides under prefix should rename method to 'list'"
        );
    }

    #[test]
    fn test_specs_under_named_with_overrides() {
        let spec_a = r#"
openapi: "3.0.0"
info: { title: T, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /orders:
    get:
      tags: [Orders]
      operationId: getOrders
      responses: { "200": { description: ok } }
"#;
        let overrides_a = r#"
paths:
  /orders:
    get:
      x-fern-sdk-group-name: [orders]
      x-fern-sdk-method-name: list
"#;
        let app = CliApp::new("test")
            .specs_under_named_with_overrides("v3", [("orders", spec_a, overrides_a)]);
        let doc = app.build_doc().unwrap();
        let v3 = &doc.resources["v3"];
        // merge_into_path hoists: prefix "v3/orders" + group-name "orders" → v3 > orders > list
        let orders = &v3.resources["orders"];
        assert!(
            orders.methods.contains_key("list"),
            "named overrides should rename method to 'list', got: {:?}",
            orders.methods.keys().collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_spec_without_overrides_unchanged() {
        // Verify that `.spec()` (no overrides) still works identically.
        let yaml = r#"
openapi: "3.0.0"
info: { title: T, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /pets:
    get:
      tags: [Pets]
      operationId: getPets
      responses: { "200": { description: ok } }
"#;
        let app = CliApp::new("test").spec(yaml);
        let doc = app.build_doc().unwrap();
        let pets = &doc.resources["pets"];
        assert!(
            pets.methods.contains_key("get-pets"),
            "without overrides, method name should come from operationId"
        );
    }

    #[test]
    fn test_overrides_null_removes_field() {
        let base = r#"
openapi: "3.0.0"
info:
  title: T
  version: "1.0"
  description: "Remove me"
servers: [{ url: "https://api.example.com" }]
paths:
  /items:
    get:
      tags: [Items]
      operationId: listItems
      summary: "Original summary"
      responses: { "200": { description: ok } }
"#;
        let overrides = r#"
paths:
  /items:
    get:
      summary: null
      x-fern-sdk-group-name: [items]
      x-fern-sdk-method-name: list
"#;
        let app = CliApp::new("test").spec_with_overrides(base, overrides);
        let doc = app.build_doc().unwrap();
        let items = &doc.resources["items"];
        assert!(
            items.methods.contains_key("list"),
            "overrides should rename method even when combined with null deletions"
        );
    }

    /// Array-of-objects merge via overrides: servers array elements are merged
    /// by index (Fern parity), so the override can patch just one field.
    #[test]
    fn test_overrides_array_of_objects_merged_by_index() {
        let base = r#"
openapi: "3.0.0"
info: { title: T, version: "1.0" }
servers:
  - url: "https://api.example.com"
    description: Production
  - url: "https://staging.example.com"
    description: Staging
paths:
  /items:
    get:
      tags: [Items]
      operationId: listItems
      responses: { "200": { description: ok } }
"#;
        let overrides = r#"
servers:
  - url: "https://api-patched.example.com"
"#;
        let app = CliApp::new("test").spec_with_overrides(base, overrides);
        let doc = app.build_doc().unwrap();
        // Server[0] should be merged (url patched, description preserved)
        assert_eq!(doc.root_url, "https://api-patched.example.com");
    }

    /// Primitive array replacement via overrides: tags are primitives so the
    /// override replaces rather than merging by index.
    #[test]
    fn test_overrides_primitive_array_replaced() {
        let base = r#"
openapi: "3.0.0"
info: { title: T, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /items:
    get:
      tags: [OldTag]
      operationId: listItems
      responses: { "200": { description: ok } }
"#;
        let overrides = r#"
paths:
  /items:
    get:
      tags: [NewTag]
      x-fern-sdk-group-name: [items]
      x-fern-sdk-method-name: list
"#;
        let app = CliApp::new("test").spec_with_overrides(base, overrides);
        let doc = app.build_doc().unwrap();
        let items = &doc.resources["items"];
        assert!(
            items.methods.contains_key("list"),
            "overrides with replaced tags should still apply fern extensions"
        );
    }

    /// Sequential overrides: two overrides applied in order.
    #[test]
    fn test_sequential_overrides_chain() {
        use crate::openapi::parser::deep_merge_yaml;

        let base = r#"
openapi: "3.0.0"
info: { title: T, version: "1.0" }
servers: [{ url: "https://api.example.com" }]
paths:
  /a:
    get:
      tags: [A]
      operationId: getA
      responses: { "200": { description: ok } }
  /b:
    get:
      tags: [B]
      operationId: getB
      responses: { "200": { description: ok } }
"#;
        let ovr1 = r#"
paths:
  /a:
    get:
      x-fern-sdk-group-name: [alpha]
      x-fern-sdk-method-name: list
"#;
        let ovr2 = r#"
paths:
  /b:
    get:
      x-fern-sdk-group-name: [beta]
      x-fern-sdk-method-name: list
"#;
        let base_val: serde_yaml::Value = serde_yaml::from_str(base).unwrap();
        let ovr1_val: serde_yaml::Value = serde_yaml::from_str(ovr1).unwrap();
        let ovr2_val: serde_yaml::Value = serde_yaml::from_str(ovr2).unwrap();
        let merged = deep_merge_yaml(deep_merge_yaml(base_val, ovr1_val), ovr2_val);
        let doc = crate::openapi::parser::load_openapi_spec_from_value(merged, "t").unwrap();
        assert!(doc.resources["alpha"].methods.contains_key("list"));
        assert!(doc.resources["beta"].methods.contains_key("list"));
    }
}
