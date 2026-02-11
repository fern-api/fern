use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct ReferenceClient {
    pub http_client: HttpClient,
}

impl ReferenceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn send(&self, request: &SendRequest, options: Option<RequestOptions>) -> Result<SendResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "reference",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

