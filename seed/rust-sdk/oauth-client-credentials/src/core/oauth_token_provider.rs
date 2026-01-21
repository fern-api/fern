use std::sync::Mutex;
use std::time::{Duration, Instant};

/// Buffer time in seconds subtracted from token expiration to ensure
/// we refresh the token before it actually expires.
const EXPIRATION_BUFFER_SECONDS: u64 = 120; // 2 minutes

/// Default expiry time in seconds used when the OAuth response doesn't include an expires_in value.
const DEFAULT_EXPIRY_SECONDS: u64 = 3600; // 1 hour fallback

/// Manages OAuth access tokens, including caching and automatic refresh.
///
/// This provider implements thread-safe token management with automatic expiration
/// handling. It uses a double-checked locking pattern to minimize lock contention
/// while ensuring only one thread fetches a new token at a time.
///
/// # Example
///
/// ```rust,ignore
/// use crate::OAuthTokenProvider;
///
/// let provider = OAuthTokenProvider::new("client_id".to_string(), "client_secret".to_string());
///
/// // Get or fetch a token
/// let token = provider.get_or_fetch(|| {
///     // Your token fetching logic here
///     // Returns (access_token, expires_in_seconds)
///     Ok(("token".to_string(), 3600))
/// })?;
/// ```
pub struct OAuthTokenProvider {
    client_id: String,
    client_secret: String,
    inner: Mutex<OAuthTokenProviderInner>,
    /// Separate mutex to ensure only one thread fetches a new token at a time
    fetch_lock: Mutex<()>,
}

struct OAuthTokenProviderInner {
    access_token: Option<String>,
    expires_at: Option<Instant>,
}

impl OAuthTokenProvider {
    /// Creates a new OAuthTokenProvider with the given credentials.
    pub fn new(client_id: String, client_secret: String) -> Self {
        Self {
            client_id,
            client_secret,
            inner: Mutex::new(OAuthTokenProviderInner {
                access_token: None,
                expires_at: None,
            }),
            fetch_lock: Mutex::new(()),
        }
    }

    /// Returns the client ID.
    pub fn client_id(&self) -> &str {
        &self.client_id
    }

    /// Returns the client secret.
    pub fn client_secret(&self) -> &str {
        &self.client_secret
    }

    /// Sets the cached access token and its expiration time.
    ///
    /// The `expires_in` parameter is the number of seconds until the token expires.
    /// A buffer is applied to refresh before actual expiration.
    pub fn set_token(&self, access_token: String, expires_in: u64) {
        let mut inner = self.inner.lock().unwrap();
        inner.access_token = Some(access_token);

        if expires_in > 0 {
            // Apply buffer to refresh before actual expiration
            let effective_expires_in = expires_in.saturating_sub(EXPIRATION_BUFFER_SECONDS);
            inner.expires_at = Some(Instant::now() + Duration::from_secs(effective_expires_in));
        } else {
            // No expiration info, token won't auto-refresh based on time
            inner.expires_at = None;
        }
    }

    /// Returns the cached access token if it's still valid.
    ///
    /// Returns `None` if the token is expired or not set.
    pub fn get_token(&self) -> Option<String> {
        let inner = self.inner.lock().unwrap();

        if let Some(ref token) = inner.access_token {
            // Check if token is still valid
            if let Some(expires_at) = inner.expires_at {
                if Instant::now() < expires_at {
                    return Some(token.clone());
                }
            } else {
                // No expiration set, token is always valid
                return Some(token.clone());
            }
        }

        None
    }

    /// Returns a valid token, fetching a new one if necessary.
    ///
    /// The `fetch_func` is called at most once even if multiple threads call `get_or_fetch`
    /// concurrently when the token is expired. It should return `(access_token, expires_in_seconds)`.
    ///
    /// # Arguments
    ///
    /// * `fetch_func` - A function that fetches a new token. Returns `Result<(String, u64), E>`
    ///   where the tuple contains (access_token, expires_in_seconds).
    ///
    /// # Example
    ///
    /// ```rust,ignore
    /// let token = provider.get_or_fetch(|| {
    ///     // Call your OAuth endpoint here
    ///     let response = auth_client.get_token(&provider.client_id(), &provider.client_secret())?;
    ///     Ok((response.access_token, response.expires_in.unwrap_or(3600)))
    /// })?;
    /// ```
    pub fn get_or_fetch<F, E>(&self, fetch_func: F) -> Result<String, E>
    where
        F: FnOnce() -> Result<(String, u64), E>,
    {
        // Fast path: check if we have a valid token
        if let Some(token) = self.get_token() {
            return Ok(token);
        }

        // Slow path: acquire fetch lock to ensure only one thread fetches
        let _fetch_guard = self.fetch_lock.lock().unwrap();

        // Double-check after acquiring lock (another thread may have fetched)
        if let Some(token) = self.get_token() {
            return Ok(token);
        }

        // Fetch new token
        let (access_token, expires_in) = fetch_func()?;

        // Use default expiry if not provided
        let effective_expires_in = if expires_in > 0 {
            expires_in
        } else {
            DEFAULT_EXPIRY_SECONDS
        };

        self.set_token(access_token.clone(), effective_expires_in);
        Ok(access_token)
    }

    /// Returns `true` if the token needs to be refreshed.
    ///
    /// This is useful for proactively refreshing tokens before they expire.
    pub fn needs_refresh(&self) -> bool {
        let inner = self.inner.lock().unwrap();

        if inner.access_token.is_none() {
            return true;
        }

        if let Some(expires_at) = inner.expires_at {
            if Instant::now() >= expires_at {
                return true;
            }
        }

        false
    }

    /// Clears the cached token.
    ///
    /// This can be used to force a token refresh on the next request.
    pub fn reset(&self) {
        let mut inner = self.inner.lock().unwrap();
        inner.access_token = None;
        inner.expires_at = None;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::sync::Arc;
    use std::thread;

    #[test]
    fn test_new_provider() {
        let provider =
            OAuthTokenProvider::new("client_id".to_string(), "client_secret".to_string());
        assert_eq!(provider.client_id(), "client_id");
        assert_eq!(provider.client_secret(), "client_secret");
        assert!(provider.get_token().is_none());
        assert!(provider.needs_refresh());
    }

    #[test]
    fn test_set_and_get_token() {
        let provider =
            OAuthTokenProvider::new("client_id".to_string(), "client_secret".to_string());

        provider.set_token("test_token".to_string(), 3600);

        let token = provider.get_token();
        assert!(token.is_some());
        assert_eq!(token.unwrap(), "test_token");
        assert!(!provider.needs_refresh());
    }

    #[test]
    fn test_expired_token() {
        let provider =
            OAuthTokenProvider::new("client_id".to_string(), "client_secret".to_string());

        // Set token with 0 expiry (will be expired immediately due to buffer)
        provider.set_token("test_token".to_string(), 1);

        // Token should be expired (1 second - 120 second buffer = expired)
        assert!(provider.get_token().is_none());
        assert!(provider.needs_refresh());
    }

    #[test]
    fn test_get_or_fetch() {
        let provider =
            OAuthTokenProvider::new("client_id".to_string(), "client_secret".to_string());

        let result: Result<String, &str> =
            provider.get_or_fetch(|| Ok(("fetched_token".to_string(), 3600)));

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "fetched_token");

        // Second call should return cached token
        let result2: Result<String, &str> = provider.get_or_fetch(|| {
            panic!("Should not be called - token is cached");
        });

        assert!(result2.is_ok());
        assert_eq!(result2.unwrap(), "fetched_token");
    }

    #[test]
    fn test_reset() {
        let provider =
            OAuthTokenProvider::new("client_id".to_string(), "client_secret".to_string());

        provider.set_token("test_token".to_string(), 3600);
        assert!(provider.get_token().is_some());

        provider.reset();
        assert!(provider.get_token().is_none());
        assert!(provider.needs_refresh());
    }

    #[test]
    fn test_concurrent_access() {
        let provider = Arc::new(OAuthTokenProvider::new(
            "client_id".to_string(),
            "client_secret".to_string(),
        ));
        let fetch_count = Arc::new(AtomicUsize::new(0));

        let mut handles = vec![];

        for _ in 0..10 {
            let provider_clone = Arc::clone(&provider);
            let fetch_count_clone = Arc::clone(&fetch_count);

            let handle = thread::spawn(move || {
                let result: Result<String, &str> = provider_clone.get_or_fetch(|| {
                    fetch_count_clone.fetch_add(1, Ordering::SeqCst);
                    // Simulate some work
                    thread::sleep(Duration::from_millis(10));
                    Ok(("concurrent_token".to_string(), 3600))
                });

                assert!(result.is_ok());
                assert_eq!(result.unwrap(), "concurrent_token");
            });

            handles.push(handle);
        }

        for handle in handles {
            handle.join().unwrap();
        }

        // Due to double-checked locking, fetch should only be called once
        // (or at most a few times if threads race before the first fetch completes)
        let count = fetch_count.load(Ordering::SeqCst);
        assert!(count >= 1 && count <= 3, "Fetch was called {} times", count);
    }
}
