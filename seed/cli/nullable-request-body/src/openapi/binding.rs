//! [`OpenApiBinding`] — adapts [`super::CliApp`] to the root
//! [`crate::binding::Binding`] trait so it can be composed into
//! a root-level [`crate::app::CliApp`].

use std::sync::Arc;

use crate::auth::{AuthCredentialSource, DynAuthProvider};
use crate::binding::{Binding, BoxFuture, DispatchResult};
use crate::error::CliError;
use crate::openapi::commands;
use crate::openapi::discovery::RestDescription;
use crate::openapi::executor;

/// Prepared state computed once in `build_command()` and reused in
/// `dispatch()`. This avoids parsing the spec twice.
struct Prepared {
    doc: RestDescription,
    http_config: crate::http::HttpConfig,
    auth_provider: DynAuthProvider,
}

/// An OpenAPI binding that wraps [`super::CliApp`]'s internals and
/// exposes them through the [`Binding`] trait.
///
/// ```rust,ignore
/// use fern_cli_sdk::app::CliApp;
/// use fern_cli_sdk::openapi::OpenApiBinding;
///
/// fn main() {
///     CliApp::new("my-cli")
///         .binding(
///             OpenApiBinding::new()
///                 .spec(include_str!("openapi.yaml"))
///                 .auth_scheme_env("bearer", "MY_API_KEY"),
///         )
///         .run()
/// }
/// ```
#[must_use]
pub struct OpenApiBinding {
    inner: super::CliApp,
    /// Lazily computed on first `build_command()`, then reused in
    /// `dispatch()`. `Arc` so we can clone it out of the lock without
    /// holding across await.
    prepared: std::sync::Mutex<Option<Arc<Prepared>>>,
}

impl Default for OpenApiBinding {
    fn default() -> Self {
        Self {
            inner: super::CliApp::new(""),
            prepared: std::sync::Mutex::new(None),
        }
    }
}

impl OpenApiBinding {
    /// Create a new OpenAPI binding. The CLI name is set automatically
    /// by `CliApp::binding()` — no need to pass it here.
    pub fn new() -> Self {
        Self::default()
    }

    /// Set the OpenAPI spec YAML string.
    pub fn spec(mut self, yaml: &str) -> Self {
        self.inner = self.inner.spec(yaml);
        self
    }

    /// Set a spec YAML with Fern-style overrides.
    pub fn spec_with_overrides(mut self, yaml: &str, overrides: &str) -> Self {
        self.inner = self.inner.spec_with_overrides(yaml, overrides);
        self
    }

    /// Set a spec under a prefix path.
    pub fn spec_under(mut self, prefix: &str, yaml: &str) -> Self {
        self.inner = self.inner.spec_under(prefix, yaml);
        self
    }

    /// Set multiple specs under a prefix.
    pub fn specs_under<I, S>(mut self, prefix: &str, yamls: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: AsRef<str>,
    {
        self.inner = self.inner.specs_under(prefix, yamls);
        self
    }

    /// Bind a credential source to a named auth scheme (env var shorthand).
    pub fn auth_scheme_env(mut self, scheme_name: &str, env_var: &str) -> Self {
        self.inner = self.inner.auth_scheme_env(scheme_name, env_var);
        self
    }

    /// Bind a credential source to a named auth scheme.
    pub fn auth_scheme(mut self, scheme_name: &str, source: AuthCredentialSource) -> Self {
        self.inner = self.inner.auth_scheme(scheme_name, source);
        self
    }

    /// Add multiple specs under `prefix`, each in its own sub-namespace.
    pub fn specs_under_named<I, K, V>(mut self, prefix: &str, named: I) -> Self
    where
        I: IntoIterator<Item = (K, V)>,
        K: AsRef<str>,
        V: AsRef<str>,
    {
        self.inner = self.inner.specs_under_named(prefix, named);
        self
    }

    /// Bind a custom auth provider to a named scheme.
    pub fn auth_provider(
        mut self,
        scheme_name: &str,
        provider: impl crate::auth::provider::AuthProvider + 'static,
    ) -> Self {
        self.inner = self.inner.auth_provider(scheme_name, provider);
        self
    }

    /// Bind a pre-built shared auth provider to a named scheme.
    pub fn auth_provider_shared(
        mut self,
        scheme_name: &str,
        provider: crate::auth::DynAuthProvider,
    ) -> Self {
        self.inner = self.inner.auth_provider_shared(scheme_name, provider);
        self
    }

    /// Bind HTTP Basic auth for the named scheme.
    pub fn auth_basic_scheme(
        mut self,
        scheme_name: &str,
        username: AuthCredentialSource,
        password: AuthCredentialSource,
    ) -> Self {
        self.inner = self.inner.auth_basic_scheme(scheme_name, username, password);
        self
    }

    /// Register a server variable for URL template substitution.
    pub fn server_var(
        mut self,
        name: &str,
        env_var: Option<&str>,
        default: Option<&str>,
        description: Option<&str>,
    ) -> Self {
        self.inner = self.inner.server_var(name, env_var, default, description);
        self
    }

    /// Apply an overlay.
    pub fn overlay(mut self, overlay_yaml: &str) -> Self {
        self.inner = self.inner.overlay(overlay_yaml);
        self
    }

    /// Set compile-time audiences.
    pub fn audiences<I, S>(mut self, audiences: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        self.inner = self.inner.audiences(audiences);
        self
    }

    /// Prepare the binding state (idempotent; only runs once).
    /// Returns an `Arc` clone so the caller doesn't hold the lock.
    fn ensure_prepared(&self) -> Result<Arc<Prepared>, CliError> {
        let mut guard = self.prepared.lock().unwrap();
        if let Some(ref arc) = *guard {
            return Ok(Arc::clone(arc));
        }

        let mut doc = self.inner.build_doc()?;
        commands::filter_doc_by_audiences(&mut doc, &self.inner.audiences);

        let http_config = crate::http::HttpConfig::new(&self.inner.name)?
            .with_parsed_root_certs(
                self.inner.extra_root_certs.iter().cloned(),
                self.inner.extra_root_certs_pem.iter().cloned(),
            );
        let auth_provider = self.inner.build_auth_provider(&doc);

        let arc = Arc::new(Prepared {
            doc,
            http_config,
            auth_provider,
        });
        *guard = Some(Arc::clone(&arc));
        Ok(arc)
    }

    /// Build a [`BindingEntry`](super::app::BindingEntry) from this
    /// binding's prepared state and the current CLI matches.
    fn build_binding_entry(
        &self,
        matches: &clap::ArgMatches,
    ) -> Result<super::app::BindingEntry, CliError> {
        let prepared = self.ensure_prepared()?;
        let mut doc_owned;
        let doc = if self.inner.server_vars.is_empty() {
            &prepared.doc
        } else {
            doc_owned = prepared.doc.clone();
            self.inner.apply_server_vars(&mut doc_owned, matches);
            &doc_owned
        };

        // Finalize CLI-arg-bound auth sources against parsed matches,
        // mirroring dispatch() so custom command handlers get working auth.
        let cli_auth_args = crate::auth::collect_binding_cli_args(&self.inner.auth_bindings);
        let auth_provider = if cli_auth_args.is_empty() {
            prepared.auth_provider.clone()
        } else {
            let matches_arc = std::sync::Arc::new(matches.clone());
            let finalized = crate::auth::finalize_bindings(
                self.inner.auth_bindings.clone(),
                &matches_arc,
            );
            self.inner.build_auth_provider_from_finalized(&finalized, doc)
        };

        let global_headers: Vec<(String, String)> = doc
            .global_headers
            .iter()
            .filter_map(|h| {
                let val = super::app::resolve_global_header_value(matches, h)?;
                Some((h.header.clone(), val))
            })
            .collect();
        Ok(super::app::BindingEntry {
            doc: doc.clone(),
            auth_provider,
            http_config: prepared.http_config.clone(),
            global_headers,
        })
    }

    /// Wrap a typed handler function into a [`CliCommandHandler`] that
    /// automatically downcasts the binding context to
    /// [`AppContext`](super::AppContext).
    ///
    /// Use this with [`CliApp::command()`](crate::app::CliApp::command)
    /// or [`CliApp::command_under()`](crate::app::CliApp::command_under):
    ///
    /// ```rust,ignore
    /// CliApp::new("my-cli")
    ///     .binding(OpenApiBinding::new().spec(include_str!("openapi.yaml")))
    ///     .command(my_cmd(), OpenApiBinding::handler(my_handler))
    ///     .run()
    /// ```
    pub fn handler(
        f: fn(&clap::ArgMatches, &super::AppContext) -> Result<(), crate::error::CliError>,
    ) -> crate::app::CliCommandHandler {
        Box::new(move |matches: &clap::ArgMatches, ctx: &dyn std::any::Any| {
            let ctx = ctx.downcast_ref::<super::AppContext>().ok_or_else(|| {
                crate::error::CliError::Validation(
                    "handler requires an OpenAPI binding context".into(),
                )
            })?;
            f(matches, ctx)
        })
    }
}

impl Binding for OpenApiBinding {
    fn name(&self) -> &str {
        &self.inner.name
    }

    fn set_cli_name(&mut self, name: &str) {
        self.inner.name = name.to_string();
    }

    fn set_root_auth(&mut self, bindings: &[(String, crate::auth::SchemeBinding)]) {
        // Root-level auth bindings are prepended to the inner CliApp's
        // auth_bindings. If the binding also has its own auth_scheme_env()
        // calls, those take priority (they appear later and override).
        let mut merged = bindings.to_vec();
        merged.extend(std::mem::take(&mut self.inner.auth_bindings));
        self.inner.auth_bindings = merged;
    }

    fn validate_auth(&self) -> Result<(), CliError> {
        // Only validate when root-level auth is being used (auth_bindings
        // is non-empty). If the binding has no auth bindings at all, it's
        // intentionally running unauthenticated — no validation needed.
        if self.inner.auth_bindings.is_empty() {
            return Ok(());
        }
        let prepared = self.ensure_prepared()?;
        let registered: std::collections::HashSet<&str> = self
            .inner
            .auth_bindings
            .iter()
            .map(|(name, _)| name.as_str())
            .collect();
        let mut missing: Vec<&str> = Vec::new();
        for scheme_name in prepared.doc.security_schemes.keys() {
            if !registered.contains(scheme_name.as_str()) {
                missing.push(scheme_name.as_str());
            }
        }
        if !missing.is_empty() {
            missing.sort();
            // Warn rather than fail — multi-spec binaries may intentionally
            // bind only a subset of schemes (e.g. basic auth
            // but not the OAuth2 schemes).
            tracing::warn!(
                "Spec declares security scheme(s) [{}] with no .auth() binding. \
                 Those endpoints will run unauthenticated.",
                missing.join(", "),
            );
        }
        Ok(())
    }

    fn build_command(&self) -> Result<clap::Command, CliError> {
        let prepared = self.ensure_prepared()?;
        let cli = commands::build_cli(&prepared.doc)
            .subcommand(crate::openapi::skill_emitter::generate_skills_command());
        let mut cli = self.inner.decorate_command(&prepared.doc, cli);

        // Register global --<name> flags for CLI-bound auth sources
        // so clap knows about them before parsing.
        let cli_auth_args = crate::auth::collect_binding_cli_args(&self.inner.auth_bindings);
        for arg_name in &cli_auth_args {
            let kebab = arg_name.replace('_', "-");
            cli = cli.arg(
                clap::Arg::new(arg_name.clone())
                    .long(kebab)
                    .global(true)
                    .value_name(arg_name.to_uppercase())
                    .help("Auth credential"),
            );
        }

        Ok(cli)
    }

    fn render_json_help(
        &self,
        subcommand_path: &[String],
        out: &mut dyn std::io::Write,
    ) -> Result<bool, CliError> {
        let prepared = self.ensure_prepared()?;
        match super::help::write_json_help(&prepared.doc, subcommand_path, out) {
            Ok(()) => Ok(true),
            // "Resource not found" / "Operation not found" means the path
            // belongs to a different binding — return false so the
            // dispatch_pipeline loop tries the next one.
            Err(CliError::Validation(msg))
                if msg.contains("not found") =>
            {
                Ok(false)
            }
            Err(e) => Err(e),
        }
    }

    fn dispatch<'a>(
        &'a self,
        root_matches: &'a clap::ArgMatches,
        _sub_matches: &'a clap::ArgMatches,
        _op_path: &'a [String],
    ) -> BoxFuture<'a, Result<DispatchResult, CliError>> {
        // Clone the Arc so we don't hold the lock across the await.
        let prepared = match self.ensure_prepared() {
            Ok(p) => p,
            Err(e) => return Box::pin(async move { Err(e) }),
        };

        // Intercept `generate-skills` — it's not a spec operation.
        if _op_path == ["generate-skills"] {
            let output_dir = _sub_matches.get_one::<String>("output-dir");
            let result = self.inner.handle_generate_skills(
                output_dir.map(|s| s.as_str()),
                &prepared.doc,
            );
            return Box::pin(async move {
                result?;
                Ok(DispatchResult::Handled)
            });
        }

        Box::pin(async move {
            // If any auth source uses CLI flags, finalize them against
            // the parsed matches and rebuild the auth provider.
            let cli_auth_args = crate::auth::collect_binding_cli_args(&self.inner.auth_bindings);
            let auth_provider = if cli_auth_args.is_empty() {
                prepared.auth_provider.clone()
            } else {
                let matches_arc = std::sync::Arc::new(root_matches.clone());
                let finalized = crate::auth::finalize_bindings(
                    self.inner.auth_bindings.clone(),
                    &matches_arc,
                );
                self.inner.build_auth_provider_from_finalized(&finalized, &prepared.doc)
            };

            // Apply server-variable substitutions to a local copy of the doc
            // if any server vars are registered.
            let mut doc_owned;
            let doc = if self.inner.server_vars.is_empty() {
                &prepared.doc
            } else {
                doc_owned = prepared.doc.clone();
                self.inner.apply_server_vars(&mut doc_owned, root_matches);
                &doc_owned
            };

            // Walk the subcommand tree from root to find the target method.
            let (method, matched_args) =
                super::resolve_method_from_matches(doc, root_matches)?;

            let params_override = matched_args
                .get_one::<String>("params")
                .map(|s| s.as_str());
            let params = super::app::collect_params_from_flags(
                matched_args,
                method,
                params_override,
            )?;
            let params_json_string = serde_json::to_string(&params)
                .map_err(|e| CliError::Validation(format!("Failed to serialize params: {e}")))?;
            let params_json: Option<&str> = if params.is_empty() {
                None
            } else {
                Some(&params_json_string)
            };

            let body_json_owned = crate::cli_args::resolve_body_json(matched_args)?;
            let body_json = body_json_owned.as_deref();

            let dry_run = matched_args.get_flag("dry-run");

            let pagination = super::app::build_pagination_config(matched_args, doc);

            let no_extract = matched_args.get_flag("no-extract");
            let no_retry = matched_args.get_flag("no-retry");
            let no_stream = matched_args
                .try_get_one::<bool>("no-stream")
                .ok()
                .flatten()
                .copied()
                .unwrap_or(false);

            let binary_body_path = method
                .binary_request_body
                .as_ref()
                .and_then(|b| {
                    matched_args
                        .try_get_one::<String>(&b.flag_name)
                        .ok()
                        .flatten()
                        .map(|s| s.as_str())
                });

            // Validate binary body path for dangerous characters.
            if let Some(path_str) = binary_body_path {
                let stripped = path_str.strip_prefix('@').unwrap_or(path_str);
                if stripped != "-" {
                    let flag = method.binary_request_body.as_ref()
                        .map(|b| b.flag_name.as_str()).unwrap_or("file");
                    crate::output::reject_dangerous_chars(stripped, &format!("--{flag}"))?;
                }
            }

            let global_header_overrides = super::app::build_global_header_overrides(
                matched_args,
                doc,
                method,
                &params,
            )?;

            // --base-url flag wins; otherwise {NAME}_BASE_URL env var.
            let base_url_override_owned =
                crate::cli_args::resolve_base_url_override(root_matches, &self.inner.name)?;
            let base_url_override = base_url_override_owned.as_deref();

            // Read --output flag for binary response file writing.
            // validate_safe_file_path rejects traversal, symlink escapes,
            // and control characters per AGENTS.md.
            let output_path_owned = matched_args
                .try_get_one::<String>("output")
                .ok()
                .flatten()
                .cloned();
            let output_path_buf = if let Some(ref p) = output_path_owned {
                Some(crate::validate::validate_safe_file_path(p, "--output")?)
            } else {
                None
            };
            let output_path = output_path_buf.as_deref().and_then(|p| p.to_str());

            // Execute with capture_output = true to get the Value back
            // instead of printing to stdout.
            let result = executor::execute_method(
                doc,
                method,
                params_json,
                body_json,
                &auth_provider,
                output_path,
                None,  // upload
                binary_body_path,
                dry_run,
                &pagination,
                &crate::formatter::OutputPipeline::default(),
                true,  // capture_output = true
                base_url_override,
                &prepared.http_config,
                no_extract,
                no_retry,
                no_stream,
                &global_header_overrides,
            )
            .await?;

            match result {
                Some(value) => Ok(DispatchResult::Value(value)),
                None => Ok(DispatchResult::Handled),
            }
        })
    }

    fn binding_context(
        &self,
        matches: &clap::ArgMatches,
    ) -> Result<Option<Box<dyn std::any::Any + Send + Sync>>, CliError> {
        let entry = self.build_binding_entry(matches)?;
        let quiet = matches
            .try_get_one::<bool>("quiet")
            .ok()
            .flatten()
            .copied()
            .unwrap_or(false);
        let ctx = super::AppContext::new(
            entry.doc,
            entry.auth_provider,
            entry.http_config,
            entry.global_headers,
        ).with_quiet(quiet);
        Ok(Some(Box::new(ctx)))
    }

    fn merge_binding_context(
        &self,
        matches: &clap::ArgMatches,
        existing: Option<Box<dyn std::any::Any + Send + Sync>>,
    ) -> Result<Option<Box<dyn std::any::Any + Send + Sync>>, CliError> {
        let entry = self.build_binding_entry(matches)?;
        let quiet = matches
            .try_get_one::<bool>("quiet")
            .ok()
            .flatten()
            .copied()
            .unwrap_or(false);
        match existing {
            Some(ctx_box) => match ctx_box.downcast::<super::AppContext>() {
                Ok(mut ctx) => {
                    ctx.add_entry(entry);
                    Ok(Some(ctx as Box<dyn std::any::Any + Send + Sync>))
                }
                Err(original) => {
                    // Different binding type — start a new AppContext,
                    // discard the incompatible context.
                    let ctx = super::AppContext::new(
                        entry.doc,
                        entry.auth_provider,
                        entry.http_config,
                        entry.global_headers,
                    ).with_quiet(quiet);
                    let _ = original;
                    Ok(Some(Box::new(ctx)))
                }
            },
            None => {
                let ctx = super::AppContext::new(
                    entry.doc,
                    entry.auth_provider,
                    entry.http_config,
                    entry.global_headers,
                ).with_quiet(quiet);
                Ok(Some(Box::new(ctx)))
            }
        }
    }
}
