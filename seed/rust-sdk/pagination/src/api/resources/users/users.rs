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

    pub async fn list_with_cursor_pagination(
        &self,
        request: &UsersListWithCursorPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse2, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
                    .int("per_page", request.per_page.clone())
                    .serialize("order", request.order.clone())
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
    /// * `page` - Defaults to first page
    /// * `per_page` - Defaults to per page
    /// * `starting_after` - The cursor used for pagination in order to fetch
    /// the next page of results.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn list_with_cursor_pagination_with_raw_response(
        &self,
        request: &UsersListWithCursorPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPaginationResponse2>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
                    .int("per_page", request.per_page.clone())
                    .serialize("order", request.order.clone())
                    .string("starting_after", request.starting_after.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn list_with_mixed_type_cursor_pagination(
        &self,
        request: &UsersListWithMixedTypeCursorPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersMixedTypePaginationResponse2, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/users",
                None,
                QueryBuilder::new()
                    .string("cursor", request.cursor.clone())
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
    pub async fn list_with_mixed_type_cursor_pagination_with_raw_response(
        &self,
        request: &UsersListWithMixedTypeCursorPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersMixedTypePaginationResponse2>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/users",
                None,
                QueryBuilder::new()
                    .string("cursor", request.cursor.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn list_with_body_cursor_pagination(
        &self,
        request: &ListUsersBodyCursorPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse2, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
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
    pub async fn list_with_body_cursor_pagination_with_raw_response(
        &self,
        request: &ListUsersBodyCursorPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPaginationResponse2>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Pagination endpoint with a top-level cursor field in the request body.
    /// This tests that the mock server correctly ignores cursor mismatches
    /// when getNextPage() is called with a different cursor value.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn list_with_top_level_body_cursor_pagination(
        &self,
        request: &ListUsersTopLevelBodyCursorPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersTopLevelCursorPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/users/top-level-cursor",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Pagination endpoint with a top-level cursor field in the request body.
    /// This tests that the mock server correctly ignores cursor mismatches
    /// when getNextPage() is called with a different cursor value.
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
    pub async fn list_with_top_level_body_cursor_pagination_with_raw_response(
        &self,
        request: &ListUsersTopLevelBodyCursorPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersTopLevelCursorPaginationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/users/top-level-cursor",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn list_with_offset_pagination(
        &self,
        request: &UsersListWithOffsetPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse2, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
                    .int("per_page", request.per_page.clone())
                    .serialize("order", request.order.clone())
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
    /// * `page` - Defaults to first page
    /// * `per_page` - Defaults to per page
    /// * `starting_after` - The cursor used for pagination in order to fetch
    /// the next page of results.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn list_with_offset_pagination_with_raw_response(
        &self,
        request: &UsersListWithOffsetPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPaginationResponse2>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
                    .int("per_page", request.per_page.clone())
                    .serialize("order", request.order.clone())
                    .string("starting_after", request.starting_after.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn list_with_double_offset_pagination(
        &self,
        request: &UsersListWithDoubleOffsetPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse2, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .float("page", request.page.clone())
                    .float("per_page", request.per_page.clone())
                    .serialize("order", request.order.clone())
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
    /// * `page` - Defaults to first page
    /// * `per_page` - Defaults to per page
    /// * `starting_after` - The cursor used for pagination in order to fetch
    /// the next page of results.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn list_with_double_offset_pagination_with_raw_response(
        &self,
        request: &UsersListWithDoubleOffsetPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPaginationResponse2>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .float("page", request.page.clone())
                    .float("per_page", request.per_page.clone())
                    .serialize("order", request.order.clone())
                    .string("starting_after", request.starting_after.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn list_with_body_offset_pagination(
        &self,
        request: &ListUsersBodyOffsetPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse2, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
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
    pub async fn list_with_body_offset_pagination_with_raw_response(
        &self,
        request: &ListUsersBodyOffsetPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPaginationResponse2>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn list_with_offset_step_pagination(
        &self,
        request: &UsersListWithOffsetStepPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse2, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
                    .int("limit", request.limit.clone())
                    .serialize("order", request.order.clone())
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
    /// * `page` - Defaults to first page
    /// * `limit` - The maximum number of elements to return.
    /// This is also used as the step size in this
    /// paginated endpoint.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn list_with_offset_step_pagination_with_raw_response(
        &self,
        request: &UsersListWithOffsetStepPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPaginationResponse2>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
                    .int("limit", request.limit.clone())
                    .serialize("order", request.order.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn list_with_offset_pagination_has_next_page(
        &self,
        request: &UsersListWithOffsetPaginationHasNextPageQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse2, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
                    .int("limit", request.limit.clone())
                    .serialize("order", request.order.clone())
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
    /// * `page` - Defaults to first page
    /// * `limit` - The maximum number of elements to return.
    /// This is also used as the step size in this
    /// paginated endpoint.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn list_with_offset_pagination_has_next_page_with_raw_response(
        &self,
        request: &UsersListWithOffsetPaginationHasNextPageQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPaginationResponse2>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
                    .int("limit", request.limit.clone())
                    .serialize("order", request.order.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn list_with_extended_results(
        &self,
        request: &UsersListWithExtendedResultsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersExtendedResponse2, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .uuid("cursor", request.cursor.clone())
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
    pub async fn list_with_extended_results_with_raw_response(
        &self,
        request: &UsersListWithExtendedResultsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersExtendedResponse2>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .uuid("cursor", request.cursor.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn list_with_extended_results_and_optional_data(
        &self,
        request: &UsersListWithExtendedResultsAndOptionalDataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersExtendedOptionalListResponse2, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .uuid("cursor", request.cursor.clone())
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
    pub async fn list_with_extended_results_and_optional_data_with_raw_response(
        &self,
        request: &UsersListWithExtendedResultsAndOptionalDataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersExtendedOptionalListResponse2>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .uuid("cursor", request.cursor.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn list_usernames(
        &self,
        request: &UsersListUsernamesQueryRequest,
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
    pub async fn list_usernames_with_raw_response(
        &self,
        request: &UsersListUsernamesQueryRequest,
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

    pub async fn list_usernames_with_optional_response(
        &self,
        request: &ListUsernamesWithOptionalResponseQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Option<UsernameCursor>, ApiError> {
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
    pub async fn list_usernames_with_optional_response_with_raw_response(
        &self,
        request: &ListUsernamesWithOptionalResponseQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Option<UsernameCursor>>, ApiError> {
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

    pub async fn list_with_global_config(
        &self,
        request: &UsersListWithGlobalConfigQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsernameContainer2, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .int("offset", request.offset.clone())
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
    pub async fn list_with_global_config_with_raw_response(
        &self,
        request: &UsersListWithGlobalConfigQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<UsernameContainer2>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .int("offset", request.offset.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn list_with_optional_data(
        &self,
        request: &ListWithOptionalDataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersOptionalDataPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users/optional-data",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
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
    /// * `page` - Defaults to first page
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn list_with_optional_data_with_raw_response(
        &self,
        request: &ListWithOptionalDataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersOptionalDataPaginationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/users/optional-data",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
                    .build(),
                options,
            )
            .await
    }
}
