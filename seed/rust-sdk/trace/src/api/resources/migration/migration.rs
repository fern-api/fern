use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct MigrationClient {
    pub http_client: HttpClient,
}

impl MigrationClient {
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
    ///     client
    ///         .migration
    ///         .get_attempted_migrations(Some(
    ///             RequestOptions::new().additional_header("admin-key-header", "admin-key-header"),
    ///         ))
    ///         .await;
    /// }
    /// ```
    pub async fn get_attempted_migrations(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Migration>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "/migration-info/all", None, None, options)
            .await
    }
}
