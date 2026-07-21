use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct V2Client {
    pub http_client: HttpClient,
}

impl V2Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use acme_versioned_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AcmeVersionedClient::new(config).expect("Failed to build client");
    ///     client.v1.list_users(None).await;
    /// }
    /// ```
    pub async fn list_users(
        &self,
        request: &ListUsersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<UserV2>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users",
                None,
                QueryBuilder::new()
                    .int("pageSize", request.page_size.clone())
                    .build(),
                options,
            )
            .await
    }
}
