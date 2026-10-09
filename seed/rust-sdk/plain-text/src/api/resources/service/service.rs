use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_plain_text::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PlainTextClient::new(config).expect("Failed to build client");
    ///     client.service.get_text(None).await;
    /// }
    /// ```
    pub async fn get_text(&self, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::POST, "text", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_plain_text::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PlainTextClient::new(config).expect("Failed to build client");
    ///     client.service.get_csv(None).await;
    /// }
    /// ```
    pub async fn get_csv(&self, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::GET, "csv", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_plain_text::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PlainTextClient::new(config).expect("Failed to build client");
    ///     client.service.get_xml(None).await;
    /// }
    /// ```
    pub async fn get_xml(&self, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::GET, "xml", None, None, options)
            .await
    }
}
