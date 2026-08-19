use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UnionClient {
    pub http_client: HttpClient,
}

impl UnionClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_unions::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UnionsClient::new(config).expect("Failed to build client");
    ///     client.bigunion.get(&"id".to_string(), None).await;
    /// }
    /// ```
    pub async fn get(&self, id: &str, options: Option<RequestOptions>) -> Result<Shape, ApiError> {
        self.http_client
            .execute_request(Method::GET, &format!("/{}", id), None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_unions::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = UnionsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .union_
    ///         .update(
    ///             &Shape::Circle {
    ///                 data: Circle {
    ///                     radius: 1.1,
    ///                     ..Default::default()
    ///                 },
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update(
        &self,
        request: &Shape,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                "",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
