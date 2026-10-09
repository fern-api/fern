use crate::api::*;
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
    /// use seed_examples::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExamplesClient::new(config).expect("Failed to build client");
    ///     client
    ///         .file
    ///         .notification
    ///         .service
    ///         .get_exception(&"notification-hsy129x".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_exception(
        &self,
        notification_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Exception, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/file/notification/{}", notification_id),
                None,
                None,
                options,
            )
            .await
    }
}
