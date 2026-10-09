use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct RetriesClient {
    pub http_client: HttpClient,
}

impl RetriesClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_no_retries::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = NoRetriesClient::new(config).expect("Failed to build client");
    ///     client.retries.get_users(None).await;
    /// }
    /// ```
    pub async fn get_users(&self, options: Option<RequestOptions>) -> Result<Vec<User>, ApiError> {
        let options = {
            let mut o = options.unwrap_or_default();
            o.max_retries = Some(0);
            Some(o)
        };
        self.http_client
            .execute_request(Method::GET, "/users", None, None, options)
            .await
    }
}
