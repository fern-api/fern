//! `docs` subcommand — surfaces documentation resources from the CLI.
//!
//! Conditionally grafted onto `CliApp` when a docs base URL is
//! configured. Exposes:
//!   - `docs` (bare): lists all docs resources (human table / `--format json`)
//!   - `docs open`: opens the docs site in a browser
//!   - `docs mcp`: prints MCP endpoint + connection instructions
//!   - `docs llms [--full]`: prints the `llms.txt` or `llms-full.txt` URL
//!
//! All commands print **URLs**, not fetched contents (v1 contract).

use std::io::IsTerminal;

use clap::{Arg, ArgAction, ArgMatches, Command};
use serde_json::json;

use crate::error::CliError;

/// Configuration for the `docs` command. Passed to `CliApp` at build
/// time; only the `docs_url` is required — MCP endpoint is optional.
#[derive(Debug, Clone)]
pub struct DocsConfig {
    /// The docs site base URL (e.g. `https://elevenlabs.io/docs`).
    pub docs_url: String,
    /// Optional MCP server endpoint URL.
    pub mcp_url: Option<String>,
}

impl DocsConfig {
    /// Create a new DocsConfig with a required docs base URL.
    pub fn new(docs_url: &str) -> Self {
        Self {
            docs_url: docs_url.to_string(),
            mcp_url: None,
        }
    }

    /// Set the optional MCP endpoint URL.
    pub fn mcp_url(mut self, url: &str) -> Self {
        self.mcp_url = Some(url.to_string());
        self
    }

    /// Derive the `llms.txt` URL from the docs base URL.
    pub fn llms_txt_url(&self) -> String {
        format!("{}/llms.txt", self.docs_url.trim_end_matches('/'))
    }

    /// Derive the `llms-full.txt` URL from the docs base URL.
    pub fn llms_full_txt_url(&self) -> String {
        format!("{}/llms-full.txt", self.docs_url.trim_end_matches('/'))
    }
}

/// Build the `docs` subcommand tree.
pub fn build_docs_command(config: &DocsConfig) -> Command {
    let mut cmd = Command::new("docs")
        .about("Documentation resources — site, LLMs context, MCP server")
        .arg(
            Arg::new("format")
                .long("format")
                .help("Output format: json, table. Default: table when stdout is a TTY, json when piped")
                .value_name("FORMAT"),
        );

    cmd = cmd.subcommand(
        Command::new("open").about("Open the docs site in a browser"),
    );

    cmd = cmd.subcommand(
        Command::new("llms")
            .about("Print the llms.txt URL (LLM-optimized documentation)")
            .arg(
                Arg::new("full")
                    .long("full")
                    .action(ArgAction::SetTrue)
                    .help("Print the llms-full.txt URL instead (complete documentation)"),
            ),
    );

    if config.mcp_url.is_some() {
        cmd = cmd.subcommand(
            Command::new("mcp").about("Print the MCP server endpoint and connection instructions"),
        );
    }

    cmd
}

/// Dispatch into the matched `docs` subcommand.
pub fn dispatch_docs<W: std::io::Write>(
    matches: &ArgMatches,
    config: &DocsConfig,
    out: &mut W,
) -> Result<(), CliError> {
    match matches.subcommand() {
        Some(("open", _)) => handle_open(config),
        Some(("llms", m)) => handle_llms(m, config, out),
        Some(("mcp", _)) => handle_mcp(config, out),
        _ => handle_list(matches, config, out),
    }
}

/// `docs` (bare): list all available resources.
fn handle_list<W: std::io::Write>(
    matches: &ArgMatches,
    config: &DocsConfig,
    out: &mut W,
) -> Result<(), CliError> {
    let format = matches.get_one::<String>("format").map(|s| s.as_str());
    let use_json = match format {
        Some("json") => true,
        Some("table") => false,
        Some(other) => {
            return Err(CliError::Validation(format!(
                "unsupported format for docs: '{other}'. Use 'json' or 'table'."
            )));
        }
        None => !std::io::stdout().is_terminal(),
    };

    if use_json {
        let value = docs_json(config);
        writeln!(
            out,
            "{}",
            serde_json::to_string_pretty(&value)
                .map_err(|e| CliError::Other(e.into()))?
        )
        .map_err(|e| CliError::Other(e.into()))?;
    } else {
        write_table(config, out)?;
    }
    Ok(())
}

/// `docs open`: open docs site in a browser.
fn handle_open(config: &DocsConfig) -> Result<(), CliError> {
    eprintln!("Opening {}…", config.docs_url);
    open_browser(&config.docs_url)
}

/// `docs llms [--full]`: print llms.txt or llms-full.txt URL.
fn handle_llms<W: std::io::Write>(
    matches: &ArgMatches,
    config: &DocsConfig,
    out: &mut W,
) -> Result<(), CliError> {
    let full = matches.get_flag("full");
    let url = if full {
        config.llms_full_txt_url()
    } else {
        config.llms_txt_url()
    };
    writeln!(out, "{url}").map_err(|e| CliError::Other(e.into()))?;
    Ok(())
}

/// `docs mcp`: print MCP endpoint + connection instructions.
fn handle_mcp<W: std::io::Write>(
    config: &DocsConfig,
    out: &mut W,
) -> Result<(), CliError> {
    match &config.mcp_url {
        Some(url) => {
            writeln!(out, "MCP Server Endpoint: {url}").map_err(|e| CliError::Other(e.into()))?;
            writeln!(out).map_err(|e| CliError::Other(e.into()))?;
            writeln!(out, "Connect with:").map_err(|e| CliError::Other(e.into()))?;
            writeln!(out, "  {{").map_err(|e| CliError::Other(e.into()))?;
            writeln!(out, "    \"mcpServers\": {{").map_err(|e| CliError::Other(e.into()))?;
            writeln!(out, "      \"docs\": {{").map_err(|e| CliError::Other(e.into()))?;
            writeln!(out, "        \"url\": \"{url}\"").map_err(|e| CliError::Other(e.into()))?;
            writeln!(out, "      }}").map_err(|e| CliError::Other(e.into()))?;
            writeln!(out, "    }}").map_err(|e| CliError::Other(e.into()))?;
            writeln!(out, "  }}").map_err(|e| CliError::Other(e.into()))?;
            Ok(())
        }
        None => Err(CliError::Discovery(
            "No MCP endpoint configured for this CLI.".to_string(),
        )),
    }
}

/// Build the JSON object for bare `docs --format json` and `--schema`.
pub fn docs_json(config: &DocsConfig) -> serde_json::Value {
    let mut obj = serde_json::Map::new();
    obj.insert("docs_url".into(), json!(config.docs_url));
    obj.insert("llms_txt".into(), json!(config.llms_txt_url()));
    obj.insert("llms_full_txt".into(), json!(config.llms_full_txt_url()));
    if let Some(ref mcp) = config.mcp_url {
        obj.insert("mcp".into(), json!(mcp));
    }
    serde_json::Value::Object(obj)
}

/// Write a human-readable table of docs resources.
fn write_table<W: std::io::Write>(
    config: &DocsConfig,
    out: &mut W,
) -> Result<(), CliError> {
    writeln!(out, "Documentation Resources").map_err(|e| CliError::Other(e.into()))?;
    writeln!(out, "───────────────────────").map_err(|e| CliError::Other(e.into()))?;
    writeln!(out, "  Docs site:      {}", config.docs_url).map_err(|e| CliError::Other(e.into()))?;
    writeln!(out, "  llms.txt:       {}", config.llms_txt_url()).map_err(|e| CliError::Other(e.into()))?;
    writeln!(out, "  llms-full.txt:  {}", config.llms_full_txt_url()).map_err(|e| CliError::Other(e.into()))?;
    if let Some(ref mcp) = config.mcp_url {
        writeln!(out, "  MCP server:     {mcp}").map_err(|e| CliError::Other(e.into()))?;
    }
    writeln!(out).map_err(|e| CliError::Other(e.into()))?;
    writeln!(out, "Use 'docs open' to open in a browser, 'docs llms' for LLM context URLs.").map_err(|e| CliError::Other(e.into()))?;
    Ok(())
}

/// Open a URL in the default browser. Cross-platform.
fn open_browser(url: &str) -> Result<(), CliError> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(url)
            .spawn()
            .map_err(|e| CliError::Other(e.into()))?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(url)
            .spawn()
            .map_err(|e| CliError::Other(e.into()))?;
    }
    #[cfg(target_os = "windows")]
    {
        // Use `start ""` so the URL is treated as a parameter to `start`,
        // not parsed by cmd.exe. The empty string is the window title.
        std::process::Command::new("cmd")
            .args(["/C", "start", "", url])
            .spawn()
            .map_err(|e| CliError::Other(e.into()))?;
    }
    Ok(())
}

// ── Tests ───────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_llms_txt_url_no_trailing_slash() {
        let config = DocsConfig::new("https://elevenlabs.io/docs");
        assert_eq!(config.llms_txt_url(), "https://elevenlabs.io/docs/llms.txt");
        assert_eq!(config.llms_full_txt_url(), "https://elevenlabs.io/docs/llms-full.txt");
    }

    #[test]
    fn test_llms_txt_url_with_trailing_slash() {
        let config = DocsConfig::new("https://elevenlabs.io/docs/");
        assert_eq!(config.llms_txt_url(), "https://elevenlabs.io/docs/llms.txt");
        assert_eq!(config.llms_full_txt_url(), "https://elevenlabs.io/docs/llms-full.txt");
    }

    #[test]
    fn test_docs_json_without_mcp() {
        let config = DocsConfig::new("https://example.com/docs");
        let value = docs_json(&config);
        let obj = value.as_object().unwrap();
        assert_eq!(obj.get("docs_url").unwrap(), "https://example.com/docs");
        assert_eq!(obj.get("llms_txt").unwrap(), "https://example.com/docs/llms.txt");
        assert_eq!(obj.get("llms_full_txt").unwrap(), "https://example.com/docs/llms-full.txt");
        assert!(obj.get("mcp").is_none());
    }

    #[test]
    fn test_docs_json_with_mcp() {
        let config = DocsConfig::new("https://example.com/docs")
            .mcp_url("https://mcp.example.com/sse");
        let value = docs_json(&config);
        let obj = value.as_object().unwrap();
        assert_eq!(obj.get("mcp").unwrap(), "https://mcp.example.com/sse");
    }

    #[test]
    fn test_dispatch_llms_default() {
        let config = DocsConfig::new("https://example.com/docs");
        let cmd = build_docs_command(&config);
        let matches = cmd.try_get_matches_from(["docs", "llms"]).unwrap();
        let mut buf = Vec::new();
        dispatch_docs(&matches, &config, &mut buf).unwrap();
        let output = String::from_utf8(buf).unwrap();
        assert_eq!(output.trim(), "https://example.com/docs/llms.txt");
    }

    #[test]
    fn test_dispatch_llms_full() {
        let config = DocsConfig::new("https://example.com/docs");
        let cmd = build_docs_command(&config);
        let matches = cmd.try_get_matches_from(["docs", "llms", "--full"]).unwrap();
        let mut buf = Vec::new();
        dispatch_docs(&matches, &config, &mut buf).unwrap();
        let output = String::from_utf8(buf).unwrap();
        assert_eq!(output.trim(), "https://example.com/docs/llms-full.txt");
    }

    #[test]
    fn test_dispatch_mcp() {
        let config = DocsConfig::new("https://example.com/docs")
            .mcp_url("https://mcp.example.com/sse");
        let cmd = build_docs_command(&config);
        let matches = cmd.try_get_matches_from(["docs", "mcp"]).unwrap();
        let mut buf = Vec::new();
        dispatch_docs(&matches, &config, &mut buf).unwrap();
        let output = String::from_utf8(buf).unwrap();
        assert!(output.contains("https://mcp.example.com/sse"));
        assert!(output.contains("mcpServers"));
    }

    #[test]
    fn test_dispatch_bare_json() {
        let config = DocsConfig::new("https://example.com/docs")
            .mcp_url("https://mcp.example.com/sse");
        let cmd = build_docs_command(&config);
        let matches = cmd.try_get_matches_from(["docs", "--format", "json"]).unwrap();
        let mut buf = Vec::new();
        dispatch_docs(&matches, &config, &mut buf).unwrap();
        let output = String::from_utf8(buf).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&output).unwrap();
        assert_eq!(parsed["docs_url"], "https://example.com/docs");
        assert_eq!(parsed["mcp"], "https://mcp.example.com/sse");
    }

    #[test]
    fn test_dispatch_bare_table() {
        let config = DocsConfig::new("https://example.com/docs");
        let cmd = build_docs_command(&config);
        let matches = cmd.try_get_matches_from(["docs", "--format", "table"]).unwrap();
        let mut buf = Vec::new();
        dispatch_docs(&matches, &config, &mut buf).unwrap();
        let output = String::from_utf8(buf).unwrap();
        assert!(output.contains("Documentation Resources"));
        assert!(output.contains("https://example.com/docs"));
    }
}
