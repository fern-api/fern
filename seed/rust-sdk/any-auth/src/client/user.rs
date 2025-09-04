use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get(&self, options: Option<RequestOptions>) -> Result<Vec<User>, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "users",
            None,
            None,
            options,
        ).await
    }

}

