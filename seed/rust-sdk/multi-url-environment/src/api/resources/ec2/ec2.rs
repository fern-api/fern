use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct Ec2Client {
    pub http_client: HttpClient,
}

impl Ec2Client {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_multi_url_environment::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = MultiUrlEnvironmentClient::new(config).expect("Failed to build client");
    ///     client
    ///         .ec2
    ///         .boot_instance(
    ///             &BootInstanceRequest {
    ///                 size: "size".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn boot_instance(
        &self,
        request: &BootInstanceRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        let base_url = self
            .http_client
            .config()
            .environment
            .as_ref()
            .map_or(self.http_client.base_url(), |env| env.ec2_url());
        self.http_client
            .execute_request_with_base_url(
                base_url,
                Method::POST,
                "/ec2/boot",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
