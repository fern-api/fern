use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct HomepageClient {
    pub http_client: HttpClient,
}

impl HomepageClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client.homepage.get_homepage_problems(None).await;
    /// }
    /// ```
    pub async fn get_homepage_problems(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<ProblemId>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/homepage-problems", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .homepage
    ///         .set_homepage_problems(
    ///             &vec![
    ///                 ProblemId("string".to_string()),
    ///                 ProblemId("string".to_string()),
    ///             ],
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn set_homepage_problems(
        &self,
        request: &Vec<ProblemId>,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/homepage-problems",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
