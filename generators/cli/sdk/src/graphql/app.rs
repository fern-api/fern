//! High-level API for building CLIs from GraphQL schemas.
//!
//! [`CliApp`] provides a builder-style API that lets consumers create a
//! fully-functional CLI in just a few lines. [`AppContext`] exposes the
//! loaded spec and executor so that custom command handlers can call the
//! API programmatically.

use crate::auth::{AuthCredentialSource, AuthStrategy, DynAuthProvider, SchemeBinding};
use crate::cli_args;
use crate::custom_commands::CustomCommandRegistry;
use crate::error::{print_error_json, CliError};
use crate::formatter;
use crate::graphql::commands;
use crate::graphql::discovery::{GraphQLSchema as RestDescription, GraphQLOperation as RestMethod};
use crate::graphql::executor;

/// A custom command handler function.
///
/// Receives the parsed [`clap::ArgMatches`] for the subcommand and an
/// [`AppContext`] that provides access to the spec, auth token, and
/// executor.
pub type HandlerFn = crate::custom_commands::HandlerFn<AppContext>;

/// Builder for a schema-driven CLI application (GraphQL).
pub struct CliApp {
    pub(crate) name: String,
    pub(crate) spec_json: Option<String>,
    pub(crate) endpoint_url: Option<String>,
    /// Auth bindings; mirrors the OpenAPI variant. GraphQL introspection
    /// JSON doesn't carry per-operation security metadata, so the
    /// constructed provider is `Any` by default — generators can flip
    /// [`auth_strategy`](Self::auth_strategy) to `All` for APIs that
    /// require multiple schemes simultaneously.
    auth_bindings: Vec<(String, SchemeBinding)>,
    auth_strategy: AuthStrategy,
    /// Trust roots parsed at builder-call time. Storing parsed certs (not
    /// raw bytes) means the validation error message lives in one place
    /// — at the call site of `extra_root_cert`, where it's most useful.
    extra_root_certs: Vec<reqwest::Certificate>,
    /// Raw PEM bytes for each trust root added via `extra_root_cert`, kept
    /// alongside the parsed `extra_root_certs` above. Threaded through to
    /// `HttpConfig::with_parsed_root_certs` so transport-neutral callers
    /// (`HttpConfig::resolve`) can hand PEM to non-reqwest TLS connectors.
    extra_root_certs_pem: Vec<Vec<u8>>,
    pub(crate) custom_commands: CustomCommandRegistry<AppContext>,
}

impl CliApp {
    /// Create a new CLI application with the given binary name.
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            spec_json: None,
            endpoint_url: None,
            auth_bindings: Vec::new(),
            auth_strategy: AuthStrategy::Auto,
            extra_root_certs: Vec::new(),
            extra_root_certs_pem: Vec::new(),
            custom_commands: CustomCommandRegistry::new(),
        }
    }

    /// Set the GraphQL introspection JSON schema string. Typically used with `include_str!`.
    pub fn spec(mut self, json: &str) -> Self {
        self.spec_json = Some(json.to_string());
        self
    }

    /// Set the GraphQL endpoint URL.
    pub fn endpoint(mut self, url: &str) -> Self {
        self.endpoint_url = Some(url.to_string());
        self
    }

    /// Shorthand for `auth_scheme(name, AuthCredentialSource::from_env(env))`.
    pub fn auth_scheme_env(self, scheme_name: &str, env_var: &str) -> Self {
        self.auth_scheme(scheme_name, AuthCredentialSource::from_env(env_var))
    }

    /// Shorthand for `auth_scheme(name, AuthCredentialSource::cli(arg_name))`.
    /// Auto-registers a global `--<arg_name>` flag at run time.
    pub fn auth_scheme_cli(self, scheme_name: &str, arg_name: &str) -> Self {
        self.auth_scheme(scheme_name, AuthCredentialSource::cli(arg_name))
    }

    /// Shorthand for `auth_scheme(name, AuthCredentialSource::file(path))`.
    pub fn auth_scheme_file(self, scheme_name: &str, path: impl AsRef<std::path::Path>) -> Self {
        self.auth_scheme(scheme_name, AuthCredentialSource::file(path))
    }

    /// Bind a credential source to a named auth scheme. See
    /// [`crate::openapi::CliApp::auth_scheme`] for the OpenAPI version's
    /// detailed semantics — the GraphQL variant differs only in that there
    /// is no spec-declared scheme metadata, so single-value bindings always
    /// produce an `Authorization: Bearer <value>` provider.
    pub fn auth_scheme(mut self, scheme_name: &str, source: AuthCredentialSource) -> Self {
        self.auth_bindings
            .push((scheme_name.to_string(), SchemeBinding::Token(source)));
        self
    }

    /// Bind separate username and password sources to a basic-auth scheme.
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

    /// Username-only basic auth (password sent as `""`). See
    /// [`OpenApiCliApp::auth_basic_scheme_username_only`][a] for rationale.
    ///
    /// [a]: crate::openapi::CliApp::auth_basic_scheme_username_only
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

    /// Password-only basic auth (username sent as `""`). See
    /// [`OpenApiCliApp::auth_basic_scheme_password_only`][a] for rationale.
    ///
    /// [a]: crate::openapi::CliApp::auth_basic_scheme_password_only
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
    /// a scheme name. Wraps the provider in [`Arc`] internally; use
    /// [`auth_provider_shared`](Self::auth_provider_shared) if you already
    /// have a `DynAuthProvider`.
    pub fn auth_provider<P>(self, scheme_name: &str, provider: P) -> Self
    where
        P: crate::auth::AuthProvider + 'static,
    {
        self.auth_provider_shared(scheme_name, std::sync::Arc::new(provider))
    }

    /// Variant of [`auth_provider`](Self::auth_provider) that takes an
    /// already-built [`DynAuthProvider`].
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

    /// Pin how the bound auth schemes compose. See
    /// [`crate::openapi::CliApp::auth_strategy`] for details. GraphQL has
    /// no per-endpoint security metadata, so [`AuthStrategy::Routing`]
    /// degenerates to `Any` here.
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
    /// commands.
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
    /// path (e.g. from the GraphQL schema), it is **replaced** by `cmd` —
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
    ///     .spec(include_str!("schema.json"))
    ///     .endpoint("https://internal.example.com/graphql")
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

    /// Build the full CLI command tree including spec-derived subcommands,
    /// custom commands, `completion`, `man`, and auth-bound global flags.
    ///
    /// Called from the `wants_completion` / `wants_man` early-intercept
    /// blocks AND the normal-dispatch path so all three see the same tree.
    fn build_full_cli(
        &self,
        doc: &crate::graphql::discovery::GraphQLSchema,
    ) -> clap::Command {
        let mut cli = self
            .custom_commands
            .graft_into(commands::build_cli(doc))
            .subcommand(crate::completions::completion_command())
            .subcommand(crate::man::man_command());

        // Register CLI-arg-bound credential sources as global flags.
        for arg_name in crate::auth::collect_binding_cli_args(&self.auth_bindings) {
            cli = cli.arg(
                clap::Arg::new(arg_name.clone())
                    .long(arg_name.clone())
                    .global(true)
                    .value_name(arg_name.to_uppercase().replace('-', "_"))
                    .help(format!("Credential value for auth source `{arg_name}`")),
            );
        }

        cli
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

        // Load the GraphQL schema
        let json = self.spec_json.as_deref().ok_or_else(|| {
            CliError::Discovery("No spec provided. Call .spec() on CliApp.".to_string())
        })?;
        let endpoint = self.endpoint_url.as_deref().ok_or_else(|| {
            CliError::Discovery("No endpoint provided. Call .endpoint() on CliApp.".to_string())
        })?;
        let doc = crate::graphql::load_graphql_schema(json, &self.name, endpoint)?;

        // Intercept --help --format json before clap parses, to emit machine-readable output
        if cli_args::wants_json_help(&args) {
            let path = cli_args::extract_subcommand_path(&args);
            return crate::graphql::help::render_json_help(&doc, &path);
        }

        // Intercept `<cli> completion <shell>` early — before normal API
        // dispatch — so a spec resource named "completion" doesn't collide.
        // Builds the full command tree (including global flags) so the
        // generated script covers the entire CLI surface.
        if crate::completions::wants_completion(&args) {
            let raw_shell_arg: Option<&str> =
                crate::early_intercept::nth_positional(&args, 1);

            match raw_shell_arg {
                Some(s) => match crate::completions::parse_shell(s) {
                    Some(shell) => {
                        let mut full_cmd = self.build_full_cli(&doc);
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
                    let mut full_cmd = self.build_full_cli(&doc);
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
            let mut full_cmd = self.build_full_cli(&doc);
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

        // Build the full command tree (same tree the intercept blocks use)
        // for normal dispatch. `completion` and `man` subcommands are
        // included so they appear in `--help`.
        let cli = self.build_full_cli(&doc);

        // Parse args (clap handles --help automatically via arg_required_else_help)
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

        // Finalize auth bindings against the parsed matches.
        if !self.auth_bindings.is_empty() {
            let matches_arc = std::sync::Arc::new(matches.clone());
            self.auth_bindings = crate::auth::finalize_bindings(
                std::mem::take(&mut self.auth_bindings),
                &matches_arc,
            );
        }

        // Dispatch to a custom command if one was invoked.
        if !self.custom_commands.is_empty() {
            let auth_provider = self.build_auth_provider();
            let ctx = AppContext {
                doc: doc.clone(),
                auth_provider,
                http_config: http_config.clone(),
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
        let body_json = matched_args
            .try_get_one::<String>("json")
            .ok()
            .flatten()
            .map(|s| s.as_str());

        let dry_run = matched_args.get_flag("dry-run");

        // Build pagination config
        let pagination = build_pagination_config(matched_args);

        let auth_provider = self.build_auth_provider();

        // --base-url flag wins; otherwise {NAME}_BASE_URL env var.
        let base_url_override_owned = cli_args::resolve_base_url_override(&matches, &self.name)?;
        let base_url_override = base_url_override_owned.as_deref();

        // Execute
        executor::execute_method(
            &doc,
            method,
            params_json,
            body_json,
            &auth_provider,
            dry_run,
            &pagination,
            &pipeline,
            false,
            base_url_override,
            &http_config,
        )
        .await
        .map(|_| ())
    }

    /// Construct the [`DynAuthProvider`] used for this run from the
    /// registered bindings. GraphQL has no spec-declared schemes; with no
    /// bindings, returns a `NoAuthProvider`.
    fn build_auth_provider(&self) -> DynAuthProvider {
        crate::auth::build_provider_with_strategy(
            &self.auth_bindings,
            &std::collections::HashMap::new(),
            self.auth_strategy,
            false,
        )
    }
}

/// Runtime context passed to custom command handlers.
///
/// Provides access to the loaded API spec and the constructed auth
/// provider.
pub struct AppContext {
    doc: RestDescription,
    auth_provider: DynAuthProvider,
    http_config: crate::http::HttpConfig,
}

impl AppContext {
    /// Execute an API method by name, using the same executor as built-in
    /// commands.
    pub fn execute(
        &self,
        method: &RestMethod,
        params_json: Option<&str>,
        body_json: Option<&str>,
        output_format: &formatter::OutputFormat,
    ) -> Result<(), CliError> {
        let pagination = executor::PaginationConfig::default();
        let pipeline = formatter::OutputPipeline {
            format: output_format.clone(),
            color_mode: formatter::ColorMode::default(),
        };

        tokio::runtime::Handle::current()
            .block_on(executor::execute_method(
                &self.doc,
                method,
                params_json,
                body_json,
                &self.auth_provider,
                false,
                &pagination,
                &pipeline,
                false,
                None,
                &self.http_config,
            ))
            .map(|_| ())
    }

    /// Returns a reference to the loaded API spec.
    pub fn spec(&self) -> &RestDescription {
        &self.doc
    }

    /// Returns a reference to the HTTP/TLS configuration for this CLI run.
    ///
    /// See [`crate::openapi::AppContext::http_config`] for the design
    /// rationale and how non-reqwest transports consume this.
    pub fn http_config(&self) -> &crate::http::HttpConfig {
        &self.http_config
    }
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
fn collect_params_from_flags(
    matched_args: &clap::ArgMatches,
    method: &crate::graphql::discovery::GraphQLOperation,
    params_override: Option<&str>,
) -> Result<serde_json::Map<String, serde_json::Value>, CliError> {
    let mut params = serde_json::Map::new();

    // Collect values from individual flags
    for param_name in method.parameters.keys() {
        if let Some(value) = matched_args.get_one::<String>(param_name) {
            params.insert(param_name.clone(), serde_json::Value::String(value.clone()));
        }
    }

    // Override with --params JSON if provided (--params wins)
    if let Some(json_str) = params_override {
        let overrides: serde_json::Map<String, serde_json::Value> =
            serde_json::from_str(json_str)
                .map_err(|e| CliError::Validation(format!("Invalid --params JSON: {e}")))?;
        for (key, value) in overrides {
            params.insert(key, value);
        }
    }

    Ok(params)
}

fn build_pagination_config(matches: &clap::ArgMatches) -> executor::PaginationConfig {
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
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_graphql_cli_app_builder() {
        let app = CliApp::new("test").spec("{}");
        assert_eq!(app.name, "test");
        assert!(app.spec_json.is_some());
    }

    #[test]
    fn test_graphql_auth_scheme_records_binding() {
        let app = CliApp::new("t")
            .spec("{}")
            .auth_scheme("bearerAuth", AuthCredentialSource::from_env("T"));
        assert_eq!(app.auth_bindings.len(), 1);
    }

    #[test]
    fn test_graphql_cli_app_endpoint() {
        let app = CliApp::new("graphql-fixture")
            .spec("{}")
            .endpoint("https://example.com/graphql");
        assert_eq!(app.endpoint_url.as_deref(), Some("https://example.com/graphql"));
    }

    #[test]
    fn test_graphql_cli_app_custom_command_top_level() {
        fn handler(_m: &clap::ArgMatches, _c: &AppContext) -> Result<(), CliError> {
            Ok(())
        }
        let app = CliApp::new("test")
            .spec("{}")
            .command(clap::Command::new("custom"), handler);
        assert_eq!(app.custom_commands.len(), 1);
        assert!(app.custom_commands.entries()[0].0.is_empty());
        assert_eq!(app.custom_commands.entries()[0].1.get_name(), "custom");
    }

    #[test]
    fn test_graphql_cli_app_command_under_records_path() {
        fn handler(_m: &clap::ArgMatches, _c: &AppContext) -> Result<(), CliError> {
            Ok(())
        }
        let app = CliApp::new("test")
            .spec("{}")
            .command_under(&["webhooks"], clap::Command::new("verify"), handler);
        assert_eq!(app.custom_commands.len(), 1);
        assert_eq!(
            app.custom_commands.entries()[0].0,
            vec!["webhooks".to_string()]
        );
        assert_eq!(app.custom_commands.entries()[0].1.get_name(), "verify");
    }
}
