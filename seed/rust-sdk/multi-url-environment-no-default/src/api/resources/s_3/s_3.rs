use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct S3Client {
    pub http_client: HttpClient,
}

impl S3Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_presigned_url(
        &self,
        request: &GetPresignedUrlRequest,
        options: Option<RequestOptions>,
    ) -> Result<String, ApiError> {
        let base_url = self
            .http_client
            .config()
            .environment
            .as_ref()
            .map_or(self.http_client.base_url(), |env| env.s_3_url());
        self.http_client
            .execute_request_with_base_url(
                base_url,
                Method::POST,
                "/s3/presigned-url",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_presigned_url_with_raw_response(
        &self,
        request: &GetPresignedUrlRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<String>, ApiError> {
        let base_url = self
            .http_client
            .config()
            .environment
            .as_ref()
            .map_or(self.http_client.base_url(), |env| env.s_3_url());
        self.http_client
            .execute_request_with_raw_response_and_base_url(
                base_url,
                Method::POST,
                "/s3/presigned-url",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
