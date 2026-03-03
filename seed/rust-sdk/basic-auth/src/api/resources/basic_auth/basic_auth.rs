use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct BasicAuthClient2 {
    pub http_client: HttpClient,
}

impl BasicAuthClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// GET request with basic auth scheme
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_with_basic_auth(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(Method::GET, "basic-auth", None, None, options)
            .await
    }

    /// POST request with basic auth scheme
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn post_with_basic_auth(
        &self,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "basic-auth",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
