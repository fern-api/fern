use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;
use std::collections::HashMap;

pub struct SyspropClient {
    pub http_client: HttpClient,
}

impl SyspropClient {
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
    ///         .sysprop
    ///         .set_num_warm_instances(&Language::Java, 1, None)
    ///         .await;
    /// }
    /// ```
    pub async fn set_num_warm_instances(
        &self,
        language: &Language,
        num_warm_instances: i64,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!(
                    "/sysprop/num-warm-instances/{}/{}",
                    language, num_warm_instances
                ),
                None,
                None,
                options,
            )
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
    ///     client.sysprop.get_num_warm_instances(None).await;
    /// }
    /// ```
    pub async fn get_num_warm_instances(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<HashMap<Language, i64>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/sysprop/num-warm-instances",
                None,
                None,
                options,
            )
            .await
    }
}
