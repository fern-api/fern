use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct FilesClient {
    pub http_client: HttpClient,
}

impl FilesClient {
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
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .files
    ///         .upload(
    ///             &FilesUploadRequest {
    ///                 name: "name".to_string(),
    ///                 parent_id: "parent_id".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn upload(
        &self,
        request: &FilesUploadRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        let base_url = self
            .http_client
            .config()
            .environment
            .as_ref()
            .map_or(self.http_client.base_url(), |env| env.upload_url());
        self.http_client
            .execute_request_with_base_url(
                base_url,
                Method::POST,
                "files/content",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
