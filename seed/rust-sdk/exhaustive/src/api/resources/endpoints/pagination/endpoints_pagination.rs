use crate::api::*;
use crate::{
    ApiError, AsyncPaginator, ClientConfig, HttpClient, PaginationResult, QueryBuilder,
    RequestOptions,
};
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

    pub async fn list_items_paginated(
        &self,
        request: &ListItemsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = QueryBuilder::new()
            .int("limit", request.limit.clone())
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
                            "/pagination",
                            None,
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;

                    // Extract pagination info from response
                    // Generic field extraction using pagination configuration
                    let items: Vec<serde_json::Value> = response
                        .get("items")
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
}
