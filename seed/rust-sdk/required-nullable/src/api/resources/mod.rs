//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .get_foo(
    ///             &GetFooQueryRequest {
    ///                 required_baz: "required_baz".to_string(),
    ///                 required_nullable_baz: Some("required_nullable_baz".to_string()),
    ///                 optional_baz: None,
    ///                 optional_nullable_baz: None,
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .update_foo(
    ///             &"id".to_string(),
    ///             &UpdateFooRequest {
    ///                 nullable_text: Some("nullable_text".to_string()),
    ///                 nullable_number: Some(1.1),
    ///                 non_nullable_text: Some("non_nullable_text".to_string()),
    ///                 ..Default::default()
    ///             },
    ///             Some(RequestOptions::new().additional_header("X-Idempotency-Key", "X-Idempotency-Key")),
    ///         )
    ///         .await;
    /// }
    /// ```
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
}
