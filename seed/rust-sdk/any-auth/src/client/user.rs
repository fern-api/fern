use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct UserClient {
    pub http_client: HttpClient,
    pub token: Option<String>,
    pub api_key: Option<String>,
    pub access_token: Option<String>,
}

impl UserClient {
    pub fn new(config: ClientConfig, token: Option<String>, api_key: Option<String>, access_token: Option<String>) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client, token, api_key, access_token })
    }

    pub async fn get(&self, options: Option<RequestOptions>) -> Result<Vec<User>, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "users",
            None,
            None,
            options,
        ).await
    }

}

