//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ApiClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn test_get(
        &self,
        region: &str,
        request: &TestGetQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<TestGetResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("test/{}/resource", region),
                None,
                QueryBuilder::new()
                    .string("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }
}
