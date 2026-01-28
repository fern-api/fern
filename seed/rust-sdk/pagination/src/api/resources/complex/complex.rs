use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct ComplexClient {
    pub http_client: HttpClient,
}

impl ComplexClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    pub async fn search(&self, index: &String, request: &SearchRequest, options: Option<RequestOptions>) -> Result<PaginatedConversationResponse, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("{}/conversations/search", index),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

