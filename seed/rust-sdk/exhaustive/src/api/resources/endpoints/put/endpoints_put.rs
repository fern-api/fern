use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct PutClient {
    pub http_client: HttpClient,
}

impl PutClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn add(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<PutResponse, ApiError> {
        self.http_client
            .execute_request(Method::PUT, &format!("{}", id), None, None, options)
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
    pub async fn add_with_raw_response(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<PutResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::PUT, &format!("{}", id), None, None, options)
            .await
    }
}
