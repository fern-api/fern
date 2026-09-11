use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct MessagesClient2 {
    pub http_client: HttpClient,
}

impl MessagesClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use acme_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AcmeClient::new(config).expect("Failed to build client");
    ///     client.messages.messages.list_message(None).await;
    /// }
    /// ```
    pub async fn list_message(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Message>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "v1/Messages", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use acme_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AcmeClient::new(config).expect("Failed to build client");
    ///     client.messages.messages.create_message(None).await;
    /// }
    /// ```
    pub async fn create_message(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Message, ApiError> {
        self.http_client
            .execute_request(Method::POST, "v1/Messages", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use acme_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AcmeClient::new(config).expect("Failed to build client");
    ///     client
    ///         .messages
    ///         .messages
    ///         .list_media(&"id".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn list_media(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Media>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("v1/Messages/{}/Media", id),
                None,
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use acme_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AcmeClient::new(config).expect("Failed to build client");
    ///     client
    ///         .messages
    ///         .messages
    ///         .list_media_v2(&"id".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn list_media_v2(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Media>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("v1/Messages/{}/MediaV2", id),
                None,
                None,
                options,
            )
            .await
    }
}
