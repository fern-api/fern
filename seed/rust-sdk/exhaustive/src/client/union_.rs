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

    pub async fn get_and_return_union(&self, request: &Animal, options: Option<RequestOptions>) -> Result<Animal, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            "/union",
            Some(serde_json::to_value(request).unwrap_or_default()),
            options,
        ).await
    }

}

