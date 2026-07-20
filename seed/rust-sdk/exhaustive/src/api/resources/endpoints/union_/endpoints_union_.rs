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
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .union_
    ///         .get_and_return_union(
    ///             &Animal::Dog {
    ///                 data: Dog {
    ///                     name: "name".to_string(),
    ///                     likes_to_woof: true,
    ///                     ..Default::default()
    ///                 },
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_union(
        &self,
        request: &Animal,
        options: Option<RequestOptions>,
    ) -> Result<Animal, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/union",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
