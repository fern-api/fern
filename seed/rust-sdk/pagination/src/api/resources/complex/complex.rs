use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use crate::{AsyncPaginator, PaginationResult};
use reqwest::Method;

pub struct ComplexClient {
    pub http_client: HttpClient,
}

impl ComplexClient {
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
    ///         .complex
    ///         .search(
    ///             &"index".to_string(),
    ///             &SearchRequest {
    ///                 pagination: Some(StartingAfterPaging {
    ///                     per_page: 1,
    ///                     starting_after: Some("starting_after".to_string()),
    ///                     ..Default::default()
    ///                 }),
    ///                 query: SearchRequestQuery::SingleFilterSearchRequest(SingleFilterSearchRequest {
    ///                     field: Some("field".to_string()),
    ///                     operator: Some(SingleFilterSearchRequestOperator::Equals),
    ///                     value: Some("value".to_string()),
    ///                     ..Default::default()
    ///                 }),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn search(
        &self,
        index: &str,
        request: &SearchRequest,
        options: Option<RequestOptions>,
    ) -> Result<PaginatedConversationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("{}/conversations/search", index),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn search_paginated(
        &self,
        index: &str,
        request: &SearchRequest,
        options: Option<RequestOptions>,
    ) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
        let base_query_params = None;
        let options_clone = options.clone();
        let index_clone = index.to_string();
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
                let index_for_async = index_clone.clone();
                let request_for_async = request_clone.clone();

                Box::pin(async move {
                    let raw_response = client
                        .execute_request_raw::<serde_json::Value>(
                            Method::POST,
                            &format!("{}/conversations/search", index_for_async),
                            Some(
                                serde_json::to_value(request_for_async)
                                    .map_err(ApiError::Serialization)?,
                            ),
                            Some(query_params),
                            options_for_request,
                        )
                        .await?;
                    let response = raw_response.body;

                    // Extract pagination info from response
                    // Generic field extraction using pagination configuration
                    let items: Vec<serde_json::Value> = response
                        .get("conversations")
                        .and_then(|v| v.as_array())
                        .map(|arr| arr.clone())
                        .unwrap_or_default();

                    let next_cursor: Option<String> = response
                        .get("pages")
                        .and_then(|v| v.get("next"))
                        .and_then(|v| v.get("starting_after"))
                        .and_then(|v| v.as_str().map(|s| s.to_string()));
                    let has_next_page = next_cursor.is_some();

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
            None, // Start with no cursor
        )
    }
}
