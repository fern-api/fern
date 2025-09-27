use crate::{join_url, ApiError, ClientConfig, RequestOptions};
use reqwest::{
    header::{HeaderName, HeaderValue},
    Client, Method, Request, Response,
};
use serde::de::DeserializeOwned;
use std::str::FromStr;

/// Internal HTTP client that handles requests with authentication and retries
#[derive(Clone)]
pub struct HttpClient {
    client: Client,
    config: ClientConfig,
}

impl HttpClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let client = Client::builder()
            .timeout(config.timeout)
            .user_agent(&config.user_agent)
            .build()
            .map_err(ApiError::Network)?;

        Ok(Self { client, config })
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

        // Apply body if provided
        if let Some(body) = body {
            request = request.json(&body);
        }

        // Build the request
        let mut req = request.build().map_err(|e| ApiError::Network(e))?;

        // Apply authentication and headers
        self.apply_auth_headers(&mut req, &options)?;
        self.apply_custom_headers(&mut req, &options)?;

        // Execute with retries
        let response = self.execute_with_retries(req, &options).await?;
        self.parse_response(response).await
    }

    fn apply_auth_headers(
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
            headers.insert("api_key", key.parse().map_err(|_| ApiError::InvalidHeader)?);
        }

        // Apply bearer token (request options override config)
        let token = options
            .as_ref()
            .and_then(|opts| opts.token.as_ref())
            .or(self.config.token.as_ref());

        if let Some(token) = token {
            let auth_value = format!("Bearer {}", token);
            headers.insert(
                "Authorization",
                auth_value.parse().map_err(|_| ApiError::InvalidHeader)?,
            );
        }

        Ok(())
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
}
