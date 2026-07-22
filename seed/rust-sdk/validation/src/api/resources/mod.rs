//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ValidationClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl ValidationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_validation::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ValidationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .create(
    ///             &CreateRequest {
    ///                 decimal: 2.2,
    ///                 even: 100,
    ///                 name: "fern".to_string(),
    ///                 shape: Shape::Square,
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create(
        &self,
        request: &CreateRequest,
        options: Option<RequestOptions>,
    ) -> Result<Type, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/create",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_validation::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ValidationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .get(
    ///             &GetQueryRequest {
    ///                 decimal: 2.2,
    ///                 even: 100,
    ///                 name: "fern".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get(
        &self,
        request: &GetQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Type, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "",
                None,
                QueryBuilder::new()
                    .float("decimal", request.decimal.clone())
                    .int("even", request.even.clone())
                    .string("name", request.name.clone())
                    .build(),
                options,
            )
            .await
    }
}
