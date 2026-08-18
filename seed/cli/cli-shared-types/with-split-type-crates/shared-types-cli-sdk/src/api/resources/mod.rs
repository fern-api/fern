//! Service clients and API endpoints
//!
//! This module contains client implementations for:
//!
//! - **Catalog**
//! - **Billing**

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub mod billing;
pub mod catalog;
pub struct ApiClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
    pub catalog: CatalogClient,
    pub billing: BillingClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
            catalog: CatalogClient::new(config.clone())?,
            billing: BillingClient::new(config.clone())?,
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
    ///     client
    ///         .import_item(
    ///             &ImportItemRequest {
    ///                 item: CatalogItem {
    ///                     id: "id".to_string(),
    ///                     name: "name".to_string(),
    ///                     price: Money {
    ///                         amount: 1.1,
    ///                         currency: "currency".to_string(),
    ///                         ..Default::default()
    ///                     },
    ///                     ..Default::default()
    ///                 },
    ///                 dry_run: None,
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn import_item(
        &self,
        request: &ImportItemRequest,
        options: Option<RequestOptions>,
    ) -> Result<ImportItemResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "import",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}

pub use billing::BillingClient;
pub use catalog::CatalogClient;
