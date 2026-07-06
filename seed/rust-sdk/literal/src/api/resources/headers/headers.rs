use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct HeadersClient {
    pub http_client: HttpClient,
}

impl HeadersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_literal::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = LiteralClient::new(config).expect("Failed to build client");
    ///     client
    ///         .headers
    ///         .send(
    ///             &SendLiteralsInHeadersRequest {
    ///                 query: "What is the weather today".to_string(),
    ///             },
    ///             Some(
    ///                 RequestOptions::new()
    ///                     .additional_header("X-Endpoint-Version", "02-12-2024")
    ///                     .additional_header("X-Async", "true"),
    ///             ),
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn send(
        &self,
        request: &SendLiteralsInHeadersRequest,
        options: Option<RequestOptions>,
    ) -> Result<SendResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "headers",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
