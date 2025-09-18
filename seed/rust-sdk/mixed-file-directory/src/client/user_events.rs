use crate::{ClientConfig, ApiError, HttpClient, QueryBuilder, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct UserEventsClient {
    pub http_client: HttpClient,
}

impl UserEventsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn list_events(&self, limit: Option<i32>, options: Option<RequestOptions>) -> Result<Vec<Event>, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/users/events/",
            None,
            QueryBuilder::new().int("limit", limit)
            .build(),
            options,
        ).await
    }

}

