use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct WidgetsClient {
    pub http_client: HttpClient,
}

impl WidgetsClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use login_flow_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = LoginFlowClient::new(config).expect("Failed to build client");
    ///     client.widgets.list(None).await;
    /// }
    /// ```
    pub async fn list(&self, options: Option<RequestOptions>) -> Result<Vec<String>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "widgets", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use login_flow_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = LoginFlowClient::new(config).expect("Failed to build client");
    ///     client.widgets.get(&"widgetId".to_string(), None).await;
    /// }
    /// ```
    pub async fn get(
        &self,
        widget_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Widget, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("widgets/{}", widget_id),
                None,
                None,
                options,
            )
            .await
    }
}
