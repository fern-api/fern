use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
use reqwest::Method;

pub struct InlineUsersClient2 {
    pub http_client: HttpClient,
}

impl InlineUsersClient2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn list_with_cursor_pagination(
        &self,
        request: &InlineUsersInlineUsersListWithCursorPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithCursorPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPaginationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersMixedTypePaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersMixedTypePaginationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/inline-users",
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
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/inline-users",
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
    ) -> Result<WithRawResponse<ListUsersPaginationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/inline-users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn list_with_offset_pagination(
        &self,
        request: &InlineUsersInlineUsersListWithOffsetPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithOffsetPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPaginationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPaginationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/inline-users",
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
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/inline-users",
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
    ) -> Result<WithRawResponse<ListUsersPaginationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                "/inline-users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn list_with_offset_step_pagination(
        &self,
        request: &InlineUsersInlineUsersListWithOffsetStepPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithOffsetStepPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPaginationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithOffsetPaginationHasNextPageQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithOffsetPaginationHasNextPageQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersPaginationResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithExtendedResultsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersExtendedResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithExtendedResultsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersExtendedResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersExtendedOptionalListResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<ListUsersExtendedOptionalListResponse>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListUsernamesQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsernameCursor, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListUsernamesQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<UsernameCursor>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithGlobalConfigQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsernameContainer, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/inline-users",
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
        request: &InlineUsersInlineUsersListWithGlobalConfigQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<UsernameContainer>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/inline-users",
                None,
                QueryBuilder::new()
                    .int("offset", request.offset.clone())
                    .build(),
                options,
            )
            .await
    }
}
