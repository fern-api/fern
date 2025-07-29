use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct UnionClient {
    pub http_client: HttpClient,
}

impl UnionClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get(&self, id: &String, options: Option<RequestOptions>) -> Result<Shape, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/{}", id),
            None,
            options,
        ).await
    }

    pub async fn update(&self, request: &Shape, options: Option<RequestOptions>) -> Result<bool, ClientError> {
        self.http_client.execute_request(
            Method::PATCH,
            "",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

