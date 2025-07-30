use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
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
            options,
        ).await
    }

}

