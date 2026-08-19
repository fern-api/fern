use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
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
    /// use seed_api_wide_base_path::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiWideBasePathClient::new(config).expect("Failed to build client");
    ///     client
    ///         .service
    ///         .post(
    ///             &"pathParam".to_string(),
    ///             &"serviceParam".to_string(),
    ///             1,
    ///             &"resourceParam".to_string(),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn post(
        &self,
        path_param: &str,
        service_param: &str,
        endpoint_param: i64,
        resource_param: &str,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/test/{}/{}/{}/{}",
                    path_param, service_param, endpoint_param, resource_param
                ),
                None,
                None,
                options,
            )
            .await
    }
}
