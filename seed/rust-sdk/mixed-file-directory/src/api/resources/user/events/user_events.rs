use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct UserEventsClient {
    pub http_client: HttpClient,
    pub metadata: UserEventsMetadataClient,
}

impl UserEventsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            metadata: UserEventsMetadataClient::new(config.clone())?,
        })
    }

    pub async fn list_events(
        &self,
        request: &ListEventsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Event>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users/events/",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }
}
