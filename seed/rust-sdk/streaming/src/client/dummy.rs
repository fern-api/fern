use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File};

pub struct DummyClient {
    pub http_client: HttpClient,
}

impl DummyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn generate_stream(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<serde_json::Value, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "generate-stream",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn generate(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<StreamResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "generate",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

