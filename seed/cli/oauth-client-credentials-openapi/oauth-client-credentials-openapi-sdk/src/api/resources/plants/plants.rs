use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct PlantsClient {
    pub http_client: HttpClient,
}

impl PlantsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use oauth_client_credentials_openapi_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = OauthClientCredentialsOpenapiClient::new(config).expect("Failed to build client");
    ///     client.plants.list(None).await;
    /// }
    /// ```
    pub async fn list(&self, options: Option<RequestOptions>) -> Result<Vec<Plant>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "plants", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use oauth_client_credentials_openapi_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = OauthClientCredentialsOpenapiClient::new(config).expect("Failed to build client");
    ///     client.plants.get(&"plantId".to_string(), None).await;
    /// }
    /// ```
    pub async fn get(
        &self,
        plant_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Plant, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("plants/{}", plant_id),
                None,
                None,
                options,
            )
            .await
    }
}
