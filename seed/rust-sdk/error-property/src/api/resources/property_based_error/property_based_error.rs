use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct PropertyBasedErrorClient {
    pub http_client: HttpClient,
}

impl PropertyBasedErrorClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// GET request that always throws an error
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn throw_error(&self, options: Option<RequestOptions>) -> Result<String, ApiError> {
        self.http_client
            .execute_request(Method::GET, "property-based-error", None, None, options)
            .await
    }

    /// GET request that always throws an error
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn throw_error_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<String>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "property-based-error",
                None,
                None,
                options,
            )
            .await
    }
}
