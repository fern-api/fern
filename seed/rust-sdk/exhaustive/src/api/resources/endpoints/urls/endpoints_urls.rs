use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UrlsClient {
    pub http_client: HttpClient,
}

impl UrlsClient {
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
    ///     client.endpoints.urls.with_mixed_case(None).await;
    /// }
    /// ```
    pub async fn with_mixed_case(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/urls/MixedCase", None, None, options)
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
    ///     client.endpoints.urls.no_ending_slash(None).await;
    /// }
    /// ```
    pub async fn no_ending_slash(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/urls/no-ending-slash", None, None, options)
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
    ///     client.endpoints.urls.with_ending_slash(None).await;
    /// }
    /// ```
    pub async fn with_ending_slash(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/urls/with-ending-slash/", None, None, options)
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
    ///     client.endpoints.urls.with_underscores(None).await;
    /// }
    /// ```
    pub async fn with_underscores(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/urls/with_underscores", None, None, options)
            .await
    }
}
