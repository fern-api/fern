use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::{AsyncPaginator, PaginationResult};

pub struct ComplexClient {
    pub http_client: HttpClient,
}

impl ComplexClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn search(&self, index: &String, request: &SearchRequest, options: Option<RequestOptions>) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
            let base_query_params = None;
            let options_clone = options.clone();
            let index_clone = index.clone();
            let request_clone = request.clone();
            
            AsyncPaginator::new(
                http_client,
                move |client, cursor_value| {
                    let mut query_params: Vec<(String, String)> = base_query_params.clone().unwrap_or_default();
                    if let Some(cursor) = cursor_value {
                        // Add cursor parameter based on pagination configuration
                        query_params.push(("starting_after".to_string(), cursor));
                    }
                    let options_for_request = options_clone.clone();
                    
                    // Clone captured variables to move into the async block
                    let index_for_async = index_clone.clone();
                    let request_for_async = request_clone.clone();
                    
                    Box::pin(async move {
                        let response: serde_json::Value = client.execute_request(
                            Method::POST,
                            &format!("{}", index),
                            Some(serde_json::to_value(request).unwrap_or_default()),
                            Some(query_params),
                            options_for_request,
                        ).await?;
                        
                        // Extract pagination info from response
                        // Generic field extraction using pagination configuration
                        let items: Vec<serde_json::Value> = response
                            .get("conversations")
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.clone())
                            .unwrap_or_default();
                        
                        let next_cursor: Option<String> = response.get("pages").and_then(|v| v.get("next")).and_then(|v| v.get("starting_after")).and_then(|v| v.as_str().map(|s| s.to_string()));
                        let has_next_page = next_cursor.is_some();
                        
                        Ok(PaginationResult {
                            items,
                            next_cursor,
                            has_next_page,
                        })
                    })
                },
                None, // Start with no cursor
            )
    }

}

