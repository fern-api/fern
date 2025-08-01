use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};

pub struct ServiceClient {
    pub http_client: HttpClient,
    pub api_key: Option<String>,
}

impl ServiceClient {
    pub fn new(config: ClientConfig, api_key: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, api_key })
    }

    pub async fn get_with_bearer_token(&self, options: Option<RequestOptions>) -> Result<String, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "apiKey",
            None,
            None,
            options,
        ).await
    }

}

