use url::Url;

const LOCALHOST_HOSTS: &[&str] = &["localhost", "127.0.0.1", "[::1]"];

/// Validates that the URL uses HTTPS for non-localhost hosts.
/// Returns an error if the URL uses HTTP for a non-localhost host,
/// preventing accidental transmission of credentials in plaintext.
pub fn validate_https(raw_url: &str) -> Result<(), String> {
    let parsed = match Url::parse(raw_url) {
        Ok(u) => u,
        Err(_) => return Ok(()),
    };
    if parsed.scheme() != "http" {
        return Ok(());
    }
    let host = parsed.host_str().unwrap_or("");
    if LOCALHOST_HOSTS.contains(&host) {
        return Ok(());
    }
    Err(format!(
        "Refusing to send request to non-HTTPS URL: {}. HTTP is only allowed for localhost. Use HTTPS or pass a localhost URL.",
        raw_url
    ))
}

/// URL building utilities
/// Safely join a base URL with a path, handling slashes properly
///
/// # Examples
/// ```
/// use example_api::utils::url::join_url;
///
/// assert_eq!(join_url("https://api.example.com", "users").unwrap(), "https://api.example.com/users");
/// assert_eq!(join_url("https://api.example.com/", "users").unwrap(), "https://api.example.com/users");
/// assert_eq!(join_url("https://api.example.com", "/users").unwrap(), "https://api.example.com/users");
/// assert_eq!(join_url("https://api.example.com/", "/users").unwrap(), "https://api.example.com/users");
/// ```
pub fn join_url(base_url: &str, path: &str) -> Result<String, String> {
    let url = format!(
        "{}/{}",
        base_url.trim_end_matches('/'),
        path.trim_start_matches('/')
    );
    validate_https(&url)?;
    Ok(url)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_join_url_no_slashes() {
        assert_eq!(
            join_url("https://api.example.com", "users").unwrap(),
            "https://api.example.com/users"
        );
    }

    #[test]
    fn test_join_url_trailing_slash_on_base() {
        assert_eq!(
            join_url("https://api.example.com/", "users").unwrap(),
            "https://api.example.com/users"
        );
    }

    #[test]
    fn test_join_url_leading_slash_on_path() {
        assert_eq!(
            join_url("https://api.example.com", "/users").unwrap(),
            "https://api.example.com/users"
        );
    }

    #[test]
    fn test_join_url_both_slashes() {
        assert_eq!(
            join_url("https://api.example.com/", "/users").unwrap(),
            "https://api.example.com/users"
        );
    }

    #[test]
    fn test_join_url_multi_segment_path() {
        assert_eq!(
            join_url("https://api.example.com", "v1/users/123").unwrap(),
            "https://api.example.com/v1/users/123"
        );
    }

    #[test]
    fn test_join_url_empty_path() {
        assert_eq!(
            join_url("https://api.example.com", "").unwrap(),
            "https://api.example.com/"
        );
    }

    #[test]
    fn test_join_url_empty_base() {
        assert_eq!(join_url("", "users").unwrap(), "/users");
    }

    #[test]
    fn test_validate_https_allows_https() {
        assert!(validate_https("https://api.example.com").is_ok());
    }

    #[test]
    fn test_validate_https_allows_localhost() {
        assert!(validate_https("http://localhost:8080").is_ok());
        assert!(validate_https("http://127.0.0.1:3000").is_ok());
        assert!(validate_https("http://[::1]:8080").is_ok());
    }

    #[test]
    fn test_validate_https_rejects_http() {
        assert!(validate_https("http://api.example.com").is_err());
    }
}
