use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct MessagesClient {
    pub http_client: HttpClient,
}

impl MessagesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use profiles_cli_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ProfilesCliClient::new(config).expect("Failed to build client");
    ///     client
    ///         .messages
    ///         .list(
    ///             &"AccountSid".to_string(),
    ///             &ListQueryRequest {
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn list(
        &self,
        account_sid: &str,
        request: &ListQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Message>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("accounts/{}/messages", account_sid),
                None,
                QueryBuilder::new()
                    .serialize("direction", request.direction.clone())
                    .build(),
                options,
            )
            .await
    }
}
