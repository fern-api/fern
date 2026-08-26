use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ModelsClient {
    pub http_client: HttpClient,
}

impl ModelsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use reserved_keyword_cli_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ReservedKeywordCliClient::new(config).expect("Failed to build client");
    ///     client.models.get(&"model_id".to_string(), None).await;
    /// }
    /// ```
    pub async fn get(
        &self,
        model_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Model, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("models/{}", model_id),
                None,
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use reserved_keyword_cli_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ReservedKeywordCliClient::new(config).expect("Failed to build client");
    ///     client.models.list(None).await;
    /// }
    /// ```
    pub async fn list(&self, options: Option<RequestOptions>) -> Result<ModelPage, ApiError> {
        self.http_client
            .execute_request(Method::GET, "models", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use reserved_keyword_cli_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ReservedKeywordCliClient::new(config).expect("Failed to build client");
    ///     client.models.list_events(None).await;
    /// }
    /// ```
    pub async fn list_events(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<ModelEvent, ApiError> {
        self.http_client
            .execute_request(Method::GET, "models/events", None, None, options)
            .await
    }
}
