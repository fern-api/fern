use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ProductsClient {
    pub http_client: HttpClient,
}

impl ProductsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use test_x_fern_global_parameters_extension_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client =
    ///         TestXFernGlobalParametersExtensionClient::new(config).expect("Failed to build client");
    ///     client
    ///         .products
    ///         .search(
    ///             &"regionId".to_string(),
    ///             &SearchProductsRequest {
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn search(
        &self,
        region_id: &str,
        request: &SearchProductsRequest,
        options: Option<RequestOptions>,
    ) -> Result<SearchProductsResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("v1/products/{}/search", region_id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use test_x_fern_global_parameters_extension_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client =
    ///         TestXFernGlobalParametersExtensionClient::new(config).expect("Failed to build client");
    ///     client
    ///         .products
    ///         .get(&"regionId".to_string(), &"productId".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get(
        &self,
        region_id: &str,
        product_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Product, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("v1/products/{}/{}", region_id, product_id),
                None,
                None,
                options,
            )
            .await
    }
}
