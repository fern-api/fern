use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
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
    ) -> Result<UsersListUsersPaginationResponse, ApiError> {
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

    pub async fn list_with_mixed_type_cursor_pagination(
        &self,
        request: &UsersListWithMixedTypeCursorPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsersListUsersMixedTypePaginationResponse, ApiError> {
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

    pub async fn list_with_body_cursor_pagination(
        &self,
        request: &ListUsersBodyCursorPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsersListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/users",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn list_with_offset_pagination(
        &self,
        request: &UsersListWithOffsetPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsersListUsersPaginationResponse, ApiError> {
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

    pub async fn list_with_double_offset_pagination(
        &self,
        request: &UsersListWithDoubleOffsetPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsersListUsersPaginationResponse, ApiError> {
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

    pub async fn list_with_body_offset_pagination(
        &self,
        request: &ListUsersBodyOffsetPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsersListUsersPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/users",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn list_with_offset_step_pagination(
        &self,
        request: &UsersListWithOffsetStepPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsersListUsersPaginationResponse, ApiError> {
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

    pub async fn list_with_offset_pagination_has_next_page(
        &self,
        request: &UsersListWithOffsetPaginationHasNextPageQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsersListUsersPaginationResponse, ApiError> {
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

    pub async fn list_with_extended_results(
        &self,
        request: &UsersListWithExtendedResultsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsersListUsersExtendedResponse, ApiError> {
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

    pub async fn list_with_extended_results_and_optional_data(
        &self,
        request: &UsersListWithExtendedResultsAndOptionalDataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsersListUsersExtendedOptionalListResponse, ApiError> {
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

    pub async fn list_with_global_config(
        &self,
        request: &UsersListWithGlobalConfigQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<UsersUsernameContainer, ApiError> {
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
}
