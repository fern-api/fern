use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn post(
        &self,
        endpoint_param: &str,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/{}", endpoint_param),
                None,
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
    pub async fn post_with_raw_response(
        &self,
        endpoint_param: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<()>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                &format!("/{}", endpoint_param),
                None,
                None,
                options,
            )
            .await
    }
}
