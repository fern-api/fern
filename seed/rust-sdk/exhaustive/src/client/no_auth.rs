use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct NoAuthClient {
    pub http_client: HttpClient,
    pub token: Option<String>,
}

impl NoAuthClient {
    pub fn new(config: ClientConfig, token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, token })
    }

    pub async fn post_with_no_auth(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/no-auth",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

