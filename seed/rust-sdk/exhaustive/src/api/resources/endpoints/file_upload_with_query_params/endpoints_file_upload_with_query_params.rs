use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct FileUploadWithQueryParamsClient {
    pub http_client: HttpClient,
}

impl FileUploadWithQueryParamsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// File upload endpoint with query parameters.
    /// Tests that generated code correctly handles file upload requests
    /// that also have query parameters.
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
                "/file-upload-with-query-params/convert",
                request.clone().to_multipart(),
                QueryBuilder::new()
                    .string("maybeString", request.maybe_string.clone())
                    .int("integer", request.integer.clone())
                    .int("maybeInteger", request.maybe_integer.clone())
                    .build(),
                options,
            )
            .await
    }
}
