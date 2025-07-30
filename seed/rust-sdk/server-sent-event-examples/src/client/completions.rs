use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct CompletionsClient {
    pub http_client: HttpClient,
}

impl CompletionsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn stream(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<serde_json::Value, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "stream",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

