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
