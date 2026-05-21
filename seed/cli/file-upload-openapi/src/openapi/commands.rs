//! CLI Command Builder
//!
//! Builds a dynamic `clap::Command` tree from the internal API representation.

use clap::builder::{PossibleValue, PossibleValuesParser};
use clap::{Arg, Command};

use std::collections::HashMap;

use crate::openapi::discovery::{
    Availability, FernEnumValue, MethodParameter, RestDescription, RestResource, SdkGroupInfo,
};
use crate::text::to_kebab_flag;

/// Filter the document in-place so only operations matching at least
/// one of `active_audiences` survive into the command tree. Mirrors
/// fern-api/fern's OpenAPI importer behavior in
/// `packages/cli/api-importers/openapi/openapi-ir-parser/src/openapi/v3/generateIr.ts:117-143`:
///
/// ```text
/// if (audiences.length > 0
///     && !audiences.some(a => operationAudiences.includes(a))) {
///     continue;
/// }
/// ```
///
/// Semantics, mirroring fern verbatim:
///
/// 1. **No active audience** (`active_audiences` is empty) — every
///    operation survives regardless of its tags.
/// 2. **One or more active audiences** — an operation is kept only if
///    its `audiences` set intersects `active_audiences` (set OR, not
///    AND). Operations with empty `audiences` are dropped, since
///    `[].some(...)` is always false.
/// 3. **Untagged operations are NOT included** when a filter is active —
///    deliberate fern parity (a "no audience" tag is treated as "belongs
///    to no audience", not "belongs to all audiences").
///
/// After the per-operation prune, empty resource groups (no methods,
/// no non-empty children) are collapsed so they don't surface as bare
/// subcommands with no leaves — same approach used by the
/// `x-fern-ignore` pass in `parser.rs::prune_empty_resources`.
pub fn filter_doc_by_audiences(doc: &mut RestDescription, active_audiences: &[String]) {
    if active_audiences.is_empty() {
        return;
    }
    filter_resources_by_audiences(&mut doc.resources, active_audiences);
}

/// Recursive worker for [`filter_doc_by_audiences`]. Drops methods that
/// don't intersect `active`, then recurses into nested resources, then
/// finally prunes resources that ended up empty.
fn filter_resources_by_audiences(
    resources: &mut std::collections::HashMap<String, RestResource>,
    active: &[String],
) {
    resources.retain(|_, resource| {
        resource
            .methods
            .retain(|_, method| method_matches_audiences(&method.audiences, active));
        filter_resources_by_audiences(&mut resource.resources, active);
        !resource.methods.is_empty() || !resource.resources.is_empty()
    });
}

/// Membership check mirroring fern's
/// `audiences.some(a => operationAudiences.includes(a))`. The names are
/// compared as opaque strings (case-sensitive, no normalization) so a
/// preset `audiences(["Public"])` and an operation tagged
/// `x-fern-audiences: [public]` deliberately do NOT match — matching
/// how the upstream importer treats audience names as identifiers.
fn method_matches_audiences(method_audiences: &[String], active: &[String]) -> bool {
    active.iter().any(|a| method_audiences.iter().any(|m| m == a))
}

/// Prepends the availability badge (e.g. `[BETA] `) to `text` when one is
/// present. Falls back to `text` unchanged for generally-available items
/// and items with no availability marker.
fn with_availability_badge(text: &str, availability: Option<Availability>) -> String {
    match availability.and_then(Availability::badge) {
        Some(badge) if text.is_empty() => badge.to_string(),
        Some(badge) => format!("{badge} {text}"),
        None => text.to_string(),
    }
}

/// Names of built-in flags that must not be duplicated by parameter-derived flags.
pub(crate) const BUILTIN_FLAG_NAMES: &[&str] = &[
    "params",
    "output",
    "json",
    "format",
    "dry-run",
    "base-url",
    "page-all",
    "page-limit",
    "page-delay",
    "no-extract",
    "no-retry",
    "no-stream",
    "help",
];

/// The non-auth portion of the `--help` footer. Auth env vars are
/// computed dynamically from bindings by `CliApp::run_async` and
/// prepended via `Command::after_help` — keeping them out of this string
/// avoids stale `{NAME}_API_KEY` boilerplate.
pub fn after_help_footer(binary_name: &str) -> String {
    let prefix = binary_name.to_uppercase().replace('-', "_");
    format!(
        "Environment variables:\n  \
         {prefix}_BASE_URL             Override the API base URL\n  \
         {prefix}_CA_BUNDLE            Path to PEM file with extra trust roots (or SSL_CERT_FILE)\n  \
         {prefix}_INSECURE=1           Skip TLS verification (debugging only)\n  \
         {prefix}_PROXY                HTTP(S) proxy URL\n  \
         {prefix}_TIMEOUT_SECS         Total request timeout\n\n\
         Standard env vars (HTTPS_PROXY / HTTP_PROXY / NO_PROXY / SSL_CERT_FILE) are also honored."
    )
}

/// Builds the full CLI command tree from an API description.
pub fn build_cli(doc: &RestDescription) -> Command {
    let about_text = doc
        .title
        .clone()
        .unwrap_or_else(|| format!("{} CLI", doc.name));
    let after_help = after_help_footer(&doc.name);
    let mut root = Command::new(doc.name.clone())
        .about(about_text)
        .after_help(after_help)
        .term_width(200)
        .subcommand_required(true)
        .arg_required_else_help(true)
        .arg(
            clap::Arg::new("dry-run")
                .long("dry-run")
                .help("Validate the request locally without sending it to the API")
                .action(clap::ArgAction::SetTrue)
                .global(true),
        )
        .arg(
            clap::Arg::new("format")
                .long("format")
                .help("Output format: json (default), table, yaml, csv")
                .value_name("FORMAT")
                .global(true),
        )
        .arg(
            clap::Arg::new("base-url")
                .long("base-url")
                .help("Override the API base URL (e.g. for testing against a mock server)")
                .value_name("URL")
                .global(true),
        );

    // Add resource subcommands
    let mut resource_names: Vec<_> = doc.resources.keys().collect();
    resource_names.sort();
    for name in resource_names {
        let resource = &doc.resources[name];
        if let Some(cmd) = build_resource_command(name, resource, &doc.groups) {
            root = root.subcommand(cmd);
        }
    }

    root
}

/// Resolve the `about()` line for a group's clap subcommand. Returns
/// the `summary` from a matching [`SdkGroupInfo`] entry (sourced from
/// the document-root `x-fern-groups` extension) when present; falls
/// back to the legacy `Operations on '<name>'` label otherwise. The
/// fallback preserves the current default behavior unchanged for any
/// group identifier that doesn't appear in `x-fern-groups`.
pub(crate) fn group_about_text(name: &str, groups: &HashMap<String, SdkGroupInfo>) -> String {
    groups
        .get(name)
        .and_then(|info| info.summary.clone())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| format!("Operations on '{name}'"))
}

/// Resolve the `long_about()` line for a group's clap subcommand from
/// the document-root `x-fern-groups` extension's `description` field.
/// `None` when the group has no entry or the entry omits `description`
/// — clap then falls back to the `about()` text for `--help`.
pub(crate) fn group_long_about_text(
    name: &str,
    groups: &HashMap<String, SdkGroupInfo>,
) -> Option<String> {
    groups
        .get(name)
        .and_then(|info| info.description.clone())
        .filter(|s| !s.is_empty())
}

/// Stringify a parameter's resolved client-side default value for
/// clap's `Arg::default_value`. Strings pass through verbatim; numbers
/// and booleans use their natural lexical form (e.g. `100`, `true`);
/// other JSON shapes (arrays, objects) fall through to compact JSON —
/// but in practice `x-fern-default` only carries scalar literals so the
/// scalar branch is the load-bearing case.
///
/// Returns `None` for `Value::Null` and the `None` input so the caller
/// can skip setting any clap default.
pub(crate) fn default_value_for_clap(value: &Option<serde_json::Value>) -> Option<String> {
    match value.as_ref()? {
        serde_json::Value::Null => None,
        serde_json::Value::String(s) => Some(s.clone()),
        serde_json::Value::Bool(b) => Some(b.to_string()),
        serde_json::Value::Number(n) => Some(n.to_string()),
        other => Some(other.to_string()),
    }
}

/// Format an OpenAPI standard `default:` value as a trailing
/// documentation suffix to append to a flag's help text. Renders as
/// `[default: <value>]` so the user sees the same shape as clap's
/// auto-generated `[default: ...]` for `x-fern-default` — the help
/// surface intentionally does not distinguish client-side defaults
/// (sent on the wire) from server-side defaults (doc-only). The split
/// stays a wire-behavior concern, not a documentation concern.
///
/// Returns the bare scalar rendering with a leading space so callers
/// can concatenate it directly onto `Arg::help`.
pub(crate) fn documentation_default_help_suffix(
    value: &Option<serde_json::Value>,
) -> Option<String> {
    let rendered = match value.as_ref()? {
        serde_json::Value::Null => return None,
        serde_json::Value::String(s) => s.clone(),
        serde_json::Value::Bool(b) => b.to_string(),
        serde_json::Value::Number(n) => n.to_string(),
        other => other.to_string(),
    };
    Some(format!(" [default: {rendered}]"))
}

/// Recursively builds a Command for a resource.
/// Returns None if the resource has no methods or sub-resources.
///
/// `groups` carries the parsed document-root `x-fern-groups` block; when
/// a matching entry exists for `name` it overrides the `about()`/
/// `long_about()` text rendered in `--help`. Unmatched resources retain
/// the legacy `Operations on '<name>'` label and alphabetical placement
/// so adding `x-fern-groups` is strictly additive.
fn build_resource_command(
    name: &str,
    resource: &RestResource,
    groups: &HashMap<String, SdkGroupInfo>,
) -> Option<Command> {
    let mut cmd = Command::new(name.to_string())
        .about(group_about_text(name, groups))
        .subcommand_required(true)
        .arg_required_else_help(true);

    if let Some(long_about) = group_long_about_text(name, groups) {
        cmd = cmd.long_about(long_about);
    }

    let mut has_children = false;

    // Add method subcommands
    let mut method_names: Vec<_> = resource.methods.keys().collect();
    method_names.sort();
    for method_name in method_names {
        let method = &resource.methods[method_name];

        has_children = true;

        let about = crate::text::truncate_description(
            method.description.as_deref().unwrap_or(""),
            crate::text::CLI_DESCRIPTION_LIMIT,
            true,
        );
        let about = with_availability_badge(&about, method.availability);

        let mut method_cmd = Command::new(method_name.to_string())
            .about(about)
            .arg(
                Arg::new("params")
                    .long("params")
                    .help("Additional parameters as JSON (overrides individual flags)")
                    .value_name("JSON"),
            )
            .arg(
                Arg::new("output")
                    .long("output")
                    .short('o')
                    .help("Output file path for binary responses")
                    .value_name("PATH"),
            );

        // Add --json flag for REST request bodies
        if method.request.is_some() {
            method_cmd = method_cmd.arg(
                Arg::new("json")
                    .long("json")
                    .help("JSON request body")
                    .value_name("JSON"),
            );
        }

        // Add a typed flag for operations with a binary request body
        // (e.g. application/octet-stream). The file is streamed as the body
        // with the content type declared in the spec. The flag name comes from
        // `x-fern-parameter-name` on the requestBody, or defaults to `file`
        // for `format: binary` schemas (else `body`).
        //
        // Accepts three forms: <PATH>, @<PATH> (curl-style), or `-` for stdin.
        if let Some(ref binary) = method.binary_request_body {
            method_cmd = method_cmd.arg(
                Arg::new(binary.flag_name.clone())
                    .long(binary.flag_name.clone())
                    .value_name("PATH|@PATH|-")
                    .help(format!(
                        "Body for the request (Content-Type: {}). Accepts:\n  \
                         <PATH>     plain filesystem path\n  \
                         @<PATH>    same path (curl-style prefix)\n  \
                         -          read from stdin (sent chunked)",
                        binary.content_type,
                    )),
            );
        }

        // Pagination flags
        method_cmd = method_cmd
            .arg(
                Arg::new("page-all")
                    .long("page-all")
                    .help("Auto-paginate through all results (NDJSON)")
                    .action(clap::ArgAction::SetTrue),
            )
            .arg(
                Arg::new("page-limit")
                    .long("page-limit")
                    .help("Maximum number of pages to fetch (default: 10)")
                    .value_name("N")
                    .value_parser(clap::value_parser!(u32)),
            )
            .arg(
                Arg::new("page-delay")
                    .long("page-delay")
                    .help("Delay in milliseconds between page fetches (default: 100)")
                    .value_name("MS")
                    .value_parser(clap::value_parser!(u64)),
            )
            .arg(
                Arg::new("no-extract")
                    .long("no-extract")
                    .help(
                        "Disable x-fern-sdk-return-value extraction and print the full response body",
                    )
                    .action(clap::ArgAction::SetTrue),
            )
            .arg(
                Arg::new("no-retry")
                    .long("no-retry")
                    .help(
                        "Disable retries declared by x-fern-retries on this operation, \
                         including network errors. Useful for debugging.",
                    )
                    .action(clap::ArgAction::SetTrue),
            );

        // `--no-stream` is only meaningful on operations with
        // `x-fern-streaming`. Registering it unconditionally would let
        // clap accept it on unrelated ops and silently no-op, which
        // hides spec/runtime mismatches; instead, expose it only where
        // it does something so non-streaming siblings reject the flag
        // up-front.
        if method.streaming.is_some() {
            method_cmd = method_cmd.arg(
                Arg::new("no-stream")
                    .long("no-stream")
                    .help(
                        "Buffer the streaming response and print it as a single value once \
                        complete (handy for piping into another JSON tool)",
                    )
                    .action(clap::ArgAction::SetTrue),
            );
        }

        // Generate individual flags from method parameters
        let mut param_names: Vec<_> = method.parameters.keys().collect();
        param_names.sort();
        for param_name in param_names {
            let param = &method.parameters[param_name];

            // Flag name resolution:
            //   1. `flag_name_override` (set verbatim, no kebab pass) —
            //      populated only by synthetic Fern-extension injections
            //      (currently `inject_idempotency_header_params`). See
            //      `MethodParameter::flag_name_override`.
            //   2. `display_name` from `x-fern-parameter-name` — kebabed.
            //      Renames the CLI flag while keeping `param_name` (the
            //      wire name) as the clap arg ID. Downstream
            //      `collect_params_from_flags` looks values up by arg ID,
            //      and the executor uses the params map key (= wire name)
            //      when serializing the request, so the alias never leaks
            //      onto the wire — only the user-facing flag changes.
            //      Mirrors fern's openapi-ir-parser, which renames the
            //      SDK parameter via `parameterNameOverride` while
            //      preserving the OpenAPI parameter's `name` on the HTTP
            //      request.
            //   3. Fallback: kebab the HashMap key.
            let kebab_name = if let Some(override_flag) = param.flag_name_override.as_deref() {
                override_flag.to_string()
            } else {
                let flag_source = param.display_name.as_deref().unwrap_or(param_name.as_str());
                to_kebab_flag(flag_source)
            };
            if BUILTIN_FLAG_NAMES.contains(&kebab_name.as_str()) {
                continue;
            }

            // Variable-bound path parameters get their value from a
            // root-level global flag (registered in `app::run_async` from
            // `doc.sdk_variables`) plus its env-var fallback. Skipping
            // here keeps the per-operation flag surface clean and matches
            // Fern's openapi-ir-parser, which lowers these into
            // constructor-style globals rather than method arguments.
            if param.variable_reference.is_some() {
                continue;
            }

            let value_name = match param.param_type.as_deref() {
                Some("string") => "STRING",
                Some("integer") => "NUMBER",
                Some("number") => "NUMBER",
                Some("boolean") => "BOOLEAN",
                Some("array") => "JSON_ARRAY",
                Some("object") => "JSON_OBJECT",
                _ => "VALUE",
            };

            let help_text = crate::text::truncate_description(
                param.description.as_deref().unwrap_or(""),
                crate::text::CLI_DESCRIPTION_LIMIT,
                true,
            );
            let help_text = with_availability_badge(&help_text, param.availability);
            // When the flag has been renamed via `x-fern-parameter-name`,
            // surface the original wire name in `--help` so users can
            // still correlate the flag with the API doc / `--params` JSON.
            // (Synthetic `flag_name_override` injections already encode
            // the wire name in their description, so they skip this.)
            let help_text = match param.display_name.as_deref() {
                Some(alias) if param.flag_name_override.is_none() && alias != param_name => {
                    if help_text.is_empty() {
                        format!("(wire name: {param_name})")
                    } else {
                        format!("{help_text} (wire name: {param_name})")
                    }
                }
                _ => help_text,
            };
            // Append the OpenAPI standard `default:` value as a
            // `[default: ...]` suffix when it is the only default
            // source. Same visual shape as clap's auto-rendered
            // `[default: ...]` for `x-fern-default` — the user sees
            // "there is a default" without being told whether the CLI
            // or the server applies it. The CLI itself does not send
            // this value on the wire (only `x-fern-default` populates
            // `default_value` below).
            let help_text = match documentation_default_help_suffix(
                &param.documentation_default_value,
            ) {
                Some(suffix) => format!("{help_text}{suffix}"),
                None => help_text,
            };

            let mut arg = Arg::new(param_name.clone())
                .long(kebab_name)
                .value_name(value_name)
                .help(help_text);

            // Only `x-fern-default` (lowered into `default_value`)
            // becomes a clap default. The standard `default:` keyword
            // is doc-only and handled above via the help-text suffix.
            if let Some(default_str) = default_value_for_clap(&param.default_value) {
                arg = arg.default_value(default_str);
            }

            // Environment-variable fallback (currently populated by the
            // OpenAPI parser for synthetic idempotency-header params from
            // `x-fern-idempotency-headers`, with overrides applied by
            // `CliApp::idempotency_header_env`). Clap reads `.env(...)`
            // when the flag is absent on the command line, giving us the
            // same priority order — flag → env → default — used for auth
            // sources.
            if let Some(ref env_var) = param.env_var {
                arg = arg.env(env_var.clone());
            }

            if let Some(ref enum_values) = param.enum_values {
                arg = arg.value_parser(build_enum_value_parser(enum_values, param));
            }

            if param.repeated {
                arg = arg.action(clap::ArgAction::Append);
            }

            method_cmd = method_cmd.arg(arg);
        }

        cmd = cmd.subcommand(method_cmd);
    }

    // Add sub-resource subcommands (recursive)
    let mut sub_names: Vec<_> = resource.resources.keys().collect();
    sub_names.sort();
    for sub_name in sub_names {
        let sub_resource = &resource.resources[sub_name];
        if let Some(sub_cmd) = build_resource_command(sub_name, sub_resource, groups) {
            has_children = true;
            cmd = cmd.subcommand(sub_cmd);
        }
    }

    if has_children {
        Some(cmd)
    } else {
        None
    }
}

/// Build a `PossibleValuesParser` that respects an optional `x-fern-enum`
/// override. When the parameter has no `fern_enum` map, this is a plain
/// `PossibleValuesParser::new(wire_values)`. When it does, each wire value
/// gets an alias + per-value help string so `--help` renders the display
/// name and description while either the display name or wire value parses
/// successfully on the command line.
fn build_enum_value_parser(
    wire_values: &[String],
    param: &MethodParameter,
) -> PossibleValuesParser {
    let possible: Vec<PossibleValue> = wire_values
        .iter()
        .map(|wire| {
            let cfg = param
                .fern_enum
                .as_ref()
                .and_then(|m| m.get(wire));
            build_possible_value(wire, cfg)
        })
        .collect();
    PossibleValuesParser::from(possible)
}

/// Construct a single `PossibleValue` from a wire value and its optional
/// `x-fern-enum` config. The display name (if set and different from the
/// wire value) becomes the canonical rendered name, with the wire value
/// as a parse-time alias. Descriptions surface as long-help text.
fn build_possible_value(wire: &str, cfg: Option<&FernEnumValue>) -> PossibleValue {
    let display = cfg.and_then(|c| c.display_name.as_deref());
    let mut pv = match display {
        Some(name) if name != wire => PossibleValue::new(name.to_string()).alias(wire.to_string()),
        _ => PossibleValue::new(wire.to_string()),
    };
    if let Some(desc) = cfg.and_then(|c| c.description.as_deref()) {
        pv = pv.help(desc.to_string());
    }
    pv
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::openapi::discovery::{FernEnumValue, MethodParameter, RestMethod, RestResource};
    use std::collections::HashMap;

    fn make_doc() -> RestDescription {
        let mut methods = HashMap::new();
        methods.insert(
            "list".to_string(),
            RestMethod {
                http_method: "GET".to_string(),
                path: "list".to_string(),
                ..Default::default()
            },
        );
        methods.insert(
            "delete".to_string(),
            RestMethod {
                http_method: "DELETE".to_string(),
                path: "delete".to_string(),
                ..Default::default()
            },
        );

        let mut resources = HashMap::new();
        resources.insert(
            "files".to_string(),
            RestResource {
                methods,
                resources: HashMap::new(),
            },
        );

        RestDescription {
            name: "test-cli".to_string(),
            resources,
            ..Default::default()
        }
    }

    #[test]
    fn test_all_commands_always_shown() {
        let doc = make_doc();
        let cmd = build_cli(&doc);

        let files_cmd = cmd
            .find_subcommand("files")
            .expect("files resource missing");

        assert!(files_cmd.find_subcommand("list").is_some());
        assert!(files_cmd.find_subcommand("delete").is_some());
    }

    #[test]
    fn test_root_uses_doc_name() {
        let doc = make_doc();
        let cmd = build_cli(&doc);
        assert_eq!(cmd.get_name(), "test-cli");
    }

    #[test]
    fn test_method_params_become_flags() {
        let mut params = HashMap::new();
        params.insert(
            "uuid".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                description: Some("The user UUID".to_string()),
                location: Some("path".to_string()),
                required: true,
                ..Default::default()
            },
        );
        params.insert(
            "status".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                description: Some("Filter by status".to_string()),
                location: Some("query".to_string()),
                enum_values: Some(vec!["active".to_string(), "inactive".to_string()]),
                ..Default::default()
            },
        );

        let mut methods = HashMap::new();
        methods.insert(
            "get-user".to_string(),
            RestMethod {
                http_method: "GET".to_string(),
                path: "/users/{uuid}".to_string(),
                parameters: params,
                ..Default::default()
            },
        );

        let mut resources = HashMap::new();
        resources.insert(
            "users".to_string(),
            RestResource {
                methods,
                resources: HashMap::new(),
            },
        );

        let doc = RestDescription {
            name: "test-cli".to_string(),
            resources,
            ..Default::default()
        };

        let cmd = build_cli(&doc);
        let users_cmd = cmd.find_subcommand("users").expect("users resource missing");
        let get_user_cmd = users_cmd
            .find_subcommand("get-user")
            .expect("get-user method missing");

        // Verify individual flags exist
        let args: Vec<String> = get_user_cmd
            .get_arguments()
            .map(|a| a.get_id().to_string())
            .collect();
        assert!(args.contains(&"uuid".to_string()), "uuid flag missing");
        assert!(args.contains(&"status".to_string()), "status flag missing");
        assert!(args.contains(&"params".to_string()), "params flag missing");
    }

    #[test]
    fn test_variable_bound_param_skipped_from_per_op_flags() {
        // Path parameters that carry `x-fern-sdk-variable` must NOT appear
        // as per-operation flags. Their value comes from a root-level
        // global flag registered in `app::run_async` from
        // `doc.sdk_variables` (with env-var fallback). Mirrors Fern's
        // openapi-ir-parser semantics: variables are constructor-style
        // globals, not per-method arguments.
        let mut params = HashMap::new();
        params.insert(
            "gardenId".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                description: Some("Garden tenant".to_string()),
                location: Some("path".to_string()),
                required: true,
                variable_reference: Some("gardenId".to_string()),
                ..Default::default()
            },
        );
        // A plain (non-variable-bound) path param on the same op still
        // surfaces as a per-op flag.
        params.insert(
            "zoneId".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                description: Some("Zone id".to_string()),
                location: Some("path".to_string()),
                required: true,
                ..Default::default()
            },
        );

        let mut methods = HashMap::new();
        methods.insert(
            "get".to_string(),
            RestMethod {
                http_method: "GET".to_string(),
                path: "/gardens/{gardenId}/zones/{zoneId}".to_string(),
                parameters: params,
                ..Default::default()
            },
        );
        let mut resources = HashMap::new();
        resources.insert(
            "zones".to_string(),
            RestResource {
                methods,
                resources: HashMap::new(),
            },
        );
        let doc = RestDescription {
            name: "garden-cli".to_string(),
            resources,
            ..Default::default()
        };
        let cmd = build_cli(&doc);
        let zones_cmd = cmd
            .find_subcommand("zones")
            .expect("zones resource missing");
        let get_cmd = zones_cmd
            .find_subcommand("get")
            .expect("zones.get missing");
        let arg_ids: Vec<String> = get_cmd
            .get_arguments()
            .map(|a| a.get_id().to_string())
            .collect();
        assert!(
            !arg_ids.contains(&"gardenId".to_string()),
            "variable-bound path param should NOT be a per-op flag, got: {arg_ids:?}",
        );
        assert!(
            arg_ids.contains(&"zoneId".to_string()),
            "plain path param should still surface as a per-op flag, got: {arg_ids:?}",
        );
    }

    #[test]
    fn test_builtin_flag_names_not_duplicated() {
        let mut params = HashMap::new();
        params.insert(
            "format".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                description: Some("Response format".to_string()),
                ..Default::default()
            },
        );
        params.insert(
            "output".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                description: Some("Output type".to_string()),
                ..Default::default()
            },
        );
        params.insert(
            "real_param".to_string(),
            MethodParameter {
                param_type: Some("string".to_string()),
                description: Some("A real param".to_string()),
                ..Default::default()
            },
        );

        let mut methods = HashMap::new();
        methods.insert(
            "test-method".to_string(),
            RestMethod {
                http_method: "GET".to_string(),
                path: "/test".to_string(),
                parameters: params,
                ..Default::default()
            },
        );

        let mut resources = HashMap::new();
        resources.insert(
            "things".to_string(),
            RestResource {
                methods,
                resources: HashMap::new(),
            },
        );

        let doc = RestDescription {
            name: "test-cli".to_string(),
            resources,
            ..Default::default()
        };

        // This should not panic from duplicate arg names
        let cmd = build_cli(&doc);
        let things_cmd = cmd
            .find_subcommand("things")
            .expect("things resource missing");
        let test_cmd = things_cmd
            .find_subcommand("test-method")
            .expect("test-method missing");

        let args: Vec<String> = test_cmd
            .get_arguments()
            .map(|a| a.get_id().to_string())
            .collect();

        // "format" and "output" should NOT appear as duplicated param flags
        // but "real_param" should be present
        assert!(
            args.contains(&"real_param".to_string()),
            "real_param flag missing"
        );

        // Count occurrences of "format" — should be at most 1 (from the global flag)
        let format_count = args.iter().filter(|a| *a == "format").count();
        assert!(
            format_count <= 1,
            "format flag duplicated: found {format_count}"
        );
    }
    // ------------------------------------------------------------------
    // x-fern-enum → clap PossibleValue wiring
    //
    // These tests target `build_enum_value_parser` directly so the
    // mapping between the `MethodParameter.fern_enum` map and clap's
    // `PossibleValue` (canonical name + alias + help) can't drift.
    // ------------------------------------------------------------------
    fn param_with_fern_enum(
        wire_values: &[&str],
        entries: &[(&str, Option<&str>, Option<&str>)],
    ) -> MethodParameter {
        let mut map = HashMap::new();
        for (wire, name, desc) in entries {
            map.insert(
                (*wire).to_string(),
                FernEnumValue {
                    display_name: name.map(|s| s.to_string()),
                    description: desc.map(|s| s.to_string()),
                },
            );
        }
        MethodParameter {
            param_type: Some("string".to_string()),
            enum_values: Some(wire_values.iter().map(|s| s.to_string()).collect()),
            fern_enum: Some(map),
            ..Default::default()
        }
    }

    /// Drive `build_enum_value_parser` through a real `clap::Command`
    /// `--help` render so the assertions cover what the user sees, not
    /// just internals. Returns the lower-cased help text so substring
    /// matches are case-insensitive.
    fn render_arg_long_help(param: &MethodParameter) -> String {
        let parser = build_enum_value_parser(param.enum_values.as_ref().unwrap(), param);
        let cmd = Command::new("test").arg(
            Arg::new("status")
                .long("status")
                .value_parser(parser)
                .help("Filter by status"),
        );
        let mut buf = Vec::new();
        cmd.clone()
            .write_long_help(&mut buf)
            .expect("clap should render long help");
        String::from_utf8(buf).expect("clap long help is utf-8")
    }

    #[test]
    fn test_build_enum_value_parser_no_fern_enum_uses_wire_values() {
        let param = MethodParameter {
            param_type: Some("string".to_string()),
            enum_values: Some(vec!["a".to_string(), "b".to_string()]),
            ..Default::default()
        };
        let help = render_arg_long_help(&param);
        assert!(
            help.contains("possible values") && help.contains("a") && help.contains("b"),
            "wire values must be listed in long help when no fern_enum is set; got:\n{help}",
        );
    }

    #[test]
    fn test_build_enum_value_parser_renders_display_name_and_per_value_help() {
        let param = param_with_fern_enum(
            &["all", "managed", "external"],
            &[
                ("all", Some("All"), Some("Every user.")),
                (
                    "managed",
                    Some("Managed"),
                    Some("Enterprise-managed users."),
                ),
                ("external", None, Some("External collaborators only.")),
            ],
        );
        let help = render_arg_long_help(&param);

        // Display names are the rendered option labels in long help.
        assert!(
            help.contains("All") && help.contains("Managed"),
            "display names must appear in long help, got:\n{help}",
        );
        // The un-overridden entry still surfaces its wire value.
        assert!(
            help.contains("external"),
            "wire value must appear when no display override is set, got:\n{help}",
        );
        // Per-value descriptions land in long help.
        assert!(
            help.contains("Every user."),
            "missing first description in:\n{help}"
        );
        assert!(
            help.contains("Enterprise-managed users."),
            "missing second description in:\n{help}",
        );
        assert!(
            help.contains("External collaborators only."),
            "missing third description in:\n{help}",
        );
    }

    /// Both the display alias and the wire value must successfully parse
    /// when `display_name` is set — this is the key affordance promised
    /// by `x-fern-enum` for CLI users who only know one of the names.
    #[test]
    fn test_build_enum_value_parser_accepts_both_display_and_wire() {
        let param = param_with_fern_enum(
            &["all", "managed", "external"],
            &[
                ("all", Some("All"), None),
                ("managed", Some("Managed"), None),
            ],
        );
        let parser = build_enum_value_parser(param.enum_values.as_ref().unwrap(), &param);
        let cmd = Command::new("test").arg(Arg::new("status").long("status").value_parser(parser));

        for input in ["All", "all", "Managed", "managed", "external"] {
            let matches = cmd
                .clone()
                .try_get_matches_from(vec!["test", "--status", input])
                .unwrap_or_else(|e| panic!("input `{input}` should parse; got error: {e}"));
            let parsed = matches.get_one::<String>("status").unwrap();
            assert_eq!(
                parsed, input,
                "clap returns the user-typed value verbatim; display->wire mapping happens later",
            );
        }

        // A bogus value still fails — guards against accidentally
        // accepting arbitrary strings when fern_enum is set.
        assert!(
            cmd.clone()
                .try_get_matches_from(vec!["test", "--status", "Bogus"])
                .is_err(),
            "values not in the enum must still be rejected",
        );
    }

    /// `name == wire` is a no-op: clap rejects an alias equal to the
    /// canonical name, so the builder must dedupe instead of crashing.
    /// Build the parser into a `Command` to confirm clap accepts it.
    #[test]
    fn test_build_enum_value_parser_skips_alias_when_display_equals_wire() {
        let param = param_with_fern_enum(
            &["managed"],
            &[("managed", Some("managed"), Some("Same wire & display."))],
        );
        let parser = build_enum_value_parser(param.enum_values.as_ref().unwrap(), &param);
        let cmd = Command::new("test").arg(Arg::new("status").long("status").value_parser(parser));
        let matches = cmd
            .try_get_matches_from(vec!["test", "--status", "managed"])
            .expect("clap should accept a PossibleValue without a self-alias");
        assert_eq!(matches.get_one::<String>("status").unwrap(), "managed");
    }

    #[test]
    fn test_json_help_text_rest_method() {
        use crate::openapi::discovery::SchemaRef;

        // REST method with a request body → --json should describe the request body.
        let mut rest_methods = HashMap::new();
        rest_methods.insert(
            "create".to_string(),
            RestMethod {
                http_method: "POST".to_string(),
                path: "/things".to_string(),
                request: Some(SchemaRef {
                    schema_ref: Some("Thing".to_string()),
                    parameter_name: None,
                }),
                ..Default::default()
            },
        );
        let mut rest_resources = HashMap::new();
        rest_resources.insert(
            "things".to_string(),
            RestResource {
                methods: rest_methods,
                resources: HashMap::new(),
            },
        );
        let rest_doc = RestDescription {
            name: "rest-cli".to_string(),
            resources: rest_resources,
            ..Default::default()
        };
        let rest_cmd = build_cli(&rest_doc);
        let rest_json = rest_cmd
            .find_subcommand("things")
            .and_then(|c| c.find_subcommand("create"))
            .and_then(|c| c.get_arguments().find(|a| a.get_id() == "json"))
            .expect("REST --json arg missing");
        let rest_help = rest_json
            .get_help()
            .map(|s| s.to_string())
            .unwrap_or_default();
        assert!(
            rest_help.contains("request body"),
            "REST --json help should describe the request body, got: {rest_help}",
        );
    }

    // ------------------------------------------------------------------
    // filter_doc_by_audiences — fern parity
    // ------------------------------------------------------------------

    /// Build a doc with four operations covering every audience-tag
    /// shape used by the fixture spec: one tagged, one with a
    /// distinct tag, one untagged, and one multi-tagged. Used by all
    /// `filter_doc_by_audiences` tests below.
    fn doc_with_audiences() -> RestDescription {
        let mut methods = HashMap::new();
        methods.insert(
            "public-only".to_string(),
            RestMethod {
                http_method: "GET".to_string(),
                path: "/p".to_string(),
                audiences: vec!["public".to_string()],
                ..Default::default()
            },
        );
        methods.insert(
            "internal-only".to_string(),
            RestMethod {
                http_method: "GET".to_string(),
                path: "/i".to_string(),
                audiences: vec!["internal".to_string()],
                ..Default::default()
            },
        );
        methods.insert(
            "untagged".to_string(),
            RestMethod {
                http_method: "GET".to_string(),
                path: "/u".to_string(),
                audiences: vec![],
                ..Default::default()
            },
        );
        methods.insert(
            "multi-tagged".to_string(),
            RestMethod {
                http_method: "GET".to_string(),
                path: "/m".to_string(),
                audiences: vec!["public".to_string(), "internal".to_string()],
                ..Default::default()
            },
        );
        let mut resources = HashMap::new();
        resources.insert(
            "audiences".to_string(),
            RestResource {
                methods,
                resources: HashMap::new(),
            },
        );
        RestDescription {
            name: "fixture".to_string(),
            resources,
            ..Default::default()
        }
    }

    fn method_names(doc: &RestDescription, group: &str) -> Vec<String> {
        let mut names: Vec<String> = doc
            .resources
            .get(group)
            .map(|r| r.methods.keys().cloned().collect())
            .unwrap_or_default();
        names.sort();
        names
    }

    /// Empty audience filter is a no-op. Mirrors fern's
    /// `audiences.length > 0 && ...` guard in
    /// `openapi-ir-parser/generateIr.ts:141` — when no audiences are
    /// active, every operation passes through.
    #[test]
    fn test_filter_doc_by_audiences_empty_is_noop() {
        let mut doc = doc_with_audiences();
        filter_doc_by_audiences(&mut doc, &[]);
        assert_eq!(
            method_names(&doc, "audiences"),
            vec!["internal-only", "multi-tagged", "public-only", "untagged"],
        );
    }

    /// Single audience keeps only operations whose `x-fern-audiences`
    /// contains that tag. Untagged operations are dropped — matches
    /// fern's `operationAudiences.includes(...)` over an empty array
    /// always evaluating false.
    #[test]
    fn test_filter_doc_by_audiences_single_keeps_matching_only() {
        let mut doc = doc_with_audiences();
        filter_doc_by_audiences(&mut doc, &["public".to_string()]);
        assert_eq!(
            method_names(&doc, "audiences"),
            vec!["multi-tagged", "public-only"],
        );
    }

    /// Multiple active audiences union the matches (OR, not AND).
    /// Mirrors fern's `audiences.some(a => operationAudiences.includes(a))`:
    /// any one match keeps the operation.
    #[test]
    fn test_filter_doc_by_audiences_multiple_unions_matches() {
        let mut doc = doc_with_audiences();
        filter_doc_by_audiences(
            &mut doc,
            &["public".to_string(), "internal".to_string()],
        );
        assert_eq!(
            method_names(&doc, "audiences"),
            vec!["internal-only", "multi-tagged", "public-only"],
        );
    }

    /// An audience that no operation declares prunes every operation
    /// and then collapses the now-empty resource group. Matches fern's
    /// behavior: a preset audience with no matches in the spec yields
    /// an empty IR.
    #[test]
    fn test_filter_doc_by_audiences_nonexistent_prunes_empty_resources() {
        let mut doc = doc_with_audiences();
        filter_doc_by_audiences(&mut doc, &["nonexistent".to_string()]);
        assert!(
            doc.resources.is_empty(),
            "filtering all ops out of a group should also prune the empty group itself: \
             {:?}",
            doc.resources
        );
    }

    /// Audience names are compared as opaque strings — case sensitive,
    /// no normalization — to match fern's treatment of audience tags
    /// as identifiers. `Public` and `public` do NOT match.
    #[test]
    fn test_filter_doc_by_audiences_is_case_sensitive() {
        let mut doc = doc_with_audiences();
        filter_doc_by_audiences(&mut doc, &["Public".to_string()]);
        assert!(
            doc.resources.is_empty(),
            "case-mismatched audience should match nothing"
        );
    }

    /// Nested resources are walked recursively, and an outer resource
    /// with only an empty child is itself collapsed. Guards against the
    /// recursive prune accidentally leaving orphan parent groups in the
    /// command tree.
    #[test]
    fn test_filter_doc_by_audiences_recurses_into_nested_resources() {
        let mut inner_methods = HashMap::new();
        inner_methods.insert(
            "ping".to_string(),
            RestMethod {
                http_method: "GET".to_string(),
                path: "/p".to_string(),
                audiences: vec!["public".to_string()],
                ..Default::default()
            },
        );
        let mut inner_resources = HashMap::new();
        inner_resources.insert(
            "v2".to_string(),
            RestResource {
                methods: inner_methods,
                resources: HashMap::new(),
            },
        );
        let outer = RestResource {
            methods: HashMap::new(),
            resources: inner_resources,
        };
        let mut resources = HashMap::new();
        resources.insert("audiences".to_string(), outer);
        let mut doc = RestDescription {
            name: "fixture".to_string(),
            resources,
            ..Default::default()
        };

        filter_doc_by_audiences(&mut doc, &["public".to_string()]);
        let nested = &doc.resources["audiences"].resources["v2"];
        assert!(nested.methods.contains_key("ping"));

        filter_doc_by_audiences(&mut doc, &["nonexistent".to_string()]);
        assert!(
            doc.resources.is_empty(),
            "nested empty groups should propagate up and prune the outer"
        );
    }

    // ------------------------------------------------------------------
    // x-fern-groups (FER-9864 P3): document-root metadata that
    // re-labels `x-fern-sdk-group-name` group subcommands for the
    // help surface. No tree restructuring; the `--help` `about` /
    // `long_about` lines for the group's clap Command change when a
    // matching entry exists, otherwise the legacy `Operations on
    // '<name>'` fallback applies (preserving prior behavior).
    // ------------------------------------------------------------------

    fn make_doc_with_things_resource() -> RestDescription {
        let mut methods = HashMap::new();
        methods.insert(
            "list".to_string(),
            RestMethod {
                http_method: "GET".to_string(),
                path: "/things".to_string(),
                ..Default::default()
            },
        );
        let mut resources = HashMap::new();
        resources.insert(
            "things".to_string(),
            RestResource {
                methods,
                resources: HashMap::new(),
            },
        );
        RestDescription {
            name: "test-cli".to_string(),
            resources,
            ..Default::default()
        }
    }

    /// Precondition for the rest of the suite: without `x-fern-groups`
    /// metadata, the group's clap Command uses the legacy
    /// `Operations on '<name>'` about text. This is the fallback the
    /// "missing metadata" integration case verifies end-to-end.
    #[test]
    fn test_group_about_falls_back_to_legacy_label_when_no_metadata() {
        let doc = make_doc_with_things_resource();
        let cmd = build_cli(&doc);
        let things = cmd
            .find_subcommand("things")
            .expect("things subcommand missing");
        assert_eq!(
            things.get_about().map(|s| s.to_string()).unwrap_or_default(),
            "Operations on 'things'",
        );
        assert!(things.get_long_about().is_none());
    }

    /// A matching `x-fern-groups` entry with `summary` overrides the
    /// fallback `Operations on '<name>'` label on the clap `about()`
    /// line. The `summary` text surfaces in both the parent's command
    /// table (next to the subcommand name) and in `--help` for the
    /// group itself.
    #[test]
    fn test_group_summary_overrides_about_text() {
        let mut doc = make_doc_with_things_resource();
        doc.groups.insert(
            "things".to_string(),
            SdkGroupInfo {
                summary: Some("Things Operations".to_string()),
                description: None,
            },
        );
        let cmd = build_cli(&doc);
        let things = cmd
            .find_subcommand("things")
            .expect("things subcommand missing");
        assert_eq!(
            things.get_about().map(|s| s.to_string()).unwrap_or_default(),
            "Things Operations",
        );
        // No `description` → no long_about override; clap will fall
        // back to `about` for `--help`.
        assert!(things.get_long_about().is_none());
    }

    /// `description` populates `long_about()` so `--help` shows the
    /// detailed prose for the group. Setting `description` alone
    /// (without `summary`) keeps the legacy short label — fern's IR
    /// allows either field to be present without the other and we
    /// preserve that asymmetry.
    #[test]
    fn test_group_description_sets_long_about_only() {
        let mut doc = make_doc_with_things_resource();
        doc.groups.insert(
            "things".to_string(),
            SdkGroupInfo {
                summary: None,
                description: Some("Long-form prose about things.".to_string()),
            },
        );
        let cmd = build_cli(&doc);
        let things = cmd
            .find_subcommand("things")
            .expect("things subcommand missing");
        assert_eq!(
            things.get_about().map(|s| s.to_string()).unwrap_or_default(),
            "Operations on 'things'",
        );
        assert_eq!(
            things
                .get_long_about()
                .map(|s| s.to_string())
                .unwrap_or_default(),
            "Long-form prose about things.",
        );
    }

    /// Both fields set: `summary` becomes `about`, `description`
    /// becomes `long_about`. This is the canonical case the
    /// integration test exercises against `--help`.
    #[test]
    fn test_group_summary_and_description_populate_both_about_fields() {
        let mut doc = make_doc_with_things_resource();
        doc.groups.insert(
            "things".to_string(),
            SdkGroupInfo {
                summary: Some("Things Operations".to_string()),
                description: Some("Long-form prose about things.".to_string()),
            },
        );
        let cmd = build_cli(&doc);
        let things = cmd
            .find_subcommand("things")
            .expect("things subcommand missing");
        assert_eq!(
            things.get_about().map(|s| s.to_string()).unwrap_or_default(),
            "Things Operations",
        );
        assert_eq!(
            things
                .get_long_about()
                .map(|s| s.to_string())
                .unwrap_or_default(),
            "Long-form prose about things.",
        );
    }

    /// Integration case (a) — matched group: spec carries
    /// `x-fern-groups: { foo: { summary: "Foo Operations" } }`, two
    /// operations are tagged `x-fern-sdk-group-name: foo`, and one is
    /// untagged. Verifies the `foo` subcommand's `about()` line is
    /// `Foo Operations` (driven by `summary`) and that the untagged
    /// op lands on its tag-derived sibling group with the legacy
    /// fallback label.
    ///
    /// Drives the parser end-to-end so the full path
    /// (YAML → `OpenApiSpec` → `RestDescription` → `Command`) is
    /// covered.
    #[test]
    fn test_x_fern_groups_summary_drives_about_for_matched_group() {
        let yaml = r#"
openapi: 3.0.2
info:
  title: t
  version: "1"
servers:
  - url: https://api.example.com
x-fern-groups:
  foo:
    summary: Foo Operations
    description: Operations on foo resources.
paths:
  /foo/list:
    get:
      x-fern-sdk-group-name: [foo]
      x-fern-sdk-method-name: list
      operationId: foo_list
      responses:
        "200": { description: ok }
  /foo/create:
    post:
      x-fern-sdk-group-name: [foo]
      x-fern-sdk-method-name: create
      operationId: foo_create
      responses:
        "200": { description: ok }
  /misc:
    get:
      tags: [Misc]
      x-fern-sdk-method-name: list
      operationId: misc_list
      responses:
        "200": { description: ok }
"#;
        let doc = crate::openapi::load_openapi_spec(yaml, "test-cli").unwrap();
        let cmd = build_cli(&doc);

        // Matched group: `summary` wins over the legacy fallback.
        let foo = cmd
            .find_subcommand("foo")
            .expect("foo subcommand should exist");
        assert_eq!(
            foo.get_about().map(|s| s.to_string()).unwrap_or_default(),
            "Foo Operations",
        );
        assert_eq!(
            foo.get_long_about().map(|s| s.to_string()).unwrap_or_default(),
            "Operations on foo resources.",
        );
        // Group children are still present — `x-fern-groups` does not
        // restructure the clap tree.
        assert!(foo.find_subcommand("list").is_some());
        assert!(foo.find_subcommand("create").is_some());
    }

    /// Integration case (b) — missing-metadata fallback: an operation
    /// carries `x-fern-sdk-group-name: [bar]` but the spec has no
    /// matching `x-fern-groups: bar` entry. The CLI must build
    /// without error and the `bar` subcommand keeps the legacy
    /// `Operations on 'bar'` about line. Verifies no crash and clean
    /// fallback when only one side of the pair is present.
    #[test]
    fn test_x_fern_groups_missing_entry_falls_back_to_default_label() {
        let yaml = r#"
openapi: 3.0.2
info:
  title: t
  version: "1"
servers:
  - url: https://api.example.com
paths:
  /bar/list:
    get:
      x-fern-sdk-group-name: [bar]
      x-fern-sdk-method-name: list
      operationId: bar_list
      responses:
        "200": { description: ok }
"#;
        let doc = crate::openapi::load_openapi_spec(yaml, "test-cli").unwrap();
        assert!(
            doc.groups.is_empty(),
            "no x-fern-groups → groups map should be empty",
        );
        let cmd = build_cli(&doc);
        let bar = cmd
            .find_subcommand("bar")
            .expect("bar subcommand should exist");
        assert_eq!(
            bar.get_about().map(|s| s.to_string()).unwrap_or_default(),
            "Operations on 'bar'",
        );
        assert!(bar.get_long_about().is_none());
        assert!(bar.find_subcommand("list").is_some());
    }

    /// `x-fern-groups` is purely metadata for rendering — adding it
    /// must NOT change which subcommands exist, their nesting, or
    /// their leaf method commands. This guards the hard constraint
    /// that the clap tree structure stays untouched.
    #[test]
    fn test_x_fern_groups_does_not_restructure_clap_tree() {
        let yaml_without = r#"
openapi: 3.0.2
info:
  title: t
  version: "1"
servers:
  - url: https://api.example.com
paths:
  /foo/list:
    get:
      x-fern-sdk-group-name: [foo]
      x-fern-sdk-method-name: list
      operationId: foo_list
      responses:
        "200": { description: ok }
"#;
        let yaml_with = r#"
openapi: 3.0.2
info:
  title: t
  version: "1"
servers:
  - url: https://api.example.com
x-fern-groups:
  foo:
    summary: Foo Operations
paths:
  /foo/list:
    get:
      x-fern-sdk-group-name: [foo]
      x-fern-sdk-method-name: list
      operationId: foo_list
      responses:
        "200": { description: ok }
"#;
        let collect_tree = |yaml: &str| -> Vec<String> {
            let doc = crate::openapi::load_openapi_spec(yaml, "test-cli").unwrap();
            let cmd = build_cli(&doc);
            let mut out = Vec::new();
            for sub in cmd.get_subcommands() {
                for leaf in sub.get_subcommands() {
                    out.push(format!("{}.{}", sub.get_name(), leaf.get_name()));
                }
            }
            out.sort();
            out
        };
        assert_eq!(collect_tree(yaml_without), collect_tree(yaml_with));
    }
}
