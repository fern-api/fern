use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UnknownClient {
    pub http_client: HttpClient,
}

impl UnknownClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_unknown_as_any::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UnknownAsAnyClient::new(config).expect("Failed to build client");
    ///     client
    ///         .unknown
    ///         .post(&serde_json::json!({"key":"value"}), None)
    ///         .await;
    /// }
    /// ```
    pub async fn post(
        &self,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<Vec<serde_json::Value>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_unknown_as_any::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UnknownAsAnyClient::new(config).expect("Failed to build client");
    ///     client
    ///         .unknown
    ///         .post_object(
    ///             &MyObject {
    ///                 unknown: serde_json::json!({"key":"value"}),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn post_object(
        &self,
        request: &MyObject,
        options: Option<RequestOptions>,
    ) -> Result<Vec<serde_json::Value>, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/with-object",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
