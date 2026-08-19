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
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .catalog
    ///         .create_catalog_image(
    ///             &CreateCatalogImageRequest {
    ///                 image_file: b"test file content".to_vec(),
    ///                 request: CreateCatalogImageRequest {
    ///                     catalog_object_id: "catalog_object_id".to_string(),
    ///                     ..Default::default()
    ///                 },
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_catalog_image(
        &self,
        request: &CreateCatalogImageRequest,
        options: Option<RequestOptions>,
    ) -> Result<CatalogImage, ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "catalog/images",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .catalog
    ///         .get_catalog_image(&"image_id".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_catalog_image(
        &self,
        image_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<CatalogImage, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("catalog/images/{}", image_id),
                None,
                None,
                options,
            )
            .await
    }
}
