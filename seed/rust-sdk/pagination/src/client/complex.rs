use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{AsyncPaginator, SyncPaginator, PaginationResult};
use std::sync::{Arc};
use crate::{types::*};

pub struct ComplexClient {
    pub http_client: HttpClient,
}

impl ComplexClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn search(&self, index: &String, request: &SearchRequest, options: Option<RequestOptions>) -> Result<PaginatedConversationResponse, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("{}", index),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn search_paginated(&self, index: &String, request: &SearchRequest, options: Option<RequestOptions>) -> Result<AsyncPaginator<serde_json::Value>, ClientError> {
        
        let http_client = Arc::new(self.http_client.clone());
        let page_loader = move |client: Arc<HttpClient>, cursor: Option<String>| {
            let client = client.clone();
            async move {
                // Implementation for cursor-based pagination
                // This is a placeholder - real implementation would make HTTP request
                // and extract cursor + items from response
                Ok(PaginationResult {
                    items: vec![],
                    next_cursor: None,
                    has_next_page: false,
                })
            }
        };
        
        AsyncPaginator::new(http_client, page_loader, None)
    }

    pub fn search_paginated_sync(&self, index: &String, request: &SearchRequest, options: Option<RequestOptions>) -> Result<SyncPaginator<serde_json::Value>, ClientError> {
        
        let http_client = Arc::new(self.http_client.clone());
        let page_loader = move |client: Arc<HttpClient>, cursor: Option<String>| {
            let client = client.clone();
            
                // Implementation for cursor-based pagination
                // This is a placeholder - real implementation would make HTTP request
                // and extract cursor + items from response
                Ok(PaginationResult {
                    items: vec![],
                    next_cursor: None,
                    has_next_page: false,
                })
            
        };
        
        SyncPaginator::new(http_client, page_loader, None)
    }

}

