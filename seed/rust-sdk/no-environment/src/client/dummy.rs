use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct DummyClient {
    pub http_client: HttpClient,
}

impl DummyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_dummy(&self, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "dummy",
            None,
            None,
            options,
        ).await
    }

}

