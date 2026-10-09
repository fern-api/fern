use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct ServiceClient {
    pub http_client: HttpClient,
}

impl ServiceClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_mixed_case::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = MixedCaseClient::new(config).expect("Failed to build client");
    ///     client
    ///         .service
    ///         .get_resource(&"rsc-xyz".to_string(), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_resource(
        &self,
        resource_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Resource, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/resource/{}", resource_id),
                None,
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_mixed_case::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = MixedCaseClient::new(config).expect("Failed to build client");
    ///     client
    ///         .service
    ///         .list_resources(
    ///             &ListResourcesQueryRequest {
    ///                 page_limit: 10,
    ///                 before_date: NaiveDate::parse_from_str("2023-01-01", "%Y-%m-%d").unwrap(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn list_resources(
        &self,
        request: &ListResourcesQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Resource>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/resource",
                None,
                QueryBuilder::new()
                    .int("page_limit", request.page_limit.clone())
                    .date("beforeDate", request.before_date.clone())
                    .build(),
                options,
            )
            .await
    }
}
