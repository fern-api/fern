use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct PathClient {
    pub http_client: HttpClient,
}

impl PathClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_literal::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = LiteralClient::new(config).expect("Failed to build client");
    ///     client.path.send(&"123".to_string(), None).await;
    /// }
    /// ```
    pub async fn send(
        &self,
        id: &str,
        options: Option<RequestOptions>,
    ) -> Result<SendResponse, ApiError> {
        let options = {
            let mut o = options.unwrap_or_default();
            o.additional_headers
                .entry("X-API-Version".to_string())
                .or_insert_with(|| "02-02-2024".to_string());
            o.additional_headers
                .entry("X-API-Enable-Audit-Logging".to_string())
                .or_insert_with(|| "true".to_string());
            Some(o)
        };
        self.http_client
            .execute_request(Method::POST, &format!("path/{}", id), None, None, options)
            .await
    }
}
