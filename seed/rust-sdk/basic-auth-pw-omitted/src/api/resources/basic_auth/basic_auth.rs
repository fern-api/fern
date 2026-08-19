use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct BasicAuthClient {
    pub http_client: HttpClient,
}

impl BasicAuthClient {
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
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_basic_auth_pw_omitted::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         username: Some("<username>".to_string()),
    ///         password: Some("".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = BasicAuthPwOmittedClient::new(config).expect("Failed to build client");
    ///     client.basic_auth.get_with_basic_auth(None).await;
    /// }
    /// ```
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
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_basic_auth_pw_omitted::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         username: Some("<username>".to_string()),
    ///         password: Some("".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = BasicAuthPwOmittedClient::new(config).expect("Failed to build client");
    ///     client
    ///         .basic_auth
    ///         .post_with_basic_auth(&serde_json::json!({"key":"value"}), None)
    ///         .await;
    /// }
    /// ```
    pub async fn post_with_basic_auth(
        &self,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "basic-auth",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
