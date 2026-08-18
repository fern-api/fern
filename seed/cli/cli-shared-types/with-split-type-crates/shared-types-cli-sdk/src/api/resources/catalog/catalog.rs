use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct CatalogClient {
    pub http_client: HttpClient,
}

impl CatalogClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use shared_types_cli_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = SharedTypesCliClient::new(config).expect("Failed to build client");
    ///     client.catalog.list_items(None).await;
    /// }
    /// ```
    pub async fn list_items(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<CatalogItem>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "catalog/items", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use shared_types_cli_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = SharedTypesCliClient::new(config).expect("Failed to build client");
    ///     client.catalog.list_categories(None).await;
    /// }
    /// ```
    pub async fn list_categories(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Category>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "catalog/categories", None, None, options)
            .await
    }
}
