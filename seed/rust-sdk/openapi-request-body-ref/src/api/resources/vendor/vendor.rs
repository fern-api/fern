use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct VendorClient {
    pub http_client: HttpClient,
}

impl VendorClient {
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
    ///         .vendor
    ///         .update_vendor(
    ///             &"vendor_id".to_string(),
    ///             &UpdateVendorRequest {
    ///                 name: "name".to_string(),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update_vendor(
        &self,
        vendor_id: &str,
        request: &UpdateVendorRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vendor, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!("vendors/{}", vendor_id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
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
    ///         .vendor
    ///         .create_vendor(
    ///             &CreateVendorRequest {
    ///                 name: "name".to_string(),
    ///                 address: None,
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_vendor(
        &self,
        request: &CreateVendorRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vendor, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "vendors",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
