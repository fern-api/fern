use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File, FormDataBuilder};

pub struct HeadersClient {
    pub http_client: HttpClient,
}

impl HeadersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn send(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<SendResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "headers",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

