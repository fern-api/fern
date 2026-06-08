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
