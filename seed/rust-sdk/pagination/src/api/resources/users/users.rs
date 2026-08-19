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
    ///         .users
    ///         .list_with_cursor_pagination(
    ///             &UsersListWithCursorPaginationQueryRequest {
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
    ///         .users
    ///         .list_with_mixed_type_cursor_pagination(
    ///             &UsersListWithMixedTypeCursorPaginationQueryRequest {
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
    ///         .users
    ///         .list_with_mixed_type_cursor_pagination(
    ///             &UsersListWithMixedTypeCursorPaginationQueryRequest {
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
    ///
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
    ///         .users
    ///         .list_with_top_level_body_cursor_pagination(
    ///             &ListUsersTopLevelBodyCursorPaginationRequest {
    ///                 cursor: Some("initial_cursor".to_string()),
    ///                 filter: Some("active".to_string()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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
    ///         .users
    ///         .list_with_cursor_pagination(
    ///             &UsersListWithCursorPaginationQueryRequest {
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
    ///         .users
    ///         .list_with_double_offset_pagination(
    ///             &UsersListWithDoubleOffsetPaginationQueryRequest {
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
    ///         .users
    ///         .list_with_mixed_type_cursor_pagination(
    ///             &UsersListWithMixedTypeCursorPaginationQueryRequest {
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
    ///         .users
    ///         .list_with_offset_step_pagination(
    ///             &UsersListWithOffsetStepPaginationQueryRequest {
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
    ///         .users
    ///         .list_with_offset_step_pagination(
    ///             &UsersListWithOffsetStepPaginationQueryRequest {
    ///                 page: Some(1),
    ///                 limit: Some(3),
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
    ///         .users
    ///         .list_with_extended_results(
    ///             &UsersListWithExtendedResultsQueryRequest {
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
    ///         .users
    ///         .list_with_extended_results(
    ///             &UsersListWithExtendedResultsQueryRequest {
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
    ///         .users
    ///         .list_with_cursor_pagination(
    ///             &UsersListWithCursorPaginationQueryRequest {
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
    ///         .users
    ///         .list_with_cursor_pagination(
    ///             &UsersListWithCursorPaginationQueryRequest {
    ///                 starting_after: Some("starting_after".to_string()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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
    ///         .users
    ///         .list_with_global_config(
    ///             &UsersListWithGlobalConfigQueryRequest {
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
    ///         .users
    ///         .list_with_optional_data(
    ///             &ListWithOptionalDataQueryRequest {
    ///                 page: Some(1),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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
    ///         .users
    ///         .list_with_aliased_data(
    ///             &ListWithAliasedDataQueryRequest {
    ///                 page: Some(1),
    ///                 per_page: Some(1),
    ///                 starting_after: Some("starting_after".to_string()),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn list_with_aliased_data(
        &self,
        request: &ListWithAliasedDataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersAliasedDataPaginationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users/aliased-data",
                None,
                QueryBuilder::new()
                    .int("page", request.page.clone())
                    .int("per_page", request.per_page.clone())
                    .string("starting_after", request.starting_after.clone())
                    .build(),
                options,
            )
            .await
    }
}
