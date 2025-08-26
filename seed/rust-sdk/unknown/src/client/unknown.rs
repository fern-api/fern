use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File};

pub struct UnknownClient {
    pub http_client: HttpClient,
}

impl UnknownClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn post(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<Vec<serde_json::Value>, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn post_object(&self, request: &MyObject, options: Option<RequestOptions>) -> Result<Vec<serde_json::Value>, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/with-object",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

