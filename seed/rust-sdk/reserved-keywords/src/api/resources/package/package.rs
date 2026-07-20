use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct PackageClient {
    pub http_client: HttpClient,
}

impl PackageClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_nursery_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NurseryApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .package
    ///         .test(
    ///             &TestQueryRequest {
    ///                 r#for: "for".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn test(
        &self,
        request: &TestQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "",
                None,
                QueryBuilder::new()
                    .string("for", request.r#for.clone())
                    .build(),
                options,
            )
            .await
    }
}
