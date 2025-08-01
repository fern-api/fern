use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct AuthClient {
    pub http_client: HttpClient,
    pub access_token: Option<String>,
}

impl AuthClient {
    pub fn new(config: ClientConfig, access_token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, access_token })
    }

    pub async fn get_token(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<TokenResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/token",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

