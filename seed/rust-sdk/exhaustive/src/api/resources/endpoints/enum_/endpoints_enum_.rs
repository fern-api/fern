use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct EnumClient {
    pub http_client: HttpClient,
}

impl EnumClient {
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
    ///         .enum_
    ///         .get_and_return_enum(&WeatherReport::Sunny, None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_and_return_enum(
        &self,
        request: &WeatherReport,
        options: Option<RequestOptions>,
    ) -> Result<WeatherReport, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/enum",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
