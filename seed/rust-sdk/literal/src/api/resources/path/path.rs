use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct PathClient {
    pub http_client: HttpClient,
}

impl PathClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn send(&self, id: &String, options: Option<RequestOptions>) -> Result<SendResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("path/{}", id),
            None,
            None,
            options,
        ).await
    }

}

