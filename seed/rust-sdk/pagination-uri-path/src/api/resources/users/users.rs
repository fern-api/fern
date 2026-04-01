use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct UsersClient {
    pub http_client: HttpClient,
}

impl UsersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn list_with_uri_pagination(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersUriPaginationResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/users/uri", None, None, options)
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
    pub async fn list_with_uri_pagination_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersUriPaginationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "/users/uri", None, None, options)
            .await
    }

    pub async fn list_with_path_pagination(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPathPaginationResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/users/path", None, None, options)
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
    pub async fn list_with_path_pagination_with_raw_response(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPathPaginationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(Method::GET, "/users/path", None, None, options)
            .await
    }
}
