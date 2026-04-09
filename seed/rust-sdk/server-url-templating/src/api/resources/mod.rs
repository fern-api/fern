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

    pub async fn get_users(&self, options: Option<RequestOptions>) -> Result<Vec<User>, ApiError> {
        let base_url = self
            .http_client
            .config()
            .environment
            .as_ref()
            .map_or(self.http_client.base_url(), |env| env.base_url());
        self.http_client
            .execute_request_with_base_url(base_url, Method::GET, "users", None, None, options)
            .await
    }

    pub async fn get_user(
        &self,
        user_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        let base_url = self
            .http_client
            .config()
            .environment
            .as_ref()
            .map_or(self.http_client.base_url(), |env| env.base_url());
        self.http_client
            .execute_request_with_base_url(
                base_url,
                Method::GET,
                &format!("users/{}", user_id),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn get_token(
        &self,
        request: &TokenRequest,
        options: Option<RequestOptions>,
    ) -> Result<TokenResponse, ApiError> {
        let base_url = self
            .http_client
            .config()
            .environment
            .as_ref()
            .map_or(self.http_client.base_url(), |env| env.auth_url());
        self.http_client
            .execute_request_with_base_url(
                base_url,
                Method::POST,
                "auth/token",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
