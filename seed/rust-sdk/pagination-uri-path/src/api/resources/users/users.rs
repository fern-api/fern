use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use crate::{AsyncPaginator, PaginationResult};
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
    /// use seed_pagination_uri_path::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationUriPathClient::new(config).expect("Failed to build client");
    ///     client.users.list_with_uri_pagination(None).await;
    /// }
    /// ```
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
            move |client, _cursor_value| {
                let query_params = base_query_params.clone();
                let options_for_request = options_clone.clone();
                // Custom pagination logic would go here

                // Clone captured variables to move into the async block

                Box::pin(async move {
                    let raw_response = client
                        .execute_request_raw::<serde_json::Value>(
                            Method::GET,
                            "/users/uri",
                            None,
                            query_params,
                            options_for_request,
                        )
                        .await?;
                    let response = raw_response.body;

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
                        status_code: raw_response.status_code,
                        headers: raw_response.headers,
                    })
                })
            },
            None,
        )
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_pagination_uri_path::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = PaginationUriPathClient::new(config).expect("Failed to build client");
    ///     client.users.list_with_path_pagination(None).await;
    /// }
    /// ```
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
            move |client, _cursor_value| {
                let query_params = base_query_params.clone();
                let options_for_request = options_clone.clone();
                // Custom pagination logic would go here

                // Clone captured variables to move into the async block

                Box::pin(async move {
                    let raw_response = client
                        .execute_request_raw::<serde_json::Value>(
                            Method::GET,
                            "/users/path",
                            None,
                            query_params,
                            options_for_request,
                        )
                        .await?;
                    let response = raw_response.body;

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
                        status_code: raw_response.status_code,
                        headers: raw_response.headers,
                    })
                })
            },
            None,
        )
    }
}
