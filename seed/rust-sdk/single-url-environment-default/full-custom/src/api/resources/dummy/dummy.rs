use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct DummyClient {
    pub http_client: HttpClient,
}

impl DummyClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_dummy(&self, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::GET, "dummy", None, None, options)
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
    pub async fn get_dummy_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<String>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "dummy", None, None, options)
            .await
    }
}
