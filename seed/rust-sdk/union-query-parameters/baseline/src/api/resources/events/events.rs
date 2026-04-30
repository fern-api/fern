use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct EventsClient {
    pub http_client: HttpClient,
}

impl EventsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Subscribe to events with a oneOf-style query parameter that may be a
    /// scalar enum value or a list of enum values.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn subscribe(
        &self,
        request: &SubscribeQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/events",
                None,
                QueryBuilder::new()
                    .serialize("event_type", request.event_type.clone())
                    .serialize("tags", request.tags.clone())
                    .build(),
                options,
            )
            .await
    }
}
