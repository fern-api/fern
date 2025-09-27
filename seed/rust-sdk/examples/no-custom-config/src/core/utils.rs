/// URL building utilities
/// Safely join a base URL with a path, handling slashes properly
///
/// # Examples
/// ```
/// use example_api::utils::url::join_url;
///
/// assert_eq!(join_url("https://api.example.com", "users"), "https://api.example.com/users");
/// assert_eq!(join_url("https://api.example.com/", "users"), "https://api.example.com/users");
/// assert_eq!(join_url("https://api.example.com", "/users"), "https://api.example.com/users");
/// assert_eq!(join_url("https://api.example.com/", "/users"), "https://api.example.com/users");
/// ```
pub fn join_url(base_url: &str, path: &str) -> String {
    format!(
        "{}/{}",
        base_url.trim_end_matches('/'),
        path.trim_start_matches('/')
    )
}
