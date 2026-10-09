use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct V1Client2 {
    pub http_client: HttpClient,
}

impl V1Client2 {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use versioned_store_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = VersionedStoreClient::new(config).expect("Failed to build client");
    ///     client
    ///         .v1
    ///         .v1
    ///         .list(
    ///             &ListQueryRequest {
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn list(
        &self,
        request: &ListQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Item>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "items",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }
}
