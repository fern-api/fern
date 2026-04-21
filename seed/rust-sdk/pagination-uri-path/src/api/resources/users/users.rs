use crate::api::*;
use crate::{ApiError, AsyncPaginator, ClientConfig, HttpClient, PaginationResult, RequestOptions};
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

    pub async fn list_with_uri_pagination_paginated(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = None;
        let options_clone = options.clone();

        AsyncPaginator::new(
            http_client,
            move |client, cursor_value| {
                let query_params = base_query_params.clone();
                let options_for_request = options_clone.clone();
                // Custom pagination logic would go here

                // Clone captured variables to move into the async block

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::GET,
                            "/users/uri",
                            None,
                            query_params,
                            options_for_request,
                        )
                        .await?;

                    // Custom extraction logic would go here
                    // Generic extraction for custom pagination - tries common field names
                    let items: Vec<serde_json::Value> = response
                        .get("data")
                        .or_else(|| response.get("results"))
                        .or_else(|| response.get("items"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let next_cursor: Option<String> = None;
                    let has_next_page = false; // Custom pagination requires manual implementation

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
            None,
        )
    }

    pub async fn list_with_path_pagination(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<ListUsersPathPaginationResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/users/path", None, None, options)
            .await
    }

    pub async fn list_with_path_pagination_paginated(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = None;
        let options_clone = options.clone();

        AsyncPaginator::new(
            http_client,
            move |client, cursor_value| {
                let query_params = base_query_params.clone();
                let options_for_request = options_clone.clone();
                // Custom pagination logic would go here

                // Clone captured variables to move into the async block

                Box::pin(async move {
                    let (response, _status_code, _headers): (
                        serde_json::Value,
                        reqwest::StatusCode,
                        reqwest::header::HeaderMap,
                    ) = client
                        .execute_request_returning_response(
                            Method::GET,
                            "/users/path",
                            None,
                            query_params,
                            options_for_request,
                        )
                        .await?;

                    // Custom extraction logic would go here
                    // Generic extraction for custom pagination - tries common field names
                    let items: Vec<serde_json::Value> = response
                        .get("data")
                        .or_else(|| response.get("results"))
                        .or_else(|| response.get("items"))
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let next_cursor: Option<String> = None;
                    let has_next_page = false; // Custom pagination requires manual implementation

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
            None,
        )
    }
}
