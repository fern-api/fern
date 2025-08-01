use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct CustomAuthClient {
    pub http_client: HttpClient,
    pub custom_auth_scheme: Option<String>,
}

impl CustomAuthClient {
    pub fn new(config: ClientConfig, custom_auth_scheme: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, custom_auth_scheme })
    }

    pub async fn get_with_custom_auth(&self, options: Option<RequestOptions>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "custom-auth",
            None,
            None,
            options,
        ).await
    }

    pub async fn post_with_custom_auth(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "custom-auth",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

