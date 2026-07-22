use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct SimpleClient {
    pub http_client: HttpClient,
}

impl SimpleClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_errors::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ErrorsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .simple
    ///         .foo_without_endpoint_error(
    ///             &FooRequest {
    ///                 bar: "bar".to_string(),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn foo_without_endpoint_error(
        &self,
        request: &FooRequest,
        options: Option<RequestOptions>,
    ) -> Result<FooResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "foo1",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_errors::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ErrorsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .simple
    ///         .foo(
    ///             &FooRequest {
    ///                 bar: "bar".to_string(),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn foo(
        &self,
        request: &FooRequest,
        options: Option<RequestOptions>,
    ) -> Result<FooResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "foo2",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_errors::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ErrorsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .simple
    ///         .foo_with_examples(
    ///             &FooRequest {
    ///                 bar: "hello".to_string(),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn foo_with_examples(
        &self,
        request: &FooRequest,
        options: Option<RequestOptions>,
    ) -> Result<FooResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "foo3",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
