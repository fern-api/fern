use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
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

    pub async fn list_usernames_custom(
        &self,
        request: &ListUsernamesCustomQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsernameCursor, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .string("starting_after", request.starting_after.clone())
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
    /// * `starting_after` - The cursor used for pagination in order to fetch
    /// the next page of results.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn list_usernames_custom_with_raw_response(
        &self,
        request: &ListUsernamesCustomQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<UsernameCursor>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .string("starting_after", request.starting_after.clone())
                    .build(),
                options,
            )
            .await
    }
}
