use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct NoReqBodyClient {
    pub http_client: HttpClient,
}

impl NoReqBodyClient {
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
    ///     client.no_req_body.get_with_no_request_body(None).await;
    /// }
    /// ```
    pub async fn get_with_no_request_body(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<ObjectWithOptionalField, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/no-req-body", None, None, options)
            .await
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
    ///     client.no_req_body.post_with_no_request_body(None).await;
    /// }
    /// ```
    pub async fn post_with_no_request_body(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::POST, "/no-req-body", None, None, options)
            .await
    }
}
