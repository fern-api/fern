//! Root-level `CliApp` that composes one or more [`Binding`]s into a
//! single CLI binary.
//!
//! **Architectural rule:** `CliApp::run()` always runs the full dispatch
//! pipeline. There is no single-binding shortcut. A binary with one
//! binding goes through exactly the same pipeline as a binary with five.
//!
//! The pipeline:
//! 1. Parse argv → `ArgMatches`
//! 2. Resolve operation path → matched `Binding`
//! 3. Call `Binding::dispatch(...)` (fires transport-scope hooks)
//! 4. Run CliApp-scope `transform_response` chain
//! 5. On error from step 3, run CliApp-scope `recover_error` chain
//! 6. Format and write output
//!
//! See [PR #62 review](https://github.com/fern-api/cli-sdk/pull/62#issuecomment-4484622766)
//! for why the single-binding fast path was removed.

use std::any::Any;

use serde_json::Value;

use crate::auth::root_builder::AuthSchemeBuilder;
use crate::auth::SchemeBinding;
use crate::binding::{Binding, DispatchResult};
use crate::error::{write_error_json, CliError};
use crate::formatter;
use crate::hooks::HookRegistry;
use crate::stability::Stability;

/// Handler function for CLI-level custom commands.
///
/// Receives the parsed [`clap::ArgMatches`] for the subcommand and a
/// type-erased binding context. Use [`OpenApiBinding::handler()`] or
/// [`GraphqlBinding::handler()`] to wrap a typed handler function
/// instead of downcasting manually.
///
/// [`OpenApiBinding::handler()`]: crate::openapi::OpenApiBinding::handler
/// [`GraphqlBinding::handler()`]: crate::graphql::GraphqlBinding::handler
pub type CliCommandHandler =
    Box<dyn Fn(&clap::ArgMatches, &dyn Any) -> Result<(), CliError> + Send + Sync>;

/// A CLI-level custom command: parent path, clap command, and handler.
struct CliCommand {
    path: Vec<String>,
    cmd: clap::Command,
    handler: CliCommandHandler,
}

/// Outcome of the dispatch pipeline — separates success from
/// help/version display so `CliError` is reserved for real errors.
enum PipelineOutcome {
    Success,
    HelpShown,
}

// ── Tier 1 deferred operations ──────────────────────────────────────

/// A declarative modification to be applied to the clap command tree
/// after all bindings have contributed their subtrees.
enum DeferredOp {
    Alias {
        path: Vec<String>,
        alias: String,
    },
    Hide {
        path: Vec<String>,
    },
    Stability {
        path: Vec<String>,
        stability: Stability,
    },
}

// ── Root CliApp ─────────────────────────────────────────────────────

/// Root-level CLI application builder that composes [`Binding`]s.
///
/// ```rust,ignore
/// use fern_cli_sdk::app::CliApp;
/// use fern_cli_sdk::openapi::OpenApiBinding;
///
/// fn main() {
///     CliApp::new("my-cli")
///         .title("My CLI")
///         .description("Interact with the My API from the command line.")
///         .binding(
///             OpenApiBinding::new()
///                 .spec(include_str!("openapi.yaml"))
///                 .auth_scheme_env("bearer", "MY_API_KEY"),
///         )
///         .run()
/// }
/// ```
#[must_use]
pub struct CliApp {
    name: String,
    title: Option<String>,
    description: Option<String>,
    bindings: Vec<Box<dyn Binding>>,
    hooks: HookRegistry,
    deferred_ops: Vec<DeferredOp>,
    cli_commands: Vec<CliCommand>,
    /// Root-level auth scheme bindings. These are shared across all
    /// bindings — each binding's spec references schemes by name and
    /// the credential source is looked up from this registry.
    auth_bindings: Vec<(String, SchemeBinding)>,
}

impl CliApp {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            title: None,
            description: None,
            bindings: Vec::new(),
            hooks: HookRegistry::new(),
            deferred_ops: Vec::new(),
            cli_commands: Vec::new(),
            auth_bindings: Vec::new(),
        }
    }

    // ── CLI metadata ────────────────────────────────────────────────

    /// Set the top-level `--help` title for this CLI.
    pub fn title(mut self, t: &str) -> Self {
        self.title = Some(t.to_string());
        self
    }

    /// Set the top-level `--help` description for this CLI.
    pub fn description(mut self, d: &str) -> Self {
        self.description = Some(d.to_string());
        self
    }

    // ── Binding registration ────────────────────────────────────────

    /// Add a binding (protocol adapter) to this CLI. The CLI name is
    /// propagated to the binding for HTTP config, logging, and base-URL
    /// resolution.
    pub fn binding(mut self, mut binding: impl Binding + 'static) -> Self {
        binding.set_cli_name(&self.name);
        self.bindings.push(Box::new(binding));
        self
    }

    // ── Auth registration ────────────────────────────────────────────

    /// Register an auth scheme at the root CLI level.
    ///
    /// Auth declared here is shared across all bindings. Each binding's
    /// spec references schemes by name (from its `securitySchemes`), and
    /// credential resolution comes from this root registry.
    ///
    /// ```rust,ignore
    /// use fern_cli_sdk::app::CliApp;
    /// use fern_cli_sdk::auth::{BearerAuth, ApiKeyAuth};
    ///
    /// CliApp::new("my-cli")
    ///     .auth(BearerAuth::new("bearerAuth").env("MY_TOKEN"))
    ///     .auth(ApiKeyAuth::new("apiKey").env("API_KEY"))
    ///     .binding(OpenApiBinding::new().spec(include_str!("openapi.yaml")))
    ///     .run()
    /// ```
    pub fn auth(mut self, builder: impl AuthSchemeBuilder) -> Self {
        self.auth_bindings.push(builder.into_binding());
        self
    }

    // ── Custom commands ──────────────────────────────────────────────

    /// Register a top-level custom command.
    ///
    /// Use [`OpenApiBinding::handler()`] or [`GraphqlBinding::handler()`]
    /// to wrap a typed handler that receives the concrete binding context:
    ///
    /// ```rust,ignore
    /// CliApp::new("my-cli")
    ///     .binding(OpenApiBinding::new().spec(include_str!("openapi.yaml")))
    ///     .command(my_command(), OpenApiBinding::handler(my_handler))
    ///     .run()
    /// ```
    ///
    /// **Note:** `transform_response` and `recover_error` hooks do not
    /// apply to custom commands. Custom command handlers manage their
    /// own output directly.
    ///
    /// [`OpenApiBinding::handler()`]: crate::openapi::OpenApiBinding::handler
    /// [`GraphqlBinding::handler()`]: crate::graphql::GraphqlBinding::handler
    pub fn command(mut self, cmd: clap::Command, handler: CliCommandHandler) -> Self {
        self.cli_commands.push(CliCommand {
            path: Vec::new(),
            cmd,
            handler,
        });
        self
    }

    /// Register a custom command under an existing command path.
    ///
    /// ```rust,ignore
    /// CliApp::new("my-cli")
    ///     .binding(OpenApiBinding::new().spec(include_str!("openapi.yaml")))
    ///     .command_under(
    ///         &["webhooks"],
    ///         verify_command(),
    ///         OpenApiBinding::handler(handle_verify),
    ///     )
    ///     .run()
    /// ```
    ///
    /// **Note:** `transform_response` and `recover_error` hooks do not
    /// apply to custom commands. Custom command handlers manage their
    /// own output directly.
    pub fn command_under(
        mut self,
        path: &[&str],
        cmd: clap::Command,
        handler: CliCommandHandler,
    ) -> Self {
        self.cli_commands.push(CliCommand {
            path: path.iter().map(|s| s.to_string()).collect(),
            cmd,
            handler,
        });
        self
    }

    // ── Tier 1: Declarative ─────────────────────────────────────────

    /// Register an alias for a command at `path`. Invoking the alias
    /// produces the same output as the canonical name.
    pub fn alias(mut self, path: &[&str], alias: &str) -> Self {
        self.deferred_ops.push(DeferredOp::Alias {
            path: path.iter().map(|s| s.to_string()).collect(),
            alias: alias.to_string(),
        });
        self
    }

    /// Hide a command from `--help` output.
    pub fn hide(mut self, path: &[&str]) -> Self {
        self.deferred_ops.push(DeferredOp::Hide {
            path: path.iter().map(|s| s.to_string()).collect(),
        });
        self
    }

    /// Set the stability level for a command.
    pub fn stability(mut self, path: &[&str], stability: Stability) -> Self {
        self.deferred_ops.push(DeferredOp::Stability {
            path: path.iter().map(|s| s.to_string()).collect(),
            stability,
        });
        self
    }

    /// Mark a command as deprecated with a message.
    pub fn deprecate(self, path: &[&str], message: &str) -> Self {
        self.stability(
            path,
            Stability::Deprecated {
                message: message.to_string(),
                replacement: None,
                removed_in: None,
            },
        )
    }

    // ── Tier 2: Per-command hooks ───────────────────────────────────

    /// Transform a decoded response value before format/output.
    /// Glob path applies across many operations.
    pub fn transform_response<F, Fut>(mut self, path: &[&str], f: F) -> Self
    where
        F: Fn(Value, Vec<String>) -> Fut + Send + Sync + 'static,
        Fut: std::future::Future<Output = Result<Value, CliError>> + Send + 'static,
    {
        self.hooks.add_transform_response(
            path,
            Box::new(move |v, p| Box::pin(f(v, p))),
        );
        self
    }

    /// Convert an API error into synthetic success. Returning
    /// `Ok(Some(v))` short-circuits with `v` as the response;
    /// `Ok(None)` lets the error propagate.
    pub fn recover_error<F, Fut>(mut self, path: &[&str], f: F) -> Self
    where
        F: Fn(CliError, Vec<String>) -> Fut + Send + Sync + 'static,
        Fut: std::future::Future<Output = Result<Option<Value>, CliError>> + Send + 'static,
    {
        self.hooks.add_recover_error(
            path,
            Box::new(move |e, p| Box::pin(f(e, p))),
        );
        self
    }

    // ── Run ─────────────────────────────────────────────────────────

    /// Run the CLI, consuming `self`. Builds the command tree, parses
    /// argv, dispatches through the matched binding, applies hooks,
    /// and formats output.
    pub fn run(mut self) {
        crate::reset_sigpipe();
        let _ = dotenvy::dotenv();
        crate::init_logging(&self.name);

        self.propagate_root_auth();

        let rt = tokio::runtime::Runtime::new().expect("Failed to create tokio runtime");
        let mut out = std::io::stdout().lock();
        let exit = rt.block_on(self.run_inner(std::env::args_os().collect(), &mut out));
        drop(out);
        std::process::exit(exit);
    }

    /// Testable entry point: runs the full pipeline against the given
    /// argv and returns the exit code instead of calling
    /// `std::process::exit`. Output is written to stdout.
    pub fn try_run_from<I, T>(mut self, args: I) -> i32
    where
        I: IntoIterator<Item = T>,
        T: Into<std::ffi::OsString>,
    {
        self.propagate_root_auth();
        let args: Vec<std::ffi::OsString> = args.into_iter().map(Into::into).collect();
        let rt = tokio::runtime::Runtime::new().expect("Failed to create tokio runtime");
        let mut out = std::io::stdout().lock();
        rt.block_on(self.run_inner(args, &mut out))
    }

    /// Testable entry point that captures output into the provided
    /// writer instead of stdout. Returns `(exit_code, bytes_written)`.
    ///
    /// This is the preferred method for behavior tests — it avoids
    /// process-global stdout redirection (`gag`) which is racy under
    /// parallel test execution.
    pub fn try_run_from_with_output<I, T, W>(mut self, args: I, out: &mut W) -> i32
    where
        I: IntoIterator<Item = T>,
        T: Into<std::ffi::OsString>,
        W: std::io::Write,
    {
        self.propagate_root_auth();
        let args: Vec<std::ffi::OsString> = args.into_iter().map(Into::into).collect();
        let rt = tokio::runtime::Runtime::new().expect("Failed to create tokio runtime");
        rt.block_on(self.run_inner(args, out))
    }

    /// Pass root-level auth bindings to each registered binding and
    /// validate that specs don't reference unregistered schemes.
    /// Must be called before `run_inner` / `dispatch_pipeline`.
    fn propagate_root_auth(&mut self) {
        if !self.auth_bindings.is_empty() {
            for binding in &mut self.bindings {
                binding.set_root_auth(&self.auth_bindings);
            }
        }
    }

    /// Validate auth across all bindings. Hard-errors if any binding's
    /// spec references a scheme not registered in auth_bindings.
    fn validate_auth(&self) -> Result<(), CliError> {
        for binding in &self.bindings {
            binding.validate_auth()?;
        }
        Ok(())
    }

    /// Core async pipeline. Returns exit code (0 = success).
    ///
    /// **NO SINGLE-BINDING SHORTCUT.** Every execution path goes through
    /// the full dispatch pipeline regardless of binding count.
    async fn run_inner<W: std::io::Write>(&self, args: Vec<std::ffi::OsString>, out: &mut W) -> i32 {
        match self.dispatch_pipeline(args, out).await {
            Ok(PipelineOutcome::Success) => 0,
            Ok(PipelineOutcome::HelpShown) => 0,
            Err(err) => {
                write_error_json(&err, out);
                err.exit_code()
            }
        }
    }

    /// The full dispatch pipeline.
    async fn dispatch_pipeline<W: std::io::Write>(
        &self,
        args: Vec<std::ffi::OsString>,
        out: &mut W,
    ) -> Result<PipelineOutcome, CliError> {
        if self.bindings.is_empty() {
            return Err(CliError::Discovery(
                "No bindings registered. Call .binding() on CliApp.".to_string(),
            ));
        }

        // 0. Validate auth bindings — hard error if a binding's spec
        // references a scheme not registered at root.
        self.validate_auth()?;

        // 0. Convert args to strings for early interception checks.
        let str_args: Vec<String> = args.iter()
            .filter_map(|a| a.to_str().map(String::from))
            .collect();

        // 0a. Intercept `<cli> errors` early — before loading specs.
        if crate::cli_args::is_errors_subcommand(&str_args) {
            crate::error::write_errors_to(&str_args, out);
            return Ok(PipelineOutcome::HelpShown);
        }

        // 0b. Intercept `--help --format json` before clap parses.
        if crate::cli_args::wants_json_help(&str_args) {
            let path = crate::cli_args::extract_subcommand_path(&str_args);
            for binding in &self.bindings {
                if binding.render_json_help(&path, out)? {
                    return Ok(PipelineOutcome::HelpShown);
                }
            }
        }

        // 1. Build merged command tree from all bindings.
        let mut cli = clap::Command::new(self.name.clone())
            .version(env!("CARGO_PKG_VERSION"))
            .arg_required_else_help(true)
            .subcommand_required(true)
            .term_width(200);
        if let Some(ref t) = self.title {
            cli = cli.about(t.clone());
        }
        if let Some(ref d) = self.description {
            cli = cli.long_about(d.clone());
        }
        cli = cli
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

        // Collect each binding's subtree commands, global args, and help
        // footer, then merge into the root.
        let mut binding_commands: Vec<(usize, Vec<String>)> = Vec::new();
        let mut after_help_sections: Vec<String> = Vec::new();
        // Track registered arg IDs to avoid clap panic on duplicates
        // when multiple bindings share the same global args (e.g.
        // root-level CLI auth flags propagated to every binding).
        let mut seen_arg_ids: std::collections::HashSet<String> = [
            "format".to_string(),
            "base-url".to_string(),
            "help".to_string(),
            "version".to_string(),
        ]
        .into();
        for (idx, binding) in self.bindings.iter().enumerate() {
            let subcmd = binding.build_command()?;
            // Record which top-level subcommand names belong to which binding.
            for sub in subcmd.get_subcommands() {
                binding_commands.push((idx, vec![sub.get_name().to_string()]));
            }
            // Merge this binding's subcommands into the root.
            for sub in subcmd.get_subcommands().cloned() {
                cli = cli.subcommand(sub);
            }
            // Merge binding-level global args (server vars, SDK vars,
            // global headers) into the root command.
            for arg in subcmd.get_arguments() {
                let id = arg.get_id().as_str();
                if !seen_arg_ids.insert(id.to_string()) {
                    continue;
                }
                cli = cli.arg(arg.clone());
            }
            // Carry the binding's about into the root when CliApp
            // doesn't override it.
            if self.title.is_none() {
                if let Some(about) = subcmd.get_about() {
                    cli = cli.about(about.to_string());
                }
            }
            // Collect after_help sections from all bindings for
            // composition (concatenate, not overwrite).
            if let Some(help) = subcmd.get_after_help() {
                after_help_sections.push(help.to_string());
            }
        }
        if !after_help_sections.is_empty() {
            // Deduplicate lines across bindings (preserving order) so
            // two bindings sharing the same env vars or auth schemes
            // don't repeat identical footer lines.
            let merged = deduplicate_after_help(&after_help_sections);
            cli = cli.after_help(merged);
        }

        // 1b. Register CLI-level custom commands (may be nested).
        for cc in &self.cli_commands {
            cli = crate::custom_commands::graft_subcommand(cli, &cc.path, cc.cmd.clone());
        }

        // 1c. Register `completion` and `man` subcommands.
        cli = cli
            .subcommand(crate::completions::completion_command())
            .subcommand(crate::man::man_command());

        // 1d. Apply Tier 1 deferred operations (alias, hide, stability)
        // before completion/man generation so aliases appear in tab-
        // completion scripts and man pages reflect hidden/stability state.
        for op in &self.deferred_ops {
            match op {
                DeferredOp::Alias { path, alias } => {
                    cli = apply_alias(cli, path, alias);
                }
                DeferredOp::Hide { path } => {
                    cli = apply_hide(cli, path);
                }
                DeferredOp::Stability { path, stability } => {
                    cli = apply_stability(cli, path, stability);
                }
            }
        }

        // 1e. Validate hook patterns against the command tree.
        self.hooks.validate_patterns(&cli)?;

        // 1f. Intercept `completion` and `man` before clap parses.
        if crate::completions::wants_completion(&str_args) {
            let raw_shell_arg =
                crate::early_intercept::nth_positional(&str_args, 1);
            match raw_shell_arg {
                Some(s) => match crate::completions::parse_shell(s) {
                    Some(shell) => {
                        crate::completions::generate_completion_to(shell, &mut cli, &self.name, out)
                            .map_err(|e| CliError::Other(e.into()))?;
                        return Ok(PipelineOutcome::HelpShown);
                    }
                    None => {
                        return Err(CliError::Validation(format!(
                            "invalid shell: '{s}'. Expected one of: bash, zsh, fish, powershell, elvish"
                        )));
                    }
                },
                None => {
                    if let Some(sub) = cli.find_subcommand_mut("completion") {
                        let _ = sub.write_help(out);
                    }
                    return Ok(PipelineOutcome::HelpShown);
                }
            }
        }
        if crate::man::wants_man(&str_args) {
            let has_help = str_args.iter().skip(1)
                .skip_while(|a| a.as_str() != "man").skip(1)
                .any(|a| a == "--help" || a == "-h");
            if has_help {
                if let Some(sub) = cli.find_subcommand_mut("man") {
                    let _ = sub.write_help(out);
                }
                return Ok(PipelineOutcome::HelpShown);
            }
            crate::man::generate_man_to(cli, &self.name, out)
                .map_err(|e| CliError::Other(e.into()))?;
            return Ok(PipelineOutcome::HelpShown);
        }

        // 3. Parse argv.
        let matches = match cli.try_get_matches_from(&args) {
            Ok(m) => m,
            Err(e)
                if e.kind() == clap::error::ErrorKind::DisplayHelp
                    || e.kind()
                        == clap::error::ErrorKind::DisplayHelpOnMissingArgumentOrSubcommand
                    || e.kind() == clap::error::ErrorKind::DisplayVersion =>
            {
                let _ = std::io::Write::write_fmt(out, format_args!("{e}"));
                let _ = out.flush();
                return Ok(PipelineOutcome::HelpShown);
            }
            Err(e) => return Err(CliError::Validation(e.to_string())),
        };

        // 4. Resolve which binding owns the matched subcommand.
        let (op_path, sub_matches) = resolve_op_path(&matches);

        // 4a. Check CLI-level custom commands first.
        for cc in &self.cli_commands {
            if let Some(target) = crate::custom_commands::walk_matches_to_custom(
                &matches, &cc.path, cc.cmd.get_name(),
            ) {
                // Collect contexts from ALL bindings so the handler can
                // invoke operations from any binding transparently.
                let mut ctx: Option<Box<dyn Any + Send + Sync>> = None;
                for b in &self.bindings {
                    ctx = b.merge_binding_context(&matches, ctx)?;
                }
                let ctx = ctx.unwrap_or_else(|| Box::new(()));
                (cc.handler)(target, ctx.as_ref())?;
                return Ok(PipelineOutcome::Success);
            }
        }

        let binding_idx = resolve_binding_for_path(
            &op_path,
            &binding_commands,
        ).ok_or_else(|| {
            CliError::Discovery(format!(
                "No binding found for command path: {}",
                op_path.join(" "),
            ))
        })?;

        // 5. Dispatch to the binding. NO SHORTCUT — always goes through
        //    the full pipeline.
        let dispatch_result = self.bindings[binding_idx]
            .dispatch(&matches, sub_matches, &op_path)
            .await;

        // 6. Apply CliApp-scope hooks.
        match dispatch_result {
            Ok(DispatchResult::Value(value)) => {
                // Run transform_response chain.
                let transformed = self.hooks.run_transform_response(value, &op_path).await?;

                // Format and write output.
                let pipeline = formatter::OutputPipeline::from_matches(&matches)
                    .map_err(|e| CliError::Validation(e.to_string()))?;
                pipeline
                    .emit(out, &transformed, false, true)
                    .map_err(|e| CliError::Other(e.into()))?;
                Ok(PipelineOutcome::Success)
            }
            Ok(DispatchResult::Handled) => {
                // Binding already handled output (dry-run, streaming, etc.).
                Ok(PipelineOutcome::Success)
            }
            Err(err) => {
                // Run recover_error chain.
                if self.hooks.has_recover_error() {
                    match self.hooks.run_recover_error(err, &op_path).await {
                        Ok(value) => {
                            let pipeline = formatter::OutputPipeline::from_matches(&matches)
                                .map_err(|e| CliError::Validation(e.to_string()))?;
                            pipeline
                                .emit(out, &value, false, true)
                                .map_err(|e| CliError::Other(e.into()))?;
                            Ok(PipelineOutcome::Success)
                        }
                        Err(e) => Err(e),
                    }
                } else {
                    Err(err)
                }
            }
        }
    }
}

// ── Command tree helpers ────────────────────────────────────────────

/// Walk the `ArgMatches` subcommand chain to extract the operation path
/// and the leaf subcommand's matches.
fn resolve_op_path(matches: &clap::ArgMatches) -> (Vec<String>, &clap::ArgMatches) {
    let mut path = Vec::new();
    let mut current = matches;
    while let Some((name, sub)) = current.subcommand() {
        path.push(name.to_string());
        current = sub;
    }
    (path, current)
}

/// Find which binding index owns the first segment of the command path.
fn resolve_binding_for_path(
    op_path: &[String],
    binding_commands: &[(usize, Vec<String>)],
) -> Option<usize> {
    if op_path.is_empty() {
        return None;
    }
    // Last-registered binding wins (matches design: "last binding wins").
    binding_commands
        .iter()
        .rev()
        .find(|(_, cmd_path)| cmd_path.first() == op_path.first())
        .map(|(idx, _)| *idx)
}

/// Apply a transform to the command at `path` using clap's
/// `mut_subcommand` to walk the tree. Parent commands are never
/// rebuilt — only the leaf is transformed — so all clap settings on
/// every ancestor are preserved automatically, regardless of what
/// settings clap adds in future versions.
fn modify_at_path(
    cmd: clap::Command,
    path: &[String],
    transform: &dyn Fn(clap::Command) -> clap::Command,
) -> clap::Command {
    if path.is_empty() {
        return transform(cmd);
    }
    let head = path[0].clone();
    let rest = path[1..].to_vec();
    cmd.mut_subcommand(head, move |sub| modify_at_path(sub, &rest, transform))
}

/// Apply a clap alias to the command at `path`.
fn apply_alias(cli: clap::Command, path: &[String], alias: &str) -> clap::Command {
    let alias_owned = alias.to_string();
    modify_at_path(cli, path, &|c| c.visible_alias(alias_owned.clone()))
}

/// Apply `hide(true)` to the command at `path`.
fn apply_hide(cli: clap::Command, path: &[String]) -> clap::Command {
    modify_at_path(cli, path, &|c| c.hide(true))
}

/// Apply a stability badge to the command at `path`.
fn apply_stability(cli: clap::Command, path: &[String], stability: &Stability) -> clap::Command {
    modify_at_path(cli, path, &|c| {
        if let Some(badge) = stability.badge() {
            let about = c
                .get_about()
                .map(|a| format!("{badge} {a}"))
                .unwrap_or_else(|| badge.to_string());
            c.about(about)
        } else {
            c
        }
    })
}

/// Merge multiple `after_help` sections, deduplicating identical blocks
/// while preserving first-seen order. Blocks are delimited by blank
/// lines (`\n\n`). This handles multi-line entries (e.g. auth sections
/// spanning several lines) as atomic units — they're either kept or
/// dropped as a whole, never split.
fn deduplicate_after_help(sections: &[String]) -> String {
    let mut seen = std::collections::HashSet::new();
    let mut blocks = Vec::new();
    for section in sections {
        // Split each section into blank-line-delimited blocks.
        for block in section.split("\n\n") {
            let trimmed = block.trim();
            if !trimmed.is_empty() && seen.insert(trimmed.to_string()) {
                blocks.push(trimmed.to_string());
            }
        }
    }
    blocks.join("\n\n")
}

// ── Tests ───────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolve_op_path_extracts_chain() {
        let cmd = clap::Command::new("test")
            .subcommand(
                clap::Command::new("users").subcommand(clap::Command::new("get")),
            );
        let matches = cmd
            .try_get_matches_from(["test", "users", "get"])
            .unwrap();
        let (path, _) = resolve_op_path(&matches);
        assert_eq!(path, vec!["users".to_string(), "get".to_string()]);
    }

    #[test]
    fn resolve_binding_last_wins() {
        let commands = vec![
            (0, vec!["users".to_string()]),
            (1, vec!["users".to_string()]),
        ];
        let path = vec!["users".to_string(), "get".to_string()];
        assert_eq!(resolve_binding_for_path(&path, &commands), Some(1));
    }

    #[test]
    fn resolve_binding_empty_path() {
        let commands = vec![(0, vec!["users".to_string()])];
        assert_eq!(resolve_binding_for_path(&[], &commands), None);
    }

    #[test]
    fn cli_app_must_use() {
        // This test verifies the builder compiles — #[must_use]
        // would fire a warning if the value were dropped without use.
        let _app = CliApp::new("test");
    }

    #[test]
    fn deduplicate_after_help_removes_identical_blocks() {
        let a = "Environment variables:\n  BOX_BASE_URL  Override\n  BOX_CA_BUNDLE  Path".to_string();
        let b = "Environment variables:\n  BOX_BASE_URL  Override\n  BOX_CA_BUNDLE  Path".to_string();
        let result = deduplicate_after_help(&[a, b]);
        assert_eq!(
            result,
            "Environment variables:\n  BOX_BASE_URL  Override\n  BOX_CA_BUNDLE  Path",
        );
    }

    #[test]
    fn deduplicate_after_help_preserves_unique_blocks() {
        let a = "Auth:\n  bearer via API_KEY".to_string();
        let b = "Environment variables:\n  BOX_BASE_URL  Override".to_string();
        let result = deduplicate_after_help(&[a, b]);
        assert_eq!(
            result,
            "Auth:\n  bearer via API_KEY\n\nEnvironment variables:\n  BOX_BASE_URL  Override",
        );
    }

    #[test]
    fn deduplicate_after_help_multiline_blocks_are_atomic() {
        // Two bindings with identical multi-line env block but
        // different auth blocks — env block appears once, both auth kept.
        let env_block = "Environment variables:\n  BOX_BASE_URL  Override\n  BOX_CA_BUNDLE  Path";
        let a = format!("Auth:\n  bearer via API_KEY\n\n{env_block}");
        let b = format!("Auth:\n  basic via SECRET\n\n{env_block}");
        let result = deduplicate_after_help(&[a, b]);
        assert_eq!(
            result,
            format!("Auth:\n  bearer via API_KEY\n\n{env_block}\n\nAuth:\n  basic via SECRET"),
        );
    }

    #[test]
    fn deduplicate_after_help_real_world_footer() {
        // Simulates two bindings with the same binary name producing
        // identical env var + standard-env-var blocks.
        let section = "Environment variables:\n  BOX_BASE_URL  Override\n  BOX_TIMEOUT_SECS  Timeout\n\nStandard env vars are also honored.";
        let result = deduplicate_after_help(&[section.to_string(), section.to_string()]);
        assert_eq!(result, section);
    }
}
