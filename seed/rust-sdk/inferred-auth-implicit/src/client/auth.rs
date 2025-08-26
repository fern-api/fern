use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File};

pub struct AuthClient {
    pub http_client: HttpClient,
}

impl AuthClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_token_with_client_credentials(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<TokenResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/token",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn refresh_token(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<TokenResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/token/refresh",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

