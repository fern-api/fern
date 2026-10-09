use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct V1Client {
    pub http_client: HttpClient,
}

impl V1Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use acme_versioned_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AcmeVersionedClient::new(config).expect("Failed to build client");
    ///     client.v1.list_users(None).await;
    /// }
    /// ```
    pub async fn list_users(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<UserV1>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }
}
