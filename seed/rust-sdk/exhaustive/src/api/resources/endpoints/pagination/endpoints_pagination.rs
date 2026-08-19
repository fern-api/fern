use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
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
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_exhaustive::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = ExhaustiveClient::new(config).expect("Failed to build client");
    ///     client
    ///         .endpoints
    ///         .pagination
    ///         .list_items(
    ///             &ListItemsQueryRequest {
    ///                 cursor: Some("cursor".to_string()),
    ///                 limit: Some(1),
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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
}
