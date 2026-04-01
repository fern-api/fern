use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
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
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn send_optional_body_with_raw_response(
        &self,
        request: &Option<HashMap<String, serde_json::Value>>,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<String>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "send-optional-body",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
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
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn send_optional_typed_body_with_raw_response(
        &self,
        request: &Option<SendOptionalBodyRequest>,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<String>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "send-optional-typed-body",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
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
        action_id: &str,
        id: &str,
        request: &Option<DeployParams>,
        options: Option<RequestOptions>,
    ) -> Result<DeployResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("deploy/{}/versions/{}", action_id, id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Tests optional(nullable(T)) where T has only optional properties.
    /// This should not generate wire tests expecting {} when Optional.empty() is passed.
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn send_optional_nullable_with_all_optional_properties_with_raw_response(
        &self,
        action_id: &str,
        id: &str,
        request: &Option<DeployParams>,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<DeployResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                &format!("deploy/{}/versions/{}", action_id, id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
