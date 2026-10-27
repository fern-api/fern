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
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client.messages.messages.list_messages(None).await;
    /// }
    /// ```
    pub async fn list_messages(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Message>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "messages", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .messages
    ///         .messages
    ///         .create_message(
    ///             &Message {
    ///                 sid: "sid".to_string(),
    ///                 body: "body".to_string(),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_message(
        &self,
        request: &Message,
        options: Option<RequestOptions>,
    ) -> Result<Message, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "messages",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .messages
    ///         .messages
    ///         .delete_message(&"sid".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn delete_message(
        &self,
        sid: &str,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                &format!("messages/{}", sid),
                None,
                None,
                options,
            )
            .await
    }
}
