use crate::{join_url, ApiError, ClientConfig, OAuthTokenProvider, RequestOptions};
use futures::{future::BoxFuture, Stream, StreamExt};
use reqwest::{
    header::{HeaderMap, HeaderName, HeaderValue},
    Client, Method, Request, Response,
};
use serde::de::DeserializeOwned;

use std::{
    collections::HashMap,
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

/// Trait for executing HTTP requests, enabling injection of custom
/// transport implementations (e.g., for CLI execution-sharing).
///
/// When an external executor is provided, the SDK delegates raw HTTP
/// execution to it, allowing the caller's transport stack to handle
/// auth, retries, and TLS configuration.
#[doc(hidden)]
pub trait RequestExecutor: Send + Sync {
    fn execute(
        &self,
        request: Request,
    ) -> BoxFuture<'_, Result<Response, Box<dyn std::error::Error + Send + Sync>>>;
}

/// Wire-level property-name mapping for the OAuth token exchange.
///
/// The token endpoint's request/response contract varies between APIs (e.g. camelCase
/// `clientId`/`clientSecret`, an absent `grant_type`, or a non-standard `access_token`
/// field name). These names are resolved from the API's OAuth scheme in the IR so the
/// generated token fetch matches the endpoint's contract instead of hardcoding a shape.
#[derive(Debug, Clone)]
pub struct OAuthTokenExchangeConfig {
    /// Request body field name carrying the client id (e.g. `"client_id"` or `"clientId"`).
    pub client_id_property: String,
    /// Request body field name carrying the client secret.
    pub client_secret_property: String,
    /// Additional static request body properties sent verbatim (e.g.
    /// `{"grant_type": "client_credentials"}`). Empty when the token contract has none.
    pub extra_request_properties: HashMap<String, String>,
    /// Response field name that holds the access token (e.g. `"access_token"`).
    pub access_token_property: String,
    /// Response field name that holds the token lifetime in seconds (e.g. `"expires_in"`).
    pub expires_in_property: String,
    /// Whether the token request body is `application/x-www-form-urlencoded` (per RFC 6749
    /// §4.4.2) instead of JSON. Resolved from the token endpoint's declared content type in
    /// the API definition, so JSON token endpoints keep sending a JSON body.
    pub form_encoded: bool,
}

impl Default for OAuthTokenExchangeConfig {
    fn default() -> Self {
        Self {
            client_id_property: "client_id".to_string(),
            client_secret_property: "client_secret".to_string(),
            extra_request_properties: HashMap::from([(
                "grant_type".to_string(),
                "client_credentials".to_string(),
            )]),
            access_token_property: "access_token".to_string(),
            expires_in_property: "expires_in".to_string(),
            form_encoded: false,
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
    /// The request/response property-name mapping for the token exchange.
    pub exchange: OAuthTokenExchangeConfig,
}

/// Internal HTTP client that handles requests with authentication and retries
#[derive(Clone)]
pub struct HttpClient {
    client: Client,
    executor: Option<Arc<dyn RequestExecutor>>,
    config: ClientConfig,
    /// Optional OAuth configuration for automatic token management
    oauth_config: Option<OAuthConfig>,
}

impl HttpClient {
    /// Creates a new HttpClient, enabling OAuth automatically when the configuration
    /// provides an OAuth token endpoint together with client credentials.
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let oauth_config = match (
            config.oauth_token_endpoint.as_ref(),
            config.client_id.as_ref(),
            config.client_secret.as_ref(),
        ) {
            (Some(token_endpoint), Some(client_id), Some(client_secret)) => Some(OAuthConfig {
                token_provider: Arc::new(OAuthTokenProvider::new(
                    client_id.clone(),
                    client_secret.clone(),
                )),
                token_endpoint: token_endpoint.clone(),
                exchange: config.oauth_token_exchange.clone().unwrap_or_default(),
            }),
            _ => None,
        };
        Self::new_with_oauth(config, oauth_config)
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
            executor: None,
            config,
            oauth_config,
        })
    }

    /// Creates an HttpClient with an injected request executor.
    ///
    /// When using an injected executor, the client delegates HTTP execution
    /// entirely to the executor. Auth headers, custom headers, and retry
    /// logic are NOT applied by this client — the executor's transport
    /// stack is expected to handle them. This prevents double-retry and
    /// double-auth when the SDK is embedded inside a CLI.
    #[doc(hidden)]
    pub fn with_executor(executor: Arc<dyn RequestExecutor>, config: ClientConfig) -> Self {
        let client = Client::new();
        Self {
            client,
            executor: Some(executor),
            config,
            oauth_config: None,
        }
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

        let req = request.build().map_err(|e| ApiError::Network(e))?;

        let response = self.send_request(req, &options).await?;
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

        let req = request.build().map_err(|e| ApiError::Network(e))?;

        let response = self.send_request(req, &options).await?;
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

        let req = request.build().map_err(|e| ApiError::Network(e))?;

        let response = self.send_request(req, &options).await?;
        self.parse_response(response).await
    }

    /// Applies auth/headers and executes the request, choosing between
    /// the injected executor path (no SDK-level auth/headers/retries)
    /// and the default path (full SDK behavior).
    async fn send_request(
        &self,
        req: Request,
        options: &Option<RequestOptions>,
    ) -> Result<Response, ApiError> {
        if let Some(executor) = &self.executor {
            executor.execute(req).await.map_err(ApiError::Executor)
        } else {
            let mut req = req;
            self.apply_auth_headers(&mut req, options).await?;
            self.apply_custom_headers(&mut req, options)?;
            self.execute_with_retries(req, options).await
        }
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
                "api_key",
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

        let exchange = &oauth_config.exchange;

        // Use the async get_or_fetch method with a closure that fetches the token
        token_provider
            .get_or_fetch_async(|| async {
                self.fetch_oauth_token(
                    &base_url,
                    token_endpoint,
                    &client_id,
                    &client_secret,
                    exchange,
                )
                .await
            })
            .await
    }

    /// Makes an HTTP request to the OAuth token endpoint to fetch a new token.
    ///
    /// The request body and response are keyed by the property names configured on the
    /// API's OAuth scheme (via `exchange`), so non-standard token contracts (e.g. camelCase
    /// field names or an absent `grant_type`) are honored instead of a hardcoded shape.
    ///
    /// Config-level custom headers are applied to the token request, since gateways often
    /// require them on the token endpoint too. Request-level headers are deliberately not
    /// applied: the token is cached and shared across requests, so it must not depend on the
    /// options of whichever request happens to trigger the fetch. Auth headers are also not
    /// applied, as this request is what produces the credential they would carry.
    ///
    /// The body is encoded to match the token endpoint's declared content type: form-encoded
    /// (`application/x-www-form-urlencoded`, per RFC 6749 §4.4.2) when `exchange.form_encoded`
    /// is set, otherwise JSON.
    async fn fetch_oauth_token(
        &self,
        base_url: &str,
        token_endpoint: &str,
        client_id: &str,
        client_secret: &str,
        exchange: &OAuthTokenExchangeConfig,
    ) -> Result<(String, u64), ApiError> {
        let url = join_url(base_url, token_endpoint);

        // Collect the token request properties (keyed by the configured names) as ordered
        // key/value pairs, then encode them as form or JSON depending on the endpoint.
        let mut params: Vec<(String, String)> = Vec::new();
        params.push((exchange.client_id_property.clone(), client_id.to_string()));
        params.push((
            exchange.client_secret_property.clone(),
            client_secret.to_string(),
        ));
        for (name, value) in &exchange.extra_request_properties {
            params.push((name.clone(), value.clone()));
        }

        let builder = self.client.request(Method::POST, &url);
        let builder = if exchange.form_encoded {
            builder.form(&params)
        } else {
            let body = params
                .into_iter()
                .map(|(name, value)| (name, serde_json::Value::String(value)))
                .collect::<serde_json::Map<String, serde_json::Value>>();
            builder.json(&serde_json::Value::Object(body))
        };
        let mut request = builder.build().map_err(ApiError::Network)?;
        self.apply_custom_headers(&mut request, &None)?;

        let response = self
            .client
            .execute(request)
            .await
            .map_err(ApiError::Network)?;

        let status_code = response.status().as_u16();
        if !response.status().is_success() {
            let body = response.text().await.ok();
            return Err(ApiError::from_response(status_code, body.as_deref()));
        }

        // Parse the token response using the configured property names.
        let token_response: serde_json::Value = response.json().await.map_err(ApiError::Network)?;

        let access_token = token_response
            .get(&exchange.access_token_property)
            .and_then(|value| value.as_str())
            .ok_or_else(|| ApiError::Http {
                status: status_code,
                message: "OAuth token response is missing the access token".to_string(),
            })?
            .to_string();

        let expires_in = token_response
            .get(&exchange.expires_in_property)
            .and_then(|value| value.as_i64())
            .unwrap_or(3600) as u64;

        Ok((access_token, expires_in))
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
                Ok(response)
                    if attempt < max_retries
                        && Self::is_retryable_status(response.status().as_u16()) =>
                {
                    // Exponential backoff for retryable HTTP status codes
                    let delay = std::time::Duration::from_millis(100 * 2_u64.pow(attempt));
                    tokio::time::sleep(delay).await;
                }
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

    fn is_retryable_status(status_code: u16) -> bool {
        [408, 429].contains(&status_code) || status_code >= 500
    }

    async fn parse_response<T>(&self, response: Response) -> Result<T, ApiError>
    where
        T: DeserializeOwned,
    {
        let status = response.status().as_u16();
        let text = response.text().await.map_err(ApiError::Network)?;

        if text.is_empty() {
            if status >= 400 {
                return Err(ApiError::Http {
                    status,
                    message: String::new(),
                });
            }
            return serde_json::from_value(serde_json::Value::Null).map_err(|_| ApiError::Http {
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
            if status_code >= 400 {
                return Err(ApiError::Http {
                    status: status_code,
                    message: String::new(),
                });
            }
            return serde_json::from_value(serde_json::Value::Null)
                .map(|body| RawResponse {
                    body,
                    status_code,
                    headers,
                })
                .map_err(|_| ApiError::Http {
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
        let req = request.build().map_err(|e| ApiError::Network(e))?;

        let response = self.send_request(req, &options).await?;

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

        let req = request.build().map_err(|e| ApiError::Network(e))?;

        let response = self.send_request(req, &options).await?;

        Ok(ByteStream::new(response))
    }

    /// Execute a request and return an SSE stream
    ///
    /// This method returns an `SseStream<T>` that automatically parses
    /// Server-Sent Events and deserializes the JSON data in each event.
    ///
    /// # SSE-Specific Headers
    ///
    /// In the default path, these headers are applied **after** custom headers,
    /// which means they will override any user-supplied values:
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

        // Determine per-event timeout: request-level overrides client-level
        let timeout = options
            .as_ref()
            .and_then(|opts| opts.timeout_seconds)
            .map(std::time::Duration::from_secs)
            .unwrap_or(self.config.timeout);

        let response = if let Some(executor) = &self.executor {
            // SSE-specific headers for the executor path
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
            executor.execute(req).await.map_err(ApiError::Executor)?
        } else {
            self.apply_auth_headers(&mut req, &options).await?;
            self.apply_custom_headers(&mut req, &options)?;
            // SSE-specific headers applied after custom headers to ensure
            // proper SSE behavior even if custom headers are provided
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
            self.execute_with_retries(req, &options).await?
        };

        // Return SSE stream with per-event timeout
        crate::SseStream::new(response, terminator, timeout).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_retryable_status() {
        // Retryable 4xx
        assert!(HttpClient::is_retryable_status(408));
        assert!(HttpClient::is_retryable_status(429));

        // Retryable 5xx (>= 500)
        assert!(HttpClient::is_retryable_status(500));
        assert!(HttpClient::is_retryable_status(501));
        assert!(HttpClient::is_retryable_status(502));
        assert!(HttpClient::is_retryable_status(503));
        assert!(HttpClient::is_retryable_status(504));
        assert!(HttpClient::is_retryable_status(599));

        // Success and other 4xx codes are NOT retryable
        assert!(!HttpClient::is_retryable_status(200));
        assert!(!HttpClient::is_retryable_status(400));
        assert!(!HttpClient::is_retryable_status(401));
        assert!(!HttpClient::is_retryable_status(404));
    }

    /// Accepts a single connection, returns the raw request text and replies with a token.
    async fn serve_one_token_request(listener: tokio::net::TcpListener) -> String {
        use tokio::io::{AsyncReadExt, AsyncWriteExt};

        let (mut socket, _) = listener.accept().await.expect("accept");
        let mut raw = Vec::new();
        let mut buffer = [0u8; 1024];
        loop {
            let read = socket.read(&mut buffer).await.expect("read");
            raw.extend_from_slice(&buffer[..read]);
            if read == 0 || String::from_utf8_lossy(&raw).contains("\r\n\r\n") {
                break;
            }
        }

        let body = r#"{"access_token":"token-from-server","expires_in":3600}"#;
        let response = format!(
            "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: {}\r\n\r\n{}",
            body.len(),
            body
        );
        socket.write_all(response.as_bytes()).await.expect("write");
        socket.flush().await.expect("flush");

        String::from_utf8_lossy(&raw).to_string()
    }

    #[tokio::test]
    async fn test_oauth_token_request_sends_custom_headers() {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
            .await
            .expect("bind");
        let base_url = format!("http://{}", listener.local_addr().expect("addr"));
        let server = tokio::spawn(serve_one_token_request(listener));

        let mut config = ClientConfig::default();
        config.base_url = base_url;
        config
            .custom_headers
            .insert("X-Gateway-Token".to_string(), "sunflower".to_string());
        let client = HttpClient::new(config).expect("client");

        let (access_token, _) = client
            .fetch_oauth_token(
                &client.config.base_url.clone(),
                "/token",
                "client-id",
                "client-secret",
                &OAuthTokenExchangeConfig::default(),
            )
            .await
            .expect("token");

        let raw_request = server.await.expect("server");
        assert_eq!(access_token, "token-from-server");
        assert!(
            raw_request.contains("x-gateway-token: sunflower"),
            "token request is missing the client's custom headers: {raw_request}"
        );
    }

    #[tokio::test]
    async fn test_oauth_token_request_form_encodes_when_configured() {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
            .await
            .expect("bind");
        let base_url = format!("http://{}", listener.local_addr().expect("addr"));
        let server = tokio::spawn(serve_one_token_request(listener));

        let mut config = ClientConfig::default();
        config.base_url = base_url;
        let client = HttpClient::new(config).expect("client");

        let exchange = OAuthTokenExchangeConfig {
            form_encoded: true,
            ..OAuthTokenExchangeConfig::default()
        };
        let (access_token, _) = client
            .fetch_oauth_token(
                &client.config.base_url.clone(),
                "/token",
                "client-id",
                "client-secret",
                &exchange,
            )
            .await
            .expect("token");

        let raw_request = server.await.expect("server");
        assert_eq!(access_token, "token-from-server");
        assert!(
            raw_request.contains("content-type: application/x-www-form-urlencoded"),
            "token request should be form-encoded when the endpoint declares it: {raw_request}"
        );
        assert!(
            !raw_request.contains("content-type: application/json"),
            "token request should not send a JSON content type when form-encoded: {raw_request}"
        );
    }
}
