use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct TypesClient {
    pub http_client: HttpClient,
}

impl TypesClient {
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
    ///     client.types.get(&"date-example".to_string(), None).await;
    /// }
    /// ```
    pub async fn get(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<UnionWithTime, ApiError> {
        self.http_client
            .execute_request(Method::GET, &format!("/time/{}", id), None, None, options)
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
    ///         .types
    ///         .update(
    ///             &UnionWithTime::Date {
    ///                 value: NaiveDate::parse_from_str("2024-01-01", "%Y-%m-%d").unwrap(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update(
        &self,
        request: &UnionWithTime,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                "/time",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
