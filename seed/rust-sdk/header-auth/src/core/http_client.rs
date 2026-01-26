use crate::{join_url, ApiError, ClientConfig, OAuthTokenProvider, RequestOptions};
use futures::{Stream, StreamExt};
use reqwest::{
    header::{HeaderName, HeaderValue},
    Client, Method, Request, Response,
};
use serde::de::DeserializeOwned;
use std::{
    pin::Pin,
    str::FromStr,
    sync::Arc,
    task::{Context, Poll},
};

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

    /// Execute a multipart/form-data request with the given method, path, and options
    ///
    /// This method is used for file uploads using reqwest's built-in multipart support.
    /// Note: Multipart requests are not retried because they cannot be cloned.
    ///
    /// # Example
    /// ```no_run
    /// let form = reqwest::multipart::Form::new()
    ///     .part("file", reqwest::multipart::Part::bytes(vec![1, 2, 3]));
    ///
    /// let response: MyResponse = client.execute_multipart_request(
    ///     Method::POST,
    ///     "/upload",
    ///     form,
    ///     None,
    ///     None,
    /// ).await?;
    /// ```
    #[cfg(feature = "multipart")]
    pub async fn execute_multipart_request<T>(
        &self,
        method: Method,
        path: &str,
        form: reqwest::multipart::Form,
        query_params: Option<Vec<(String, String)>>,
        options: Option<RequestOptions>,
    ) -> Result<T, ApiError>
    where
        T: DeserializeOwned,
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

        // Use reqwest's built-in multipart support
        request = request.multipart(form);

        // Build the request
        let mut req = request.build().map_err(|e| ApiError::Network(e))?;

        // Apply authentication and headers
        self.apply_auth_headers(&mut req, &options).await?;
        self.apply_custom_headers(&mut req, &options)?;

        // Execute directly without retries (multipart requests cannot be cloned)
        let response = self.client.execute(req).await.map_err(ApiError::Network)?;

        // Check response status
        if !response.status().is_success() {
            let status_code = response.status().as_u16();
            let body = response.text().await.ok();
            return Err(ApiError::from_response(status_code, body.as_deref()));
        }

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
            headers.insert(
                "x-api-key",
                key.parse().map_err(|_| ApiError::InvalidHeader)?,
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
        let text = response.text().await.map_err(ApiError::Network)?;
        serde_json::from_str(&text).map_err(ApiError::Serialization)
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

    /// Execute a request and return an SSE stream
    ///
    /// This method returns an `SseStream<T>` that automatically parses
    /// Server-Sent Events and deserializes the JSON data in each event.
    ///
    /// # SSE-Specific Headers
    ///
    /// This method automatically sets the following headers **after** applying custom headers,
    /// which means these headers will override any user-supplied values:
    /// - `Accept: text/event-stream` - Required for SSE protocol
    /// - `Cache-Control: no-store` - Prevents caching of streaming responses
    ///
    /// This ensures proper SSE behavior even if custom headers are provided.
    ///
    /// # Example
    /// ```no_run
    /// use futures::StreamExt;
    ///
    /// let stream = client.execute_sse_request::<CompletionChunk>(
    ///     Method::POST,
    ///     "/stream",
    ///     Some(serde_json::json!({"query": "Hello"})),
    ///     None,
    ///     None,
    ///     Some("[[DONE]]".to_string()),
    /// ).await?;
    ///
    /// let mut stream = std::pin::pin!(stream);
    /// while let Some(chunk) = stream.next().await {
    ///     let chunk = chunk?;
    ///     println!("Received: {:?}", chunk);
    /// }
    /// ```
    #[cfg(feature = "sse")]
    pub async fn execute_sse_request<T>(
        &self,
        method: Method,
        path: &str,
        body: Option<serde_json::Value>,
        query_params: Option<Vec<(String, String)>>,
        options: Option<RequestOptions>,
        terminator: Option<String>,
    ) -> Result<crate::SseStream<T>, ApiError>
    where
        T: DeserializeOwned + Send + 'static,
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

        // SSE-specific headers
        req.headers_mut().insert(
            "Accept",
            "text/event-stream"
                .parse()
                .map_err(|_| ApiError::InvalidHeader)?,
        );
        req.headers_mut().insert(
            "Cache-Control",
            "no-store".parse().map_err(|_| ApiError::InvalidHeader)?,
        );

        // Execute with retries
        let response = self.execute_with_retries(req, &options).await?;

        // Return SSE stream
        crate::SseStream::new(response, terminator).await
    }
}
