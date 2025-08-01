use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct BasicAuthClient {
    pub http_client: HttpClient,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl BasicAuthClient {
    pub fn new(config: ClientConfig, username: Option<String>, password: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, username, password })
    }

    pub async fn get_with_basic_auth(&self, options: Option<RequestOptions>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "basic-auth",
            None,
            None,
            options,
        ).await
    }

    pub async fn post_with_basic_auth(&self, request: &serde_json::Value, options: Option<RequestOptions>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "basic-auth",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

