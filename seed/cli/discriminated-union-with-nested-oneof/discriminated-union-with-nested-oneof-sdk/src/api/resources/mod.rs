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

    /// # Examples
    ///
    /// ```no_run
    /// use discriminated_union_with_nested_oneof_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client =
    ///         DiscriminatedUnionWithNestedOneofClient::new(config).expect("Failed to build client");
    ///     client
    ///         .create_ast(
    ///             &AstNode::Llm {
    ///                 data: AstNodeLlm {
    ///                     model: "model".to_string(),
    ///                     ..Default::default()
    ///                 },
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_ast(
        &self,
        request: &AstNode,
        options: Option<RequestOptions>,
    ) -> Result<AstNode, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "ast",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
