use crate::api::*;
use crate::{ApiError, ByteStream, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct FileUploadClient {
    pub http_client: HttpClient,
}

impl FileUploadClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// File upload endpoint that returns void.
    /// This tests a basic multipart file upload.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    pub async fn convert(
        &self,
        request: &ConvertRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_multipart_request(
                Method::POST,
                "/file-upload/convert",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }

    /// File upload endpoint that returns a binary response (ByteStream).
    /// This tests the combination of multipart request + binary download response.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Streaming file download (use .into_bytes() to collect or stream chunks)
    pub async fn convert_streaming(
        &self,
        request: &ConvertStreamingRequest,
        options: Option<RequestOptions>,
    ) -> Result<ByteStream, ApiError> {
        self.http_client
            .execute_multipart_stream_request(
                Method::POST,
                "/file-upload/convert-streaming",
                request.clone().to_multipart(),
                None,
                options,
            )
            .await
    }
}
