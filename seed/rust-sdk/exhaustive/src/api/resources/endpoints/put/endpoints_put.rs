use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct PutClient {
    pub http_client: HttpClient,
}

impl PutClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn add(
        &self,
        id: &String,
        options: Option<RequestOptions>,
    ) -> Result<PutResponse, ApiError> {
        self.http_client
            .execute_request(Method::PUT, &format!("{}", id), None, None, options)
            .await
    }
}
