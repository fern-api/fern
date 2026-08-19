use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ReqWithHeadersClient {
    pub http_client: HttpClient,
}

impl ReqWithHeadersClient {
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
    ///     client
    ///         .req_with_headers
    ///         .get_with_custom_header(
    ///             &"string".to_string(),
    ///             Some(
    ///                 RequestOptions::new()
    ///                     .additional_header("X-TEST-SERVICE-HEADER", "X-TEST-SERVICE-HEADER")
    ///                     .additional_header("X-TEST-ENDPOINT-HEADER", "X-TEST-ENDPOINT-HEADER"),
    ///             ),
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_with_custom_header(
        &self,
        request: &str,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/test-headers/custom-header",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
