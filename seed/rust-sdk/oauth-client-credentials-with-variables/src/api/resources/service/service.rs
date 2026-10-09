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
    /// use seed_oauth_client_credentials_with_variables::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client =
    ///         OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
    ///     client.service.post(None).await;
    /// }
    /// ```
    pub async fn post(
        &self,
        endpoint_param: &str,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/service/{}", endpoint_param),
                None,
                None,
                options,
            )
            .await
    }
}
