use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct PathClient {
    pub http_client: HttpClient,
}

impl PathClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn send(&self, id: &String, options: Option<RequestOptions>) -> Result<SendResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("path/{}", id),
            None,
            None,
            options,
        ).await
    }

}

