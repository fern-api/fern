use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct PaginationClient {
    pub http_client: HttpClient,
}

impl PaginationClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// List items with cursor pagination
    ///
    /// # Arguments
    ///
    /// * `cursor` - The cursor for pagination
    /// * `limit` - Maximum number of items to return
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn list_items(
        &self,
        request: &ListItemsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<PaginatedResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/pagination",
                None,
                QueryBuilder::new()
                    .string("cursor", request.cursor.clone())
                    .int("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }

    /// List items with cursor pagination
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `cursor` - The cursor for pagination
    /// * `limit` - Maximum number of items to return
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn list_items_with_raw_response(
        &self,
        request: &ListItemsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<PaginatedResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/pagination",
                None,
                QueryBuilder::new()
                    .string("cursor", request.cursor.clone())
                    .int("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }
}
