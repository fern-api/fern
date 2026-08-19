use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inline_users
    ///         .inline_users
    ///         .list_with_cursor_pagination(
    ///             &InlineUsersInlineUsersListWithCursorPaginationQueryRequest {
    ///                 page: Some(1),
    ///                 per_page: Some(1),
    ///                 order: Some(Order::Asc),
    ///                 starting_after: Some("starting_after".to_string()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inline_users
    ///         .inline_users
    ///         .list_with_mixed_type_cursor_pagination(
    ///             &InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest {
    ///                 cursor: Some("cursor".to_string()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inline_users
    ///         .inline_users
    ///         .list_with_mixed_type_cursor_pagination(
    ///             &InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest {
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inline_users
    ///         .inline_users
    ///         .list_with_cursor_pagination(
    ///             &InlineUsersInlineUsersListWithCursorPaginationQueryRequest {
    ///                 page: Some(1),
    ///                 per_page: Some(1),
    ///                 order: Some(Order::Asc),
    ///                 starting_after: Some("starting_after".to_string()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inline_users
    ///         .inline_users
    ///         .list_with_double_offset_pagination(
    ///             &InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequest {
    ///                 page: Some(1.1),
    ///                 per_page: Some(1.1),
    ///                 order: Some(Order::Asc),
    ///                 starting_after: Some("starting_after".to_string()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inline_users
    ///         .inline_users
    ///         .list_with_mixed_type_cursor_pagination(
    ///             &InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest {
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inline_users
    ///         .inline_users
    ///         .list_with_offset_step_pagination(
    ///             &InlineUsersInlineUsersListWithOffsetStepPaginationQueryRequest {
    ///                 page: Some(1),
    ///                 limit: Some(1),
    ///                 order: Some(Order::Asc),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inline_users
    ///         .inline_users
    ///         .list_with_offset_step_pagination(
    ///             &InlineUsersInlineUsersListWithOffsetStepPaginationQueryRequest {
    ///                 page: Some(1),
    ///                 limit: Some(1),
    ///                 order: Some(Order::Asc),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inline_users
    ///         .inline_users
    ///         .list_with_extended_results(
    ///             &InlineUsersInlineUsersListWithExtendedResultsQueryRequest {
    ///                 cursor: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inline_users
    ///         .inline_users
    ///         .list_with_extended_results(
    ///             &InlineUsersInlineUsersListWithExtendedResultsQueryRequest {
    ///                 cursor: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inline_users
    ///         .inline_users
    ///         .list_with_cursor_pagination(
    ///             &InlineUsersInlineUsersListWithCursorPaginationQueryRequest {
    ///                 starting_after: Some("starting_after".to_string()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationClient::new(config).expect("Failed to build client");
    ///     client
    ///         .inline_users
    ///         .inline_users
    ///         .list_with_global_config(
    ///             &InlineUsersInlineUsersListWithGlobalConfigQueryRequest {
    ///                 offset: Some(1),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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
}
