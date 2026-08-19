use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_any_auth::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AnyAuthClient::new(config).expect("Failed to build client");
    ///     client.user.get(None).await;
    /// }
    /// ```
    pub async fn get(&self, options: Option<RequestOptions>) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::POST, "users", None, None, options)
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_any_auth::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = AnyAuthClient::new(config).expect("Failed to build client");
    ///     client.user.get_admins(None).await;
    /// }
    /// ```
    pub async fn get_admins(&self, options: Option<RequestOptions>) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "admins", None, None, options)
            .await
    }
}
