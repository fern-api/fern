//! Protocol-agnostic registry for custom CLI subcommands grafted onto a
//! spec-derived command tree.
//!
//! Both the OpenAPI and GraphQL `CliApp` builders let consumers register
//! handlers for subcommands that live alongside spec-generated commands
//! (e.g. a `webhooks verify` leaf next to spec-generated `webhooks list`).
//! The grafting and dispatch logic is identical across protocols — only
//! the per-handler context type differs — so it lives here, generic over
//! the context type `C`.

use crate::error::CliError;

/// A custom command handler function.
///
/// Receives the parsed [`clap::ArgMatches`] for the subcommand and the
/// per-protocol context `C` (typically the protocol's `AppContext`).
pub type HandlerFn<C> = fn(&clap::ArgMatches, &C) -> Result<(), CliError>;

/// A registered custom command: parent path, leaf [`clap::Command`], and
/// its handler.
type Entry<C> = (Vec<String>, clap::Command, HandlerFn<C>);

/// Registry of custom subcommands keyed by their parent path in the
/// spec-derived command tree. Empty path = top-level.
pub struct CustomCommandRegistry<C> {
    entries: Vec<Entry<C>>,
}

impl<C> CustomCommandRegistry<C> {
    pub fn new() -> Self {
        Self { entries: Vec::new() }
    }

    /// Register a top-level custom subcommand.
    pub fn register(&mut self, cmd: clap::Command, handler: HandlerFn<C>) {
        self.register_under::<&str>(&[], cmd, handler);
    }

    /// Register a custom subcommand under `path`. Empty path = top-level.
    pub fn register_under<S: AsRef<str>>(
        &mut self,
        path: &[S],
        cmd: clap::Command,
        handler: HandlerFn<C>,
    ) {
        let owned: Vec<String> = path.iter().map(|s| s.as_ref().to_string()).collect();
        self.entries.push((owned, cmd, handler));
    }

    /// Graft every registered command into `cli`, returning the augmented
    /// command tree. Custom commands replace spec-generated leaves on
    /// name collisions.
    pub fn graft_into(&self, mut cli: clap::Command) -> clap::Command {
        for (path, cmd, _) in &self.entries {
            cli = graft_subcommand(cli, path, cmd.clone());
        }
        cli
    }

    /// Walk the parsed `matches` tree along each registered command's
    /// path. If one matches, invoke its handler with `ctx` and return
    /// `Some(handler_result)`. Returns `None` if no custom command was
    /// invoked.
    pub fn dispatch(
        &self,
        matches: &clap::ArgMatches,
        ctx: &C,
    ) -> Option<Result<(), CliError>> {
        for (path, cmd, handler) in &self.entries {
            if let Some(target) = walk_matches_to_custom(matches, path, cmd.get_name()) {
                return Some(handler(target, ctx));
            }
        }
        None
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Crate-internal accessor used by unit tests in the protocol modules
    /// to verify registration shape.
    #[cfg(test)]
    #[doc(hidden)]
    pub(crate) fn entries(&self) -> &[Entry<C>] {
        &self.entries
    }
}

impl<C> Default for CustomCommandRegistry<C> {
    fn default() -> Self {
        Self::new()
    }
}

/// Graft a custom `clap::Command` into an existing command tree under
/// `parent_path`. The leaf name is `cmd.get_name()`.
///
/// Behavior:
/// - Walks down `parent_path` using `mut_subcommand`, recursively grafting.
/// - At any level where the named parent doesn't exist, creates it as a
///   bare subcommand so the path is reachable.
/// - At the leaf level, if a subcommand with the same name already exists
///   it is replaced by `cmd` (custom-wins on leaf collision).
pub fn graft_subcommand(
    parent: clap::Command,
    parent_path: &[String],
    cmd: clap::Command,
) -> clap::Command {
    if parent_path.is_empty() {
        let leaf_name = cmd.get_name().to_string();
        if parent.find_subcommand(&leaf_name).is_some() {
            parent.mut_subcommand(leaf_name, move |_existing| cmd)
        } else {
            parent.subcommand(cmd)
        }
    } else {
        let head = parent_path[0].clone();
        let rest: Vec<String> = parent_path[1..].to_vec();
        if parent.find_subcommand(&head).is_some() {
            parent.mut_subcommand(head, move |sub| graft_subcommand(sub, &rest, cmd))
        } else {
            let new_parent = clap::Command::new(head)
                .subcommand_required(true)
                .arg_required_else_help(true);
            let new_parent = graft_subcommand(new_parent, &rest, cmd);
            parent.subcommand(new_parent)
        }
    }
}

/// Walk a parsed `ArgMatches` tree along `parent_path` and return the leaf
/// matches if the final subcommand equals `leaf_name`. Returns `None` if
/// any segment along the path doesn't match.
pub fn walk_matches_to_custom<'a>(
    matches: &'a clap::ArgMatches,
    parent_path: &[String],
    leaf_name: &str,
) -> Option<&'a clap::ArgMatches> {
    let mut current = matches;
    for seg in parent_path {
        let (name, sub) = current.subcommand()?;
        if name != seg {
            return None;
        }
        current = sub;
    }
    let (name, sub) = current.subcommand()?;
    if name == leaf_name {
        Some(sub)
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct DummyCtx;

    fn dummy_handler(_m: &clap::ArgMatches, _c: &DummyCtx) -> Result<(), CliError> {
        Ok(())
    }

    #[test]
    fn graft_top_level_adds_command() {
        let cli = clap::Command::new("root").subcommand(clap::Command::new("existing"));
        let custom = clap::Command::new("custom");
        let grafted = graft_subcommand(cli, &[], custom);
        assert!(grafted.find_subcommand("existing").is_some());
        assert!(grafted.find_subcommand("custom").is_some());
    }

    #[test]
    fn graft_top_level_collision_replaces_leaf() {
        let cli = clap::Command::new("root")
            .subcommand(clap::Command::new("dup").about("from spec"));
        let custom = clap::Command::new("dup").about("from custom");
        let grafted = graft_subcommand(cli, &[], custom);
        let dup = grafted.find_subcommand("dup").unwrap();
        assert_eq!(dup.get_about().map(|s| s.to_string()).as_deref(), Some("from custom"));
    }

    #[test]
    fn graft_into_existing_parent_keeps_siblings() {
        let webhooks = clap::Command::new("webhooks")
            .subcommand(clap::Command::new("list"))
            .subcommand(clap::Command::new("create"));
        let cli = clap::Command::new("root").subcommand(webhooks);

        let verify = clap::Command::new("verify").about("custom");
        let grafted = graft_subcommand(cli, &["webhooks".to_string()], verify);

        let webhooks = grafted.find_subcommand("webhooks").unwrap();
        assert!(webhooks.find_subcommand("list").is_some());
        assert!(webhooks.find_subcommand("create").is_some());
        assert!(webhooks.find_subcommand("verify").is_some());
    }

    #[test]
    fn graft_leaf_collision_under_parent_replaces() {
        let webhooks = clap::Command::new("webhooks")
            .subcommand(clap::Command::new("list").about("spec"));
        let cli = clap::Command::new("root").subcommand(webhooks);
        let custom_list = clap::Command::new("list").about("custom");
        let grafted = graft_subcommand(cli, &["webhooks".to_string()], custom_list);
        let leaf = grafted
            .find_subcommand("webhooks")
            .unwrap()
            .find_subcommand("list")
            .unwrap();
        assert_eq!(leaf.get_about().map(|s| s.to_string()).as_deref(), Some("custom"));
    }

    #[test]
    fn graft_creates_missing_intermediate_parent() {
        let cli = clap::Command::new("root");
        let leaf = clap::Command::new("verify");
        let grafted = graft_subcommand(cli, &["new-parent".to_string()], leaf);
        let parent = grafted.find_subcommand("new-parent").unwrap();
        assert!(parent.find_subcommand("verify").is_some());
    }

    #[test]
    fn walk_matches_finds_leaf() {
        let cmd = clap::Command::new("root")
            .subcommand(clap::Command::new("webhooks").subcommand(clap::Command::new("verify")));
        let matches = cmd.get_matches_from(vec!["root", "webhooks", "verify"]);
        let result = walk_matches_to_custom(&matches, &["webhooks".to_string()], "verify");
        assert!(result.is_some());
    }

    #[test]
    fn walk_matches_misses_when_path_diverges() {
        let cmd = clap::Command::new("root")
            .subcommand(clap::Command::new("webhooks").subcommand(clap::Command::new("list")));
        let matches = cmd.get_matches_from(vec!["root", "webhooks", "list"]);
        let result = walk_matches_to_custom(&matches, &["webhooks".to_string()], "verify");
        assert!(result.is_none());
    }

    #[test]
    fn walk_matches_misses_when_parent_diverges() {
        let cmd = clap::Command::new("root")
            .subcommand(clap::Command::new("other").subcommand(clap::Command::new("verify")));
        let matches = cmd.get_matches_from(vec!["root", "other", "verify"]);
        let result = walk_matches_to_custom(&matches, &["webhooks".to_string()], "verify");
        assert!(result.is_none());
    }

    #[test]
    fn registry_registers_top_level_command() {
        let mut reg: CustomCommandRegistry<DummyCtx> = CustomCommandRegistry::new();
        reg.register(clap::Command::new("custom"), dummy_handler);
        assert_eq!(reg.len(), 1);
        assert!(reg.entries()[0].0.is_empty());
        assert_eq!(reg.entries()[0].1.get_name(), "custom");
    }

    #[test]
    fn registry_registers_under_path() {
        let mut reg: CustomCommandRegistry<DummyCtx> = CustomCommandRegistry::new();
        reg.register_under(&["webhooks"], clap::Command::new("verify"), dummy_handler);
        assert_eq!(reg.len(), 1);
        assert_eq!(reg.entries()[0].0, vec!["webhooks".to_string()]);
        assert_eq!(reg.entries()[0].1.get_name(), "verify");
    }

    #[test]
    fn registry_graft_into_grafts_all_entries() {
        let mut reg: CustomCommandRegistry<DummyCtx> = CustomCommandRegistry::new();
        reg.register(clap::Command::new("alpha"), dummy_handler);
        reg.register_under(&["webhooks"], clap::Command::new("verify"), dummy_handler);

        let cli = clap::Command::new("root");
        let grafted = reg.graft_into(cli);

        assert!(grafted.find_subcommand("alpha").is_some());
        let webhooks = grafted.find_subcommand("webhooks").unwrap();
        assert!(webhooks.find_subcommand("verify").is_some());
    }

    #[test]
    fn registry_dispatch_invokes_matching_handler() {
        use std::cell::Cell;
        // Use thread-local state so the fn pointer (which can't capture)
        // can record that it ran.
        thread_local! {
            static CALLED: Cell<bool> = const { Cell::new(false) };
        }
        fn handler(_m: &clap::ArgMatches, _c: &DummyCtx) -> Result<(), CliError> {
            CALLED.with(|c| c.set(true));
            Ok(())
        }

        let mut reg: CustomCommandRegistry<DummyCtx> = CustomCommandRegistry::new();
        reg.register_under(&["webhooks"], clap::Command::new("verify"), handler);

        let cli = clap::Command::new("root");
        let cli = reg.graft_into(cli);
        let matches = cli.get_matches_from(vec!["root", "webhooks", "verify"]);

        let result = reg.dispatch(&matches, &DummyCtx);
        assert!(result.is_some());
        assert!(result.unwrap().is_ok());
        assert!(CALLED.with(|c| c.get()));
    }

    #[test]
    fn registry_dispatch_returns_none_when_no_custom_invoked() {
        let mut reg: CustomCommandRegistry<DummyCtx> = CustomCommandRegistry::new();
        reg.register_under(&["webhooks"], clap::Command::new("verify"), dummy_handler);

        // Build a tree that has both a custom and a non-custom path.
        let cli = clap::Command::new("root")
            .subcommand(clap::Command::new("other").subcommand(clap::Command::new("thing")));
        let cli = reg.graft_into(cli);
        let matches = cli.get_matches_from(vec!["root", "other", "thing"]);

        let result = reg.dispatch(&matches, &DummyCtx);
        assert!(result.is_none());
    }
}
