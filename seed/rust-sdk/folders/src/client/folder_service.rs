use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct FolderServiceClient {
    pub http_client: HttpClient,
}

impl FolderServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn endpoint(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/service",
            None,
            None,
            options,
        ).await
    }

    pub async fn unknown_request(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "/service",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

