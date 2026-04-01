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

    pub async fn get_foo(
        &self,
        request: &GetFooQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Foo, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "foo",
                None,
                QueryBuilder::new()
                    .string("optional_baz", request.optional_baz.clone())
                    .serialize(
                        "optional_nullable_baz",
                        request.optional_nullable_baz.clone(),
                    )
                    .string("required_baz", request.required_baz.clone())
                    .string(
                        "required_nullable_baz",
                        request.required_nullable_baz.clone(),
                    )
                    .build(),
                options,
            )
            .await
    }

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `optional_baz` - An optional baz
    /// * `optional_nullable_baz` - An optional baz
    /// * `required_baz` - A required baz
    /// * `required_nullable_baz` - A required baz
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_foo_with_raw_response(
        &self,
        request: &GetFooQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Foo>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "foo",
                None,
                QueryBuilder::new()
                    .string("optional_baz", request.optional_baz.clone())
                    .serialize(
                        "optional_nullable_baz",
                        request.optional_nullable_baz.clone(),
                    )
                    .string("required_baz", request.required_baz.clone())
                    .string(
                        "required_nullable_baz",
                        request.required_nullable_baz.clone(),
                    )
                    .build(),
                options,
            )
            .await
    }

    pub async fn update_foo(
        &self,
        id: &str,
        request: &UpdateFooRequest,
        options: Option<RequestOptions>,
    ) -> Result<Foo, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("foo/{}", id),
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
    pub async fn update_foo_with_raw_response(
        &self,
        id: &str,
        request: &UpdateFooRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Foo>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::PATCH,
                &format!("foo/{}", id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
