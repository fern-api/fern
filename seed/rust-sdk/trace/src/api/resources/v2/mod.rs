use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub mod problem;
pub use problem::ProblemClient2;
pub mod v3;
pub use v3::V3Client;
pub struct V2Client {
    pub http_client: HttpClient,
    pub problem: ProblemClient2,
    pub v3: V3Client,
}

impl V2Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
            problem: ProblemClient2::new(config.clone())?,
            v3: V3Client::new(config.clone())?,
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
    ///     client.v2.test(None).await;
    /// }
    /// ```
    pub async fn test(&self, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client
            .execute_request(Method::GET, "", None, None, options)
            .await
    }
}
