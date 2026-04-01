use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub mod problem;
pub use problem::ProblemClient2;
pub mod v_3;
pub use v_3::V3Client;
pub struct V2Client {
    pub http_client: HttpClient,
    pub problem: ProblemClient2,
    pub v_3: V3Client,
}

impl V2Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            problem: ProblemClient2::new(config.clone())?,
            v_3: V3Client::new(config.clone())?,
        })
    }

    pub async fn test(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::GET, "", None, None, options)
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
    pub async fn test_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<()>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "", None, None, options)
            .await
    }
}
