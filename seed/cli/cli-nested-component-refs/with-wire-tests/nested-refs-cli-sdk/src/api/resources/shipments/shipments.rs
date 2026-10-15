use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ShipmentsClient {
    pub http_client: HttpClient,
}

impl ShipmentsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use nested_refs_cli_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NestedRefsCliClient::new(config).expect("Failed to build client");
    ///     client
    ///         .shipments
    ///         .create(
    ///             &CreateShipmentsRequest {
    ///                 destination: CreateShipmentsRequestDestination {
    ///                     line1: "line1".to_string(),
    ///                     city: "city".to_string(),
    ///                     ..Default::default()
    ///                 },
    ///                 items: vec![CreateShipmentsRequestItemsItem {
    ///                     sku: "sku".to_string(),
    ///                     quantity: 1,
    ///                     ..Default::default()
    ///                 }],
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create(
        &self,
        request: &CreateShipmentsRequest,
        options: Option<RequestOptions>,
    ) -> Result<Shipment, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "shipments",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
