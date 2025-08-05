use std::str::FromStr;
use reqwest::{Client, Request, Response, Method, header::{HeaderName, HeaderValue}};
use serde::de::DeserializeOwned;
use crate::{ClientConfig, RequestOptions, ClientError};

/// Internal HTTP client that handles requests with authentication and retries
pub struct HttpClient {
    client: Client,
    config: ClientConfig,
}

impl HttpClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let client = Client::builder()
            .timeout(config.timeout)
            .user_agent(&config.user_agent)
            .build()
            .map_err(ClientError::HttpClientError)?;
            
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
    ) -> Result<T, ClientError>
    where
        T: DeserializeOwned,
    {
        let url = format!("{}/{}", self.config.base_url.trim_end_matches('/'), path);
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
        let mut req = request.build().map_err(ClientError::RequestError)?;
        
        // Apply authentication and headers
        self.apply_auth_headers(&mut req, &options)?;
        self.apply_custom_headers(&mut req, &options)?;
        
        // Execute with retries
        let response = self.execute_with_retries(req, &options).await?;
        self.parse_response(response).await
    }
    
    fn apply_auth_headers(&self, request: &mut Request, options: &Option<RequestOptions>) -> Result<(), ClientError> {
        let headers = request.headers_mut();
        
        // Apply API key (request options override config)
        let api_key = options.as_ref()
            .and_then(|opts| opts.api_key.as_ref())
            .or(self.config.api_key.as_ref());
            
        if let Some(key) = api_key {
            headers.insert("X-API-Key", key.parse().map_err(|_| ClientError::InvalidHeader)?);
        }
        
        // Apply bearer token (request options override config)
        let bearer_token = options.as_ref()
            .and_then(|opts| opts.bearer_token.as_ref())
            .or(self.config.bearer_token.as_ref());
            
        if let Some(token) = bearer_token {
            let auth_value = format!("Bearer {}", token);
            headers.insert("Authorization", auth_value.parse().map_err(|_| ClientError::InvalidHeader)?);
        }
        
        Ok(())
    }
    
    fn apply_custom_headers(&self, request: &mut Request, options: &Option<RequestOptions>) -> Result<(), ClientError> {
        let headers = request.headers_mut();
        
        // Apply config-level custom headers
        for (key, value) in &self.config.custom_headers {
            headers.insert(
                HeaderName::from_str(key).map_err(|_| ClientError::InvalidHeader)?, 
                HeaderValue::from_str(value).map_err(|_| ClientError::InvalidHeader)?
            );
        }
        
        // Apply request-level custom headers (override config)
        if let Some(options) = options {
            for (key, value) in &options.additional_headers {
                headers.insert(
                    HeaderName::from_str(key).map_err(|_| ClientError::InvalidHeader)?, 
                    HeaderValue::from_str(value).map_err(|_| ClientError::InvalidHeader)?
                );
            }
        }
        
        Ok(())
    }
    
    async fn execute_with_retries(&self, request: Request, options: &Option<RequestOptions>) -> Result<Response, ClientError> {
        let max_retries = options.as_ref()
            .and_then(|opts| opts.max_retries)
            .unwrap_or(self.config.max_retries);
            
        let mut last_error = None;
        
        for attempt in 0..=max_retries {
            let cloned_request = request.try_clone()
                .ok_or(ClientError::RequestCloneError)?;
                
            match self.client.execute(cloned_request).await {
                Ok(response) if response.status().is_success() => return Ok(response),
                Ok(response) => return Err(ClientError::HttpError(response.status())),
                Err(e) if attempt < max_retries => {
                    last_error = Some(e);
                    // Exponential backoff
                    let delay = std::time::Duration::from_millis(100 * 2_u64.pow(attempt));
                    tokio::time::sleep(delay).await;
                }
                Err(e) => return Err(ClientError::RequestError(e)),
            }
        }
        
        Err(ClientError::RequestError(last_error.unwrap()))
    }
    
    async fn parse_response<T>(&self, response: Response) -> Result<T, ClientError>
    where
        T: DeserializeOwned,
    {
        let text = response.text().await.map_err(ClientError::RequestError)?;
        serde_json::from_str(&text).map_err(ClientError::JsonParseError)
    }
}