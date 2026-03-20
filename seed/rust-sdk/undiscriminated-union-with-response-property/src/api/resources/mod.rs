//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UndiscriminatedUnionWithResponsePropertyClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl UndiscriminatedUnionWithResponsePropertyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_union(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<UnionResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/union", None, None, options)
            .await
    }

    pub async fn list_unions(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<UnionListResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/unions", None, None, options)
            .await
    }
}
