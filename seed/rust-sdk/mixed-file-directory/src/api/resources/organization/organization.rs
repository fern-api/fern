use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct OrganizationClient {
    pub http_client: HttpClient,
}

impl OrganizationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Create a new organization.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_mixed_file_directory::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    ///     client
    ///         .organization
    ///         .create(
    ///             &CreateOrganizationRequest {
    ///                 name: "name".to_string(),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create(
        &self,
        request: &CreateOrganizationRequest,
        options: Option<RequestOptions>,
    ) -> Result<Organization, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/organizations/",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
