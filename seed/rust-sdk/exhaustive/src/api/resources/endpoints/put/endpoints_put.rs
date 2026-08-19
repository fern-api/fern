use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct PutClient {
    pub http_client: HttpClient,
}

impl PutClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client.endpoints.put.add(&"id".to_string(), None).await;
    /// }
    /// ```
    pub async fn add(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<PutResponse, ApiError> {
        self.http_client
            .execute_request(Method::PUT, &format!("{}", id), None, None, options)
            .await
    }
}
