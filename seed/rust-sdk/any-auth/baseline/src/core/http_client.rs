use crate::{join_url, ApiError, ClientConfig, OAuthTokenProvider, RequestOptions};
use futures::{Stream, StreamExt};
use reqwest::{
    header::{HeaderMap, HeaderName, HeaderValue},
    Client, Method, Request, Response,
};
use serde::de::DeserializeOwned;

use std::{
    pin::Pin,
    str::FromStr,
    sync::Arc,
    task::{Context, Poll},
};

/// A parsed HTTP response that includes the deserialized body along with
/// the HTTP status code and response headers.
#[derive(Debug)]
pub struct RawResponse<T> {
    /// The deserialized response body.
    pub body: T,
    /// The HTTP status code of the response.
    pub status_code: u16,
    /// The HTTP response headers.
    pub headers: HeaderMap,
}

/// A streaming byte stream for downloading files efficiently
pub struct ByteStream {
    content_length: Option<u64>,
    inner: Pin<Box<dyn Stream<Item = Result<bytes::Bytes, reqwest::Error>> + Send>>,
}

impl ByteStream {
    /// Create a new ByteStream from a Response
    pub(crate) fn new(response: Response) -> Self {
        let content_length = response.content_length();
        let stream = response.bytes_stream();

        Self {
            content_length,
            inner: Box::pin(stream),
        }
    }

    /// Collect the entire stream into a `Vec<u8>`
    ///
    /// This consumes the stream and buffers all data into memory.
    /// For large files, prefer using `try_next()` to process chunks incrementally.
    ///
    /// # Example
    /// ```no_run
    /// let stream = client.download_file().await?;
    /// let bytes = stream.collect().await?;
    /// ```
    pub async fn collect(mut self) -> Result<Vec<u8>, ApiError> {
        let mut result = Vec::new();
        while let Some(chunk) = self.inner.next().await {
            result.extend_from_slice(&chunk.map_err(ApiError::Network)?);
        }
        Ok(result)
    }

    /// Get the next chunk from the stream
    ///
    /// Returns `Ok(Some(bytes))` if a chunk is available,
    /// `Ok(None)` if the stream is finished, or an error.
    ///
    /// # Example
    /// ```no_run
    /// let mut stream = client.download_file().await?;
    /// while let Some(chunk) = stream.try_next().await? {
    ///     process_chunk(&chunk);
    /// }
    /// ```
    pub async fn try_next(&mut self) -> Result<Option<bytes::Bytes>, ApiError> {
        match self.inner.next().await {
            Some(Ok(bytes)) => Ok(Some(bytes)),
            Some(Err(e)) => Err(ApiError::Network(e)),
            None => Ok(None),
        }
    }

    /// Get the content length from response headers if available
    pub fn content_length(&self) -> Option<u64> {
        self.content_length
    }
}

impl Stream for ByteStream {
    type Item = Result<bytes::Bytes, ApiError>;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        match self.inner.as_mut().poll_next(cx) {
            Poll::Ready(Some(Ok(bytes))) => Poll::Ready(Some(Ok(bytes))),
            Poll::Ready(Some(Err(e))) => Poll::Ready(Some(Err(ApiError::Network(e)))),
            Poll::Ready(None) => Poll::Ready(None),
            Poll::Pending => Poll::Pending,
        }
    }
}

/// Configuration for OAuth token fetching.
///
/// This struct contains all the information needed to automatically fetch
/// and refresh OAuth tokens.
#[derive(Clone)]
pub struct OAuthConfig {
    /// The OAuth token provider that manages token caching and refresh
    pub token_provider: Arc<OAuthTokenProvider>,
    /// The token endpoint path (e.g., "/token")
    pub token_endpoint: String,
}

/// Response from an OAuth token endpoint.
#[derive(Debug, Clone, serde::Deserialize)]
struct OAuthTokenResponse {
    access_token: String,
    #[serde(default)]
    expires_in: Option<i64>,
}

/// Internal HTTP client that handles requests with authentication and retries
#[derive(Clone)]
pub struct HttpClient {
    client: Client,
    config: ClientConfig,
    /// Optional OAuth configuration for automatic token management
    oauth_config: Option<OAuthConfig>,
}

impl HttpClient {
    /// Creates a new HttpClient without OAuth support.
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Self::new_with_oauth(config, None)
    }

    /// Creates a new HttpClient with optional OAuth support.
    ///
    /// When `oauth_config` is provided, the client will automatically fetch and refresh
    /// OAuth tokens before making requests.
    pub fn new_with_oauth(
        config: ClientConfig,
        oauth_config: Option<OAuthConfig>,
    ) -> Result<Self, ApiError> {
        let client = Client::builder()
            .timeout(config.timeout)
            .user_agent(&config.user_agent)
            .build()
            .map_err(ApiError::Network)?;

        Ok(Self {
            client,
            config,
            oauth_config,
        })
    }

    /// Returns the configured base URL.
    pub fn base_url(&self) -> &str {
        &self.config.base_url
    }

    /// Returns a reference to the client configuration.
    pub fn config(&self) -> &ClientConfig {
        &self.config
    }

    /// Execute a request and return the parsed body along with HTTP status code and headers.
    ///
    /// Unlike `execute_request`, this method preserves the HTTP metadata from the response,
    /// which is useful for paginated endpoints where callers need access to status codes
    /// and headers alongside the deserialized body.
    pub async fn execute_request_raw<T>(
        &self,
        method: Method,
        path: &str,
        body: Option<serde_json::Value>,
        query_params: Option<Vec<(String, String)>>,
        options: Option<RequestOptions>,
    ) -> Result<RawResponse<T>, ApiError>
    where
        T: DeserializeOwned,
    {
        let url = join_url(&self.config.base_url, path);
        let mut request = self.client.request(method, &url);

        if let Some(params) = query_params {
            request = request.query(&params);
        }

        if let Some(opts) = &options {
            if !opts.additional_query_params.is_empty() {
                request = request.query(&opts.additional_query_params);
            }
        }

        if let Some(body) = body {
            request = request.json(&body);
        }

        let mut req = request.build().map_err(|e| ApiError::Network(e))?;

        self.apply_auth_headers(&mut req, &options).await?;
        self.apply_custom_headers(&mut req, &options)?;

        let response = self.execute_with_retries(req, &options).await?;
        self.parse_response_raw(response).await
    }

    /// Execute a request with the given method, path, and options
    pub async fn execute_request<T>(
        &self,
        method: Method,
        path: &str,
        body: Option<serde_json::Value>,
        query_params: Option<Vec<(String, String)>>,
        options: Option<RequestOptions>,
    ) -> Result<T, ApiError>
    where
        T: DeserializeOwned, // Generic T: DeserializeOwned means the response will be automatically deserialized into whatever type you specify:
    {
        let url = join_url(&self.config.base_url, path);
        let mut request = self.client.request(method, &url);

        // Apply query parameters if provided
        if let Some(params) = query_params {
            request = request.query(&params);
        }

        // Apply additional query parameters from options
        if let Some(opts) = &options {
            if !opts.additional_query_params.is_empty() {
                request = request.query(&opts.additional_query_params);
            }
        }

        // Apply body if provided
        if let Some(body) = body {
            request = request.json(&body);
        }

        // Build the request
        let mut req = request.build().map_err(|e| ApiError::Network(e))?;

        // Apply authentication and headers
        self.apply_auth_headers(&mut req, &options).await?;
        self.apply_custom_headers(&mut req, &options)?;

        // Execute with retries
        let response = self.execute_with_retries(req, &options).await?;
        self.parse_response(response).await
    }

    /// Execute a request with an explicit base URL override.
    ///
    /// Used for multi-URL environments where different endpoints
    /// resolve to different base URLs.
    pub async fn execute_request_with_base_url<T>(
        &self,
        base_url: &str,
        method: Method,
        path: &str,
        body: Option<serde_json::Value>,
        query_params: Option<Vec<(String, String)>>,
        options: Option<RequestOptions>,
    ) -> Result<T, ApiError>
    where
        T: DeserializeOwned,
    {
        let url = join_url(base_url, path);
        let mut request = self.client.request(method, &url);

        if let Some(params) = query_params {
            request = request.query(&params);
        }

        if let Some(opts) = &options {
            if !opts.additional_query_params.is_empty() {
                request = request.query(&opts.additional_query_params);
            }
        }

        if let Some(body) = body {
            request = request.json(&body);
        }

        let mut req = request.build().map_err(|e| ApiError::Network(e))?;

        self.apply_auth_headers(&mut req, &options).await?;
        self.apply_custom_headers(&mut req, &options)?;

        let response = self.execute_with_retries(req, &options).await?;
        self.parse_response(response).await
    }

    async fn apply_auth_headers(
        &self,
        request: &mut Request,
        options: &Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        let headers = request.headers_mut();

        // Apply API key (request options override config)
        let api_key = options
            .as_ref()
            .and_then(|opts| opts.api_key.as_ref())
            .or(self.config.api_key.as_ref());

        if let Some(key) = api_key {
            let header_value = key.to_string();
            headers.insert(
                "X-API-Key",
                header_value.parse().map_err(|_| ApiError::InvalidHeader)?,
            );
        }

        // Apply bearer token - priority: request options > OAuth > config
        let token = if let Some(opts) = options.as_ref() {
            if opts.token.is_some() {
                opts.token.clone()
            } else {
                None
            }
        } else {
            None
        };

        let token = match token {
            Some(t) => Some(t),
            None => {
                // Try OAuth token provider if configured
                if let Some(oauth_config) = &self.oauth_config {
                    Some(self.get_oauth_token(oauth_config).await?)
                } else {
                    // Fall back to static token from config
                    self.config.token.clone()
                }
            }
        };

        if let Some(token) = token {
            let auth_value = format!("Bearer {}", token);
            headers.insert(
                "Authorization",
                auth_value.parse().map_err(|_| ApiError::InvalidHeader)?,
            );
        }

        Ok(())
    }

    /// Fetches an OAuth token, using the cached token if valid or fetching a new one.
    async fn get_oauth_token(&self, oauth_config: &OAuthConfig) -> Result<String, ApiError> {
        let token_provider = &oauth_config.token_provider;
        let token_endpoint = &oauth_config.token_endpoint;
        let client_id = token_provider.client_id().to_string();
        let client_secret = token_provider.client_secret().to_string();
        let base_url = self.config.base_url.clone();

        // Use the async get_or_fetch method with a closure that fetches the token
        token_provider
            .get_or_fetch_async(|| async {
                self.fetch_oauth_token(&base_url, token_endpoint, &client_id, &client_secret)
                    .await
            })
            .await
    }

    /// Makes an HTTP request to the OAuth token endpoint to fetch a new token.
    async fn fetch_oauth_token(
        &self,
        base_url: &str,
        token_endpoint: &str,
        client_id: &str,
        client_secret: &str,
    ) -> Result<(String, u64), ApiError> {
        let url = join_url(base_url, token_endpoint);

        // Build the token request body
        let body = serde_json::json!({
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "client_credentials"
        });

        let response = self
            .client
            .request(Method::POST, &url)
            .json(&body)
            .send()
            .await
            .map_err(ApiError::Network)?;

        if !response.status().is_success() {
            let status_code = response.status().as_u16();
            let body = response.text().await.ok();
            return Err(ApiError::from_response(status_code, body.as_deref()));
        }

        // Parse the token response
        let token_response: OAuthTokenResponse =
            response.json().await.map_err(ApiError::Network)?;

        let expires_in = token_response.expires_in.unwrap_or(3600) as u64;
        Ok((token_response.access_token, expires_in))
    }

    fn apply_custom_headers(
        &self,
        request: &mut Request,
        options: &Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        let headers = request.headers_mut();

        // Apply config-level custom headers
        for (key, value) in &self.config.custom_headers {
            headers.insert(
                HeaderName::from_str(key).map_err(|_| ApiError::InvalidHeader)?,
                HeaderValue::from_str(value).map_err(|_| ApiError::InvalidHeader)?,
            );
        }

        // Apply request-level custom headers (override config)
        if let Some(options) = options {
            for (key, value) in &options.additional_headers {
                headers.insert(
                    HeaderName::from_str(key).map_err(|_| ApiError::InvalidHeader)?,
                    HeaderValue::from_str(value).map_err(|_| ApiError::InvalidHeader)?,
                );
            }
        }

        Ok(())
    }

    async fn execute_with_retries(
        &self,
        request: Request,
        options: &Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        let max_retries = options
            .as_ref()
            .and_then(|opts| opts.max_retries)
            .unwrap_or(self.config.max_retries);

        let mut last_error = None;

        for attempt in 0..=max_retries {
            let cloned_request = request.try_clone().ok_or(ApiError::RequestClone)?;

            match self.client.execute(cloned_request).await {
                Ok(response) if response.status().is_success() => return Ok(response),
                Ok(response) => {
                    let status_code = response.status().as_u16();
                    let body = response.text().await.ok();
                    return Err(ApiError::from_response(status_code, body.as_deref()));
                }
                Err(e) if attempt < max_retries => {
                    last_error = Some(e);
                    // Exponential backoff
                    let delay = std::time::Duration::from_millis(100 * 2_u64.pow(attempt));
                    tokio::time::sleep(delay).await;
                }
                Err(e) => return Err(ApiError::Network(e)),
            }
        }

        Err(ApiError::Network(last_error.unwrap()))
    }

    async fn parse_response<T>(&self, response: Response) -> Result<T, ApiError>
    where
        T: DeserializeOwned,
    {
        let status = response.status().as_u16();
        let text = response.text().await.map_err(ApiError::Network)?;

        // Handle empty response bodies (e.g., 202 Accepted for deferred requests)
        if text.is_empty() {
            return Err(ApiError::Http {
                status,
                message: String::new(),
            });
        }

        serde_json::from_str(&text).map_err(ApiError::Serialization)
    }

    async fn parse_response_raw<T>(&self, response: Response) -> Result<RawResponse<T>, ApiError>
    where
        T: DeserializeOwned,
    {
        let status_code = response.status().as_u16();
        let headers = response.headers().clone();
        let text = response.text().await.map_err(ApiError::Network)?;

        if text.is_empty() {
            return Err(ApiError::Http {
                status: status_code,
                message: String::new(),
            });
        }

        let body: T = serde_json::from_str(&text).map_err(ApiError::Serialization)?;
        Ok(RawResponse {
            body,
            status_code,
            headers,
        })
    }

    /// Execute a request and return a streaming response (for large file downloads)
    ///
    /// This method returns a `ByteStream` that can be used to download large files
    /// efficiently without loading the entire content into memory. The stream can be
    /// consumed chunk by chunk, written directly to disk, or collected into bytes.
    ///
    /// # Examples
    ///
    /// **Option 1: Collect all bytes into memory**
    /// ```no_run
    /// let stream = client.execute_stream_request(
    ///     Method::GET,
    ///     "/file",
    ///     None,
    ///     None,
    ///     None,
    /// ).await?;
    ///
    /// let bytes = stream.collect().await?;
    /// ```
    ///
    /// **Option 2: Process chunks with try_next()**
    /// ```no_run
    /// let mut stream = client.execute_stream_request(
    ///     Method::GET,
    ///     "/large-file",
    ///     None,
    ///     None,
    ///     None,
    /// ).await?;
    ///
    /// while let Some(chunk) = stream.try_next().await? {
    ///     process_chunk(&chunk);
    /// }
    /// ```
    ///
    /// **Option 3: Stream with futures::Stream trait**
    /// ```no_run
    /// use futures::StreamExt;
    ///
    /// let stream = client.execute_stream_request(
    ///     Method::GET,
    ///     "/large-file",
    ///     None,
    ///     None,
    ///     None,
    /// ).await?;
    ///
    /// let mut file = tokio::fs::File::create("output.mp4").await?;
    /// let mut stream = std::pin::pin!(stream);
    /// while let Some(chunk) = stream.next().await {
    ///     let chunk = chunk?;
    ///     tokio::io::AsyncWriteExt::write_all(&mut file, &chunk).await?;
    /// }
    /// ```
    pub async fn execute_stream_request(
        &self,
        method: Method,
        path: &str,
        body: Option<serde_json::Value>,
        query_params: Option<Vec<(String, String)>>,
        options: Option<RequestOptions>,
    ) -> Result<ByteStream, ApiError> {
        let url = join_url(&self.config.base_url, path);
        let mut request = self.client.request(method, &url);

        // Apply query parameters if provided
        if let Some(params) = query_params {
            request = request.query(&params);
        }

        // Apply additional query parameters from options
        if let Some(opts) = &options {
            if !opts.additional_query_params.is_empty() {
                request = request.query(&opts.additional_query_params);
            }
        }

        // Apply body if provided
        if let Some(body) = body {
            request = request.json(&body);
        }

        // Build the request
        let mut req = request.build().map_err(|e| ApiError::Network(e))?;

        // Apply authentication and headers
        self.apply_auth_headers(&mut req, &options).await?;
        self.apply_custom_headers(&mut req, &options)?;

        // Execute with retries
        let response = self.execute_with_retries(req, &options).await?;

        // Return streaming response
        Ok(ByteStream::new(response))
    }

    /// Execute a streaming request with an explicit base URL override.
    pub async fn execute_stream_request_with_base_url(
        &self,
        base_url: &str,
        method: Method,
        path: &str,
        body: Option<serde_json::Value>,
        query_params: Option<Vec<(String, String)>>,
        options: Option<RequestOptions>,
    ) -> Result<ByteStream, ApiError> {
        let url = join_url(base_url, path);
        let mut request = self.client.request(method, &url);

        if let Some(params) = query_params {
            request = request.query(&params);
        }

        if let Some(opts) = &options {
            if !opts.additional_query_params.is_empty() {
                request = request.query(&opts.additional_query_params);
            }
        }

        if let Some(body) = body {
            request = request.json(&body);
        }

        let mut req = request.build().map_err(|e| ApiError::Network(e))?;

        self.apply_auth_headers(&mut req, &options).await?;
        self.apply_custom_headers(&mut req, &options)?;

        let response = self.execute_with_retries(req, &options).await?;

        Ok(ByteStream::new(response))
    }
}
