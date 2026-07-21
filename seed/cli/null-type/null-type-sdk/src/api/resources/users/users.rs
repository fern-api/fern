use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UsersClient {
    pub http_client: HttpClient,
}

impl UsersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Gets a user by ID. The deleted_at field uses type null.
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
    /// use null_type_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NullTypeClient::new(config).expect("Failed to build client");
    ///     client.users.get(&"id".to_string(), None).await;
    /// }
    /// ```
    pub async fn get(&self, id: &str, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client
            .execute_request(Method::GET, &format!("users/{}", id), None, None, options)
            .await
    }
}
