use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct PropertyBasedErrorClient {
    pub http_client: HttpClient,
}

impl PropertyBasedErrorClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn throw_error(&self, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::GET, "property-based-error", None, None, options)
            .await
    }
}
