use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};
use crate::{AsyncPaginator, PaginationResult};

pub struct UsersClient {
    pub http_client: HttpClient,
}

impl UsersClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn list_usernames_custom(&self, starting_after: Option<String>, options: Option<RequestOptions>) -> Result<AsyncPaginator<serde_json::Value>, ApiError> {
        let http_client = std::sync::Arc::new(self.http_client.clone());
            let base_query_params = {
            let mut query_params = Vec::new();
            if let Some(value) = starting_after {
                query_params.push(("starting_after".to_string(), value.clone()));
            }
            Some(query_params)
        };
            let options_clone = options.clone();
            
            
            AsyncPaginator::new(
                http_client,
                move |client, cursor_value| {
                    let query_params = base_query_params.clone();
                    let options_for_request = options_clone.clone();
                    // Custom pagination logic would go here
                    
                    // Clone captured variables to move into the async block
                    
                    
                    Box::pin(async move {
                        let response: serde_json::Value = client.execute_request(
                            Method::GET,
                            "/users",
                            None,
                            query_params,
                            options_for_request,
                        ).await?;
                        
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
                        })
                    })
                },
                None,
            )
    }

}

