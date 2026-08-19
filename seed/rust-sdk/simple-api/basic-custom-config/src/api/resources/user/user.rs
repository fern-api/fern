use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use custom_simple_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = CustomSimpleClient::new(config).expect("Failed to build client");
    ///     client.user.get(&"id".to_string(), None).await;
    /// }
    /// ```
    pub async fn get(&self, id: &str, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client
            .execute_request(Method::GET, &format!("/users/{}", id), None, None, options)
            .await
    }
}
