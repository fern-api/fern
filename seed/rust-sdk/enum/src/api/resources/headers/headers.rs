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
    /// use seed_enum::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = EnumClient::new(config).expect("Failed to build client");
    ///     client
    ///         .headers
    ///         .send(Some(
    ///             RequestOptions::new()
    ///                 .additional_header("operand", ">")
    ///                 .additional_header("maybeOperand", ">")
    ///                 .additional_header("operandOrColor", "red"),
    ///         ))
    ///         .await;
    /// }
    /// ```
    pub async fn send(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::POST, "headers", None, None, options)
            .await
    }
}
