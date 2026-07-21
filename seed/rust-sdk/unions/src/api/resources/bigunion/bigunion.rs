use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;
use std::collections::HashMap;

pub struct BigunionClient {
    pub http_client: HttpClient,
}

impl BigunionClient {
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
    pub async fn get(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<BigUnion, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/bigunion/{}", id),
                None,
                None,
                options,
            )
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
    ///         .bigunion
    ///         .update(
    ///             &BigUnion::NormalSweet {
    ///                 data: NormalSweet {
    ///                     value: "value".to_string(),
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
        request: &BigUnion,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                "/bigunion",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
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
    ///         .bigunion
    ///         .update_many(
    ///             &vec![
    ///                 BigUnion::NormalSweet {
    ///                     data: NormalSweet {
    ///                         value: "value".to_string(),
    ///                         ..Default::default()
    ///                     },
    ///                 },
    ///                 BigUnion::NormalSweet {
    ///                     data: NormalSweet {
    ///                         value: "value".to_string(),
    ///                         ..Default::default()
    ///                     },
    ///                 },
    ///             ],
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update_many(
        &self,
        request: &Vec<BigUnion>,
        options: Option<RequestOptions>,
    ) -> Result<HashMap<String, bool>, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                "/bigunion/many",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
