use crate::{ClientConfig, ApiError, HttpClient, RequestOptions, QueryBuilder};
use reqwest::{Method};
use crate::api::{*};

pub struct InlineUsersInlineUsersClient {
    pub http_client: HttpClient,
}

impl InlineUsersInlineUsersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn inline_users_inline_users_list_with_cursor_pagination(&self, request: &InlineUsersInlineUsersListWithCursorPaginationQueryRequest, options: Option<RequestOptions>) -> Result<InlineUsersListUsersPaginationResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "inline-users/cursor",
            None,
            QueryBuilder::new().serialize("page", request.page.clone()).serialize("per_page", request.per_page.clone()).serialize("order", request.order.clone()).serialize("starting_after", request.starting_after.clone())
            .build(),
            options,
        ).await
    }

    pub async fn inline_users_inline_users_list_with_mixed_type_cursor_pagination(&self, request: &InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest, options: Option<RequestOptions>) -> Result<InlineUsersListUsersMixedTypePaginationResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "inline-users/mixed-type-cursor",
            None,
            QueryBuilder::new().serialize("cursor", request.cursor.clone())
            .build(),
            options,
        ).await
    }

    pub async fn inline_users_inline_users_list_with_body_cursor_pagination(&self, request: &InlineUsersInlineUsersListWithBodyCursorPaginationRequest, options: Option<RequestOptions>) -> Result<InlineUsersListUsersPaginationResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "inline-users/body-cursor",
            Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
            None,
            options,
        ).await
    }

    pub async fn inline_users_inline_users_list_with_offset_pagination(&self, request: &InlineUsersInlineUsersListWithOffsetPaginationQueryRequest, options: Option<RequestOptions>) -> Result<InlineUsersListUsersPaginationResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "inline-users/offset",
            None,
            QueryBuilder::new().serialize("page", request.page.clone()).serialize("per_page", request.per_page.clone()).serialize("order", request.order.clone()).serialize("starting_after", request.starting_after.clone())
            .build(),
            options,
        ).await
    }

    pub async fn inline_users_inline_users_list_with_double_offset_pagination(&self, request: &InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequest, options: Option<RequestOptions>) -> Result<InlineUsersListUsersPaginationResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "inline-users/double-offset",
            None,
            QueryBuilder::new().serialize("page", request.page.clone()).serialize("per_page", request.per_page.clone()).serialize("order", request.order.clone()).serialize("starting_after", request.starting_after.clone())
            .build(),
            options,
        ).await
    }

    pub async fn inline_users_inline_users_list_with_body_offset_pagination(&self, request: &InlineUsersInlineUsersListWithBodyOffsetPaginationRequest, options: Option<RequestOptions>) -> Result<InlineUsersListUsersPaginationResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "inline-users/body-offset",
            Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
            None,
            options,
        ).await
    }

    pub async fn inline_users_inline_users_list_with_offset_step_pagination(&self, request: &InlineUsersInlineUsersListWithOffsetStepPaginationQueryRequest, options: Option<RequestOptions>) -> Result<InlineUsersListUsersPaginationResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "inline-users/offset-step",
            None,
            QueryBuilder::new().serialize("page", request.page.clone()).serialize("limit", request.limit.clone()).serialize("order", request.order.clone())
            .build(),
            options,
        ).await
    }

    pub async fn inline_users_inline_users_list_with_offset_pagination_has_next_page(&self, request: &InlineUsersInlineUsersListWithOffsetPaginationHasNextPageQueryRequest, options: Option<RequestOptions>) -> Result<InlineUsersListUsersPaginationResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "inline-users/offset-has-next-page",
            None,
            QueryBuilder::new().serialize("page", request.page.clone()).serialize("limit", request.limit.clone()).serialize("order", request.order.clone())
            .build(),
            options,
        ).await
    }

    pub async fn inline_users_inline_users_list_with_extended_results(&self, request: &InlineUsersInlineUsersListWithExtendedResultsQueryRequest, options: Option<RequestOptions>) -> Result<InlineUsersListUsersExtendedResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "inline-users/extended",
            None,
            QueryBuilder::new().serialize("cursor", request.cursor.clone())
            .build(),
            options,
        ).await
    }

    pub async fn inline_users_inline_users_list_with_extended_results_and_optional_data(&self, request: &InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest, options: Option<RequestOptions>) -> Result<InlineUsersListUsersExtendedOptionalListResponse, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "inline-users/extended-optional",
            None,
            QueryBuilder::new().serialize("cursor", request.cursor.clone())
            .build(),
            options,
        ).await
    }

    pub async fn inline_users_inline_users_list_usernames(&self, request: &InlineUsersInlineUsersListUsernamesQueryRequest, options: Option<RequestOptions>) -> Result<UsernameCursor, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "inline-users/usernames",
            None,
            QueryBuilder::new().serialize("starting_after", request.starting_after.clone())
            .build(),
            options,
        ).await
    }

    pub async fn inline_users_inline_users_list_with_global_config(&self, request: &InlineUsersInlineUsersListWithGlobalConfigQueryRequest, options: Option<RequestOptions>) -> Result<InlineUsersUsernameContainer, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "inline-users/global-config",
            None,
            QueryBuilder::new().serialize("offset", request.offset.clone())
            .build(),
            options,
        ).await
    }

}

