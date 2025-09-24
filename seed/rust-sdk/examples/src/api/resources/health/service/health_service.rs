use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct HealthServiceClient {
    pub http_client: HttpClient,
}

impl HealthServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn check(
        &self,
        id: &String,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::GET, &format!("/check/{}", id), None, None, options)
            .await
    }

    pub async fn ping(&self, options: Option<RequestOptions>) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/ping", None, None, options)
            .await
    }
}
