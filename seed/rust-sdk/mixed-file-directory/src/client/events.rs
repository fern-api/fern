use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct EventsClient {
    pub http_client: HttpClient,
}

impl EventsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn list_events(&self, limit: Option<&Option<i32>>, options: Option<RequestOptions>) -> Result<Vec<Event>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/users/events/",
            None,
            options,
        ).await
    }

}

