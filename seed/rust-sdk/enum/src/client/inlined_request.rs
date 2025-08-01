use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct InlinedRequestClient {
    pub http_client: HttpClient,
}

impl InlinedRequestClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn send(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "inlined",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

