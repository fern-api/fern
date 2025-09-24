use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct NestedNoAuthApiClient {
    pub http_client: HttpClient,
}

impl NestedNoAuthApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_something(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/nested-no-auth/get-something",
                None,
                None,
                options,
            )
            .await
    }
}
