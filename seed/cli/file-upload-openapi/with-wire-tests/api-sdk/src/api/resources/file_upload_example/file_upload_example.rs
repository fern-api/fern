use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct FileUploadExampleClient {
    pub http_client: HttpClient,
}

impl FileUploadExampleClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Upload a file to the database
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
    /// use api_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .file_upload_example
    ///         .upload_file(
    ///             &UploadFileRequest {
    ///                 file: b"test file content".to_vec(),
    ///                 name: "name".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn upload_file(
        &self,
        request: &UploadFileRequest,
        options: Option<RequestOptions>,
    ) -> Result<FileId, ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "upload-file",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }
}
