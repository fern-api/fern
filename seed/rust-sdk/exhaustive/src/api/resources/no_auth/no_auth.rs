use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct NoAuthClient {
    pub http_client: HttpClient,
}

impl NoAuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    /// POST request with no auth
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn post_with_no_auth(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<bool, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/no-auth",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

