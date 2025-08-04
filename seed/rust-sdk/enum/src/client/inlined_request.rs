use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct InlinedRequestClient {
    pub http_client: HttpClient,
    pub api_key: Option<String>,
    pub bearer_token: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl InlinedRequestClient {
    pub fn new(config: ClientConfig, api_key: Option<String>, bearer_token: Option<String>, username: Option<String>, password: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { 
            http_client, 
            api_key, 
            bearer_token, 
            username, 
            password 
        })
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

