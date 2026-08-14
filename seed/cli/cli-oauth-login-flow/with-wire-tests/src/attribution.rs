//! "Built with Fern" attribution.
//!
//! Two surfaces, chosen because they're the only moments a human reliably reads CLI output: the
//! root `--help` footer, and the line printed after `auth login` succeeds. Both go to stderr (help
//! excepted, since clap owns that stream) so they can never corrupt `<bin> … | jq`, and the login
//! line is skipped when stderr isn't a TTY so it stays out of CI logs.

use std::io::Write;

/// Marketing URL, tagged so CLI-sourced traffic is attributable.
const FERN_URL: &str = "https://buildwithfern.com";

/// Footer appended to the generated CLI's root `--help` output.
pub(crate) fn help_footer() -> String {
    format!("Built with Fern → {FERN_URL}")
}

/// Greet the user after a successful `auth login`.
pub(crate) fn print_login_welcome(display_name: &str) {
    use std::io::IsTerminal;
    if !std::io::stderr().is_terminal() {
        return;
    }
    let mut err = std::io::stderr().lock();
    let _ = writeln!(err, "{}", login_welcome(display_name));
}

/// Pure (no IO) so the copy can be unit-tested.
fn login_welcome(display_name: &str) -> String {
    // A display name like "ElevenLabs CLI" already carries the suffix; "the ElevenLabs CLI CLI!"
    // would not.
    let suffix = if display_name.to_lowercase().ends_with("cli") {
        ""
    } else {
        " CLI"
    };
    format!("Welcome to the {display_name}{suffix}! Built with Fern → {FERN_URL}")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn welcome_uses_the_display_name() {
        assert_eq!(
            login_welcome("ElevenLabs"),
            "Welcome to the ElevenLabs CLI! Built with Fern → https://buildwithfern.com"
        );
    }

    #[test]
    fn welcome_does_not_repeat_a_cli_suffix() {
        assert_eq!(
            login_welcome("ElevenLabs CLI"),
            "Welcome to the ElevenLabs CLI! Built with Fern → https://buildwithfern.com"
        );
    }

    #[test]
    fn help_footer_links_fern() {
        assert_eq!(help_footer(), "Built with Fern → https://buildwithfern.com");
    }
}
