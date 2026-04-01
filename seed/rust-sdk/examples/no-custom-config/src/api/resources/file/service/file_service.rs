use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct ServiceClient2 {
    pub http_client: HttpClient,
}

impl ServiceClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// This endpoint returns a file by its name.
    ///
    /// # Arguments
    ///
    /// * `filename` - This is a filename
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_file(
        &self,
        filename: &str,
        options: Option<RequestOptions>,
    ) -> Result<File, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/file/{}", filename),
                None,
                None,
                options,
            )
            .await
    }

    /// This endpoint returns a file by its name.
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `filename` - This is a filename
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_file_with_raw_response(
        &self,
        filename: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<File>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                &format!("/file/{}", filename),
                None,
                None,
                options,
            )
            .await
    }
}
