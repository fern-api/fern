use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct OrdersClient {
    pub http_client: HttpClient,
}

impl OrdersClient {
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
    ///         .orders
    ///         .create(
    ///             &CreateOrdersRequest {
    ///                 customer_id: "customerId".to_string(),
    ///                 ship_to: CreateOrdersRequestShipTo {
    ///                     line1: "line1".to_string(),
    ///                     city: "city".to_string(),
    ///                     ..Default::default()
    ///                 },
    ///                 lines: vec![CreateOrdersRequestLinesItem {
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
        request: &CreateOrdersRequest,
        options: Option<RequestOptions>,
    ) -> Result<CreateOrdersResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "orders",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
