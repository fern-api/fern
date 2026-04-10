use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct AbClient {
    pub http_client: HttpClient,
}

impl AbClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn a_b_foo(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "a/b",
            None,
            None,
            options,
        ).await
    }

}

