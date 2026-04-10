use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
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
}
