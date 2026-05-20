use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct StatusClient {
    pub http_client: HttpClient,
}

impl StatusClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn get_status(&self, options: Option<RequestOptions>) -> Result<StatusResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/status",
            None,
            None,
            options,
        ).await
    }

}

