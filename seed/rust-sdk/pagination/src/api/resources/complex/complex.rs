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
}
