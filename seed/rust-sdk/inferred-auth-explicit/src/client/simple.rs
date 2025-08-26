use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::core::{File};

pub struct SimpleClient {
    pub http_client: HttpClient,
}

impl SimpleClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_something(&self, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::GET,
            "/get-something",
            None,
            None,
            options,
        ).await
    }

}

