use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;
use std::collections::HashMap;

pub struct OptionalClient {
    pub http_client: HttpClient,
}

impl OptionalClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn send_optional_body(
        &self,
        request: &Option<HashMap<String, serde_json::Value>>,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "send-optional-body",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn send_optional_typed_body(
        &self,
        request: &Option<SendOptionalBodyRequest>,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "send-optional-typed-body",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    /// Tests optional(nullable(T)) where T has only optional properties.
    /// This should not generate wire tests expecting {} when Optional.empty() is passed.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn send_optional_nullable_with_all_optional_properties(
        &self,
        action_id: &String,
        id: &String,
        request: &Option<Option<DeployParams>>,
        options: Option<RequestOptions>,
    ) -> Result<DeployResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("deploy/{}/versions/{}", action_id, id),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
