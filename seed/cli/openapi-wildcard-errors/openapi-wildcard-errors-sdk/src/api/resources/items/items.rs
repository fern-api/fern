use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ItemsClient {
    pub http_client: HttpClient,
}

impl ItemsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use openapi_wildcard_errors_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = OpenapiWildcardErrorsClient::new(config).expect("Failed to build client");
    ///     client
    ///         .items
    ///         .create_item(
    ///             &CreateItemRequest {
    ///                 name: "name".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_item(
        &self,
        request: &CreateItemRequest,
        options: Option<RequestOptions>,
    ) -> Result<Item, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "items",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use openapi_wildcard_errors_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = OpenapiWildcardErrorsClient::new(config).expect("Failed to build client");
    ///     client.items.get_item(&"item_id".to_string(), None).await;
    /// }
    /// ```
    pub async fn get_item(
        &self,
        item_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Item, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("items/{}", item_id),
                None,
                None,
                options,
            )
            .await
    }
}
