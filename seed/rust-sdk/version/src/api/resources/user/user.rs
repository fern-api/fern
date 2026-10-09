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
    /// use seed_version::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = VersionClient::new(config).expect("Failed to build client");
    ///     client
    ///         .user
    ///         .get_user(&UserId("userId".to_string()), None)
    ///         .await;
    /// }
    /// ```
    pub async fn get_user(
        &self,
        user_id: &UserId,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/users/{}", user_id.0),
                None,
                None,
                options,
            )
            .await
    }
}
