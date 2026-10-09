use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ConversationsClient {
    pub http_client: HttpClient,
}

impl ConversationsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Place an outbound call or validate call setup with dry_run.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
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
    ///         .conversations
    ///         .outbound_call(
    ///             &OutboundCallConversationsRequest {
    ///                 to_phone_number: "to_phone_number".to_string(),
    ///                 dry_run: None,
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn outbound_call(
        &self,
        request: &OutboundCallConversationsRequest,
        options: Option<RequestOptions>,
    ) -> Result<OutboundCallConversationsResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "conversations/outbound-call",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
