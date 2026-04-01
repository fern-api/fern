use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get(&self, id: &str, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client
            .execute_request(Method::GET, &format!("/users/{}", id), None, None, options)
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
    pub async fn get_with_raw_response(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<User>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                &format!("/users/{}", id),
                None,
                None,
                options,
            )
            .await
    }
}
