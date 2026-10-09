use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct BillingClient {
    pub http_client: HttpClient,
}

impl BillingClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use shared_types_cli_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = SharedTypesCliClient::new(config).expect("Failed to build client");
    ///     client.billing.list_invoices(None).await;
    /// }
    /// ```
    pub async fn list_invoices(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Invoice>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "billing/invoices", None, None, options)
            .await
    }
}
