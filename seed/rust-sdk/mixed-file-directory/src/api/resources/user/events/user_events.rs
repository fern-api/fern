use crate::api::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct UserEventsClient {
    pub http_client: HttpClient,
    pub metadata: UserEventsMetadataClient,
}

impl UserEventsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config)?,
            metadata: UserEventsMetadataClient::new(config.clone())?,
        })
    }

    pub async fn list_events(
        &self,
        limit: Option<i32>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Event>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users/events/",
                None,
                QueryBuilder::new().int("limit", limit).build(),
                options,
            )
            .await
    }
}
