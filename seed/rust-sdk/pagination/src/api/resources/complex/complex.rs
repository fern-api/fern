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
        index: &String,
        request: &ComplexSearchRequest,
        options: Option<RequestOptions>,
    ) -> Result<ComplexPaginatedConversationResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("{}", index),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
