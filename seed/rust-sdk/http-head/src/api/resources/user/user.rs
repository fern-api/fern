use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
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

    pub async fn head(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::HEAD, "/users", None, None, options)
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
    pub async fn head_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<()>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::HEAD, "/users", None, None, options)
            .await
    }

    pub async fn list(
        &self,
        request: &ListQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .build(),
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
    pub async fn list_with_raw_response(
        &self,
        request: &ListQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<User>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }
}
