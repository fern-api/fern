use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct InlinedClient {
    pub http_client: HttpClient,
}

impl InlinedClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn send(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<SendResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "inlined",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

