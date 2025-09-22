use crate::api::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct UserEventsMetadataClient {
    pub http_client: HttpClient,
}

impl UserEventsMetadataClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config)?,
        })
    }

    pub async fn get_metadata(
        &self,
        id: Option<Id>,
        options: Option<RequestOptions>,
    ) -> Result<Metadata, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users/events/metadata/",
                None,
                QueryBuilder::new().serialize("id", id).build(),
                options,
            )
            .await
    }
}
