use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct EndpointsPaginationClient {
    pub http_client: HttpClient,
}

impl EndpointsPaginationClient {
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
    pub async fn endpoints_pagination_list_items(
        &self,
        request: &EndpointsPaginationListItemsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<EndpointsPaginatedResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "pagination",
                None,
                QueryBuilder::new()
                    .serialize("cursor", request.cursor.clone())
                    .serialize("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }
}
