use crate::api::*;
use crate::{
    ApiError, AsyncPaginator, ClientConfig, HttpClient, PaginationResult, QueryBuilder,
    RequestOptions,
};
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

    pub async fn list_with_cursor_pagination_paginated(
        &self,
        request: &InlineUsersInlineUsersListWithCursorPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = QueryBuilder::new()
            .int("page", request.page.clone())
            .int("per_page", request.per_page.clone())
            .serialize("order", request.order.clone())
            .build();
        let options_clone = options.clone();
        let request_clone = request.clone();

        AsyncPaginator::new(
            http_client,
            move |client, cursor_value| {
                let mut query_params: Vec<(String, String)> =
                    base_query_params.clone().unwrap_or_default();
                if let Some(cursor) = cursor_value {
                    // Add cursor parameter based on pagination configuration
                    query_params.push(("starting_after".to_string(), cursor));
                }
                let options_for_request = options_clone.clone();

                // Clone captured variables to move into the async block
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::GET,
                            "/inline-users",
                            None,
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction using pagination configuration
                    let items: Vec<serde_json::Value> = response
                        .get("data")
                        .and_then(|v| v.get("users"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let next_cursor: Option<String> = response
                        .get("page")
                        .and_then(|v| v.get("next"))
                        .and_then(|v| v.get("starting_after"))
                        .and_then(|v| v.as_str().map(|s| s.to_string()));
                    let has_next_page = next_cursor.is_some();

                    Ok(PaginationResult {
                        items,
                        next_cursor,
                        has_next_page,
                        response: Some(response),
                        status_code: Some(_status_code),
                        headers: Some(_headers),
                    })
                })
            },
            None, // Start with no cursor
        )
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

    pub async fn list_with_mixed_type_cursor_pagination_paginated(
        &self,
        request: &InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = None;
        let options_clone = options.clone();
        let request_clone = request.clone();

        AsyncPaginator::new(
            http_client,
            move |client, cursor_value| {
                let mut query_params: Vec<(String, String)> =
                    base_query_params.clone().unwrap_or_default();
                if let Some(cursor) = cursor_value {
                    // Add cursor parameter based on pagination configuration
                    query_params.push(("cursor".to_string(), cursor));
                }
                let options_for_request = options_clone.clone();

                // Clone captured variables to move into the async block
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::POST,
                            "/inline-users",
                            None,
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction using pagination configuration
                    let items: Vec<serde_json::Value> = response
                        .get("data")
                        .and_then(|v| v.get("users"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let next_cursor: Option<String> = response
                        .get("next")
                        .and_then(|v| v.as_str().map(|s| s.to_string()));
                    let has_next_page = next_cursor.is_some();

                    Ok(PaginationResult {
                        items,
                        next_cursor,
                        has_next_page,
                        response: Some(response),
                        status_code: Some(_status_code),
                        headers: Some(_headers),
                    })
                })
            },
            None, // Start with no cursor
        )
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

    pub async fn list_with_body_cursor_pagination_paginated(
        &self,
        request: &ListUsersBodyCursorPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = None;
        let options_clone = options.clone();
        let request_clone = request.clone();

        AsyncPaginator::new(
            http_client,
            move |client, cursor_value| {
                let mut query_params: Vec<(String, String)> =
                    base_query_params.clone().unwrap_or_default();
                if let Some(cursor) = cursor_value {
                    // Add cursor parameter based on pagination configuration
                    query_params.push(("cursor".to_string(), cursor));
                }
                let options_for_request = options_clone.clone();

                // Clone captured variables to move into the async block
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::POST,
                            "/inline-users",
                            Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction using pagination configuration
                    let items: Vec<serde_json::Value> = response
                        .get("data")
                        .and_then(|v| v.get("users"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let next_cursor: Option<String> = response
                        .get("page")
                        .and_then(|v| v.get("next"))
                        .and_then(|v| v.get("starting_after"))
                        .and_then(|v| v.as_str().map(|s| s.to_string()));
                    let has_next_page = next_cursor.is_some();

                    Ok(PaginationResult {
                        items,
                        next_cursor,
                        has_next_page,
                        response: Some(response),
                        status_code: Some(_status_code),
                        headers: Some(_headers),
                    })
                })
            },
            None, // Start with no cursor
        )
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

    pub async fn list_with_offset_pagination_paginated(
        &self,
        request: &InlineUsersInlineUsersListWithOffsetPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = QueryBuilder::new()
            .int("per_page", request.per_page.clone())
            .serialize("order", request.order.clone())
            .string("starting_after", request.starting_after.clone())
            .build();
        let options_clone = options.clone();
        let request_clone = request.clone();

        AsyncPaginator::new(
            http_client,
            move |client, page_token| {
                let mut query_params: Vec<(String, String)> =
                    base_query_params.clone().unwrap_or_default();

                // Use page_token as offset/page number (start from 0 if None)
                let current_page = page_token.unwrap_or_else(|| "0".to_string());
                query_params.push(("page".to_string(), current_page.clone()));

                let options_for_request = options_clone.clone();

                // Clone captured variables to move into the async block
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::GET,
                            "/inline-users",
                            None,
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction for offset pagination
                    let items: Vec<serde_json::Value> = response
                        .get("data")
                        .and_then(|v| v.get("users"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let has_next_page = !items.is_empty();
                    // Calculate next page number for offset pagination
                    let next_cursor: Option<String> = if has_next_page {
                        let current_page_num: u64 = current_page.parse().unwrap_or(0);
                        let step_size = if let Some(step) = response.get("per_page") {
                            step.as_u64().unwrap_or(1)
                        } else {
                            1 // Default step size
                        };
                        Some((current_page_num + step_size).to_string())
                    } else {
                        None
                    };

                    Ok(PaginationResult {
                        items,
                        next_cursor,
                        has_next_page,
                        response: Some(response),
                        status_code: Some(_status_code),
                        headers: Some(_headers),
                    })
                })
            },
            None, // Start with page 0
        )
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

    pub async fn list_with_double_offset_pagination_paginated(
        &self,
        request: &InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = QueryBuilder::new()
            .float("per_page", request.per_page.clone())
            .serialize("order", request.order.clone())
            .string("starting_after", request.starting_after.clone())
            .build();
        let options_clone = options.clone();
        let request_clone = request.clone();

        AsyncPaginator::new(
            http_client,
            move |client, page_token| {
                let mut query_params: Vec<(String, String)> =
                    base_query_params.clone().unwrap_or_default();

                // Use page_token as offset/page number (start from 0 if None)
                let current_page = page_token.unwrap_or_else(|| "0".to_string());
                query_params.push(("page".to_string(), current_page.clone()));

                let options_for_request = options_clone.clone();

                // Clone captured variables to move into the async block
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::GET,
                            "/inline-users",
                            None,
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction for offset pagination
                    let items: Vec<serde_json::Value> = response
                        .get("data")
                        .and_then(|v| v.get("users"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let has_next_page = !items.is_empty();
                    // Calculate next page number for offset pagination
                    let next_cursor: Option<String> = if has_next_page {
                        let current_page_num: u64 = current_page.parse().unwrap_or(0);
                        let step_size = if let Some(step) = response.get("per_page") {
                            step.as_u64().unwrap_or(1)
                        } else {
                            1 // Default step size
                        };
                        Some((current_page_num + step_size).to_string())
                    } else {
                        None
                    };

                    Ok(PaginationResult {
                        items,
                        next_cursor,
                        has_next_page,
                        response: Some(response),
                        status_code: Some(_status_code),
                        headers: Some(_headers),
                    })
                })
            },
            None, // Start with page 0
        )
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

    pub async fn list_with_body_offset_pagination_paginated(
        &self,
        request: &ListUsersBodyOffsetPaginationRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = None;
        let options_clone = options.clone();
        let request_clone = request.clone();

        AsyncPaginator::new(
            http_client,
            move |client, page_token| {
                let mut query_params: Vec<(String, String)> =
                    base_query_params.clone().unwrap_or_default();

                // Use page_token as offset/page number (start from 0 if None)
                let current_page = page_token.unwrap_or_else(|| "0".to_string());
                query_params.push(("page".to_string(), current_page.clone()));

                let options_for_request = options_clone.clone();

                // Clone captured variables to move into the async block
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::POST,
                            "/inline-users",
                            Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction for offset pagination
                    let items: Vec<serde_json::Value> = response
                        .get("data")
                        .and_then(|v| v.get("users"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let has_next_page = !items.is_empty();
                    // Calculate next page number for offset pagination
                    let next_cursor: Option<String> = if has_next_page {
                        let current_page_num: u64 = current_page.parse().unwrap_or(0);
                        let step_size = if let Some(step) = response.get("per_page") {
                            step.as_u64().unwrap_or(1)
                        } else {
                            1 // Default step size
                        };
                        Some((current_page_num + step_size).to_string())
                    } else {
                        None
                    };

                    Ok(PaginationResult {
                        items,
                        next_cursor,
                        has_next_page,
                        response: Some(response),
                        status_code: Some(_status_code),
                        headers: Some(_headers),
                    })
                })
            },
            None, // Start with page 0
        )
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

    pub async fn list_with_offset_step_pagination_paginated(
        &self,
        request: &InlineUsersInlineUsersListWithOffsetStepPaginationQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = QueryBuilder::new()
            .serialize("order", request.order.clone())
            .build();
        let options_clone = options.clone();
        let request_clone = request.clone();

        AsyncPaginator::new(
            http_client,
            move |client, page_token| {
                let mut query_params: Vec<(String, String)> =
                    base_query_params.clone().unwrap_or_default();

                // Use page_token as offset/page number (start from 0 if None)
                let current_page = page_token.unwrap_or_else(|| "0".to_string());
                query_params.push(("page".to_string(), current_page.clone()));

                let options_for_request = options_clone.clone();

                // Clone captured variables to move into the async block
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::GET,
                            "/inline-users",
                            None,
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction for offset pagination
                    let items: Vec<serde_json::Value> = response
                        .get("data")
                        .and_then(|v| v.get("users"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let has_next_page = !items.is_empty();
                    // Calculate next page number for offset pagination
                    let next_cursor: Option<String> = if has_next_page {
                        let current_page_num: u64 = current_page.parse().unwrap_or(0);
                        let step_size = if let Some(step) = response.get("limit") {
                            step.as_u64().unwrap_or(1)
                        } else {
                            1 // Default step size
                        };
                        Some((current_page_num + step_size).to_string())
                    } else {
                        None
                    };

                    Ok(PaginationResult {
                        items,
                        next_cursor,
                        has_next_page,
                        response: Some(response),
                        status_code: Some(_status_code),
                        headers: Some(_headers),
                    })
                })
            },
            None, // Start with page 0
        )
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

    pub async fn list_with_offset_pagination_has_next_page_paginated(
        &self,
        request: &InlineUsersInlineUsersListWithOffsetPaginationHasNextPageQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = QueryBuilder::new()
            .serialize("order", request.order.clone())
            .build();
        let options_clone = options.clone();
        let request_clone = request.clone();

        AsyncPaginator::new(
            http_client,
            move |client, page_token| {
                let mut query_params: Vec<(String, String)> =
                    base_query_params.clone().unwrap_or_default();

                // Use page_token as offset/page number (start from 0 if None)
                let current_page = page_token.unwrap_or_else(|| "0".to_string());
                query_params.push(("page".to_string(), current_page.clone()));

                let options_for_request = options_clone.clone();

                // Clone captured variables to move into the async block
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::GET,
                            "/inline-users",
                            None,
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction for offset pagination
                    let items: Vec<serde_json::Value> = response
                        .get("data")
                        .and_then(|v| v.get("users"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let has_next_page = response
                        .get("hasNextPage")
                        .and_then(|v| v.as_bool())
                        .unwrap_or(!items.is_empty());
                    // Calculate next page number for offset pagination
                    let next_cursor: Option<String> = if has_next_page {
                        let current_page_num: u64 = current_page.parse().unwrap_or(0);
                        let step_size = if let Some(step) = response.get("limit") {
                            step.as_u64().unwrap_or(1)
                        } else {
                            1 // Default step size
                        };
                        Some((current_page_num + step_size).to_string())
                    } else {
                        None
                    };

                    Ok(PaginationResult {
                        items,
                        next_cursor,
                        has_next_page,
                        response: Some(response),
                        status_code: Some(_status_code),
                        headers: Some(_headers),
                    })
                })
            },
            None, // Start with page 0
        )
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

    pub async fn list_with_extended_results_paginated(
        &self,
        request: &InlineUsersInlineUsersListWithExtendedResultsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = None;
        let options_clone = options.clone();
        let request_clone = request.clone();

        AsyncPaginator::new(
            http_client,
            move |client, cursor_value| {
                let mut query_params: Vec<(String, String)> =
                    base_query_params.clone().unwrap_or_default();
                if let Some(cursor) = cursor_value {
                    // Add cursor parameter based on pagination configuration
                    query_params.push(("cursor".to_string(), cursor));
                }
                let options_for_request = options_clone.clone();

                // Clone captured variables to move into the async block
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::GET,
                            "/inline-users",
                            None,
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction using pagination configuration
                    let items: Vec<serde_json::Value> = response
                        .get("data")
                        .and_then(|v| v.get("users"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let next_cursor: Option<String> = response
                        .get("next")
                        .and_then(|v| v.as_str().map(|s| s.to_string()));
                    let has_next_page = next_cursor.is_some();

                    Ok(PaginationResult {
                        items,
                        next_cursor,
                        has_next_page,
                        response: Some(response),
                        status_code: Some(_status_code),
                        headers: Some(_headers),
                    })
                })
            },
            None, // Start with no cursor
        )
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

    pub async fn list_with_extended_results_and_optional_data_paginated(
        &self,
        request: &InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = None;
        let options_clone = options.clone();
        let request_clone = request.clone();

        AsyncPaginator::new(
            http_client,
            move |client, cursor_value| {
                let mut query_params: Vec<(String, String)> =
                    base_query_params.clone().unwrap_or_default();
                if let Some(cursor) = cursor_value {
                    // Add cursor parameter based on pagination configuration
                    query_params.push(("cursor".to_string(), cursor));
                }
                let options_for_request = options_clone.clone();

                // Clone captured variables to move into the async block
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::GET,
                            "/inline-users",
                            None,
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction using pagination configuration
                    let items: Vec<serde_json::Value> = response
                        .get("data")
                        .and_then(|v| v.get("users"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let next_cursor: Option<String> = response
                        .get("next")
                        .and_then(|v| v.as_str().map(|s| s.to_string()));
                    let has_next_page = next_cursor.is_some();

                    Ok(PaginationResult {
                        items,
                        next_cursor,
                        has_next_page,
                        response: Some(response),
                        status_code: Some(_status_code),
                        headers: Some(_headers),
                    })
                })
            },
            None, // Start with no cursor
        )
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

    pub async fn list_usernames_paginated(
        &self,
        request: &InlineUsersInlineUsersListUsernamesQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = None;
        let options_clone = options.clone();
        let request_clone = request.clone();

        AsyncPaginator::new(
            http_client,
            move |client, cursor_value| {
                let mut query_params: Vec<(String, String)> =
                    base_query_params.clone().unwrap_or_default();
                if let Some(cursor) = cursor_value {
                    // Add cursor parameter based on pagination configuration
                    query_params.push(("starting_after".to_string(), cursor));
                }
                let options_for_request = options_clone.clone();

                // Clone captured variables to move into the async block
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::GET,
                            "/inline-users",
                            None,
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction using pagination configuration
                    let items: Vec<serde_json::Value> = response
                        .get("cursor")
                        .and_then(|v| v.get("data"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let next_cursor: Option<String> = response
                        .get("cursor")
                        .and_then(|v| v.get("after"))
                        .and_then(|v| v.as_str().map(|s| s.to_string()));
                    let has_next_page = next_cursor.is_some();

                    Ok(PaginationResult {
                        items,
                        next_cursor,
                        has_next_page,
                        response: Some(response),
                        status_code: Some(_status_code),
                        headers: Some(_headers),
                    })
                })
            },
            None, // Start with no cursor
        )
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

    pub async fn list_with_global_config_paginated(
        &self,
        request: &InlineUsersInlineUsersListWithGlobalConfigQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = None;
        let options_clone = options.clone();
        let request_clone = request.clone();

        AsyncPaginator::new(
            http_client,
            move |client, page_token| {
                let mut query_params: Vec<(String, String)> =
                    base_query_params.clone().unwrap_or_default();

                // Use page_token as offset/page number (start from 0 if None)
                let current_page = page_token.unwrap_or_else(|| "0".to_string());
                query_params.push(("offset".to_string(), current_page.clone()));

                let options_for_request = options_clone.clone();

                // Clone captured variables to move into the async block
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::GET,
                            "/inline-users",
                            None,
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction for offset pagination
                    let items: Vec<serde_json::Value> = response
                        .get("results")
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let has_next_page = !items.is_empty();
                    // Calculate next page number for offset pagination
                    let next_cursor: Option<String> = if has_next_page {
                        let current_page_num: u64 = current_page.parse().unwrap_or(0);
                        let step_size = if let Some(step) = response.get("per_page") {
                            step.as_u64().unwrap_or(1)
                        } else {
                            1 // Default step size
                        };
                        Some((current_page_num + step_size).to_string())
                    } else {
                        None
                    };

                    Ok(PaginationResult {
                        items,
                        next_cursor,
                        has_next_page,
                        response: Some(response),
                        status_code: Some(_status_code),
                        headers: Some(_headers),
                    })
                })
            },
            None, // Start with page 0
        )
    }
}
