//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct PropertyAccessClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl PropertyAccessClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_property_access::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PropertyAccessClient::new(config).expect("Failed to build client");
    ///     client
    ///         .create_user(
    ///             &User {
    ///                 id: "id".to_string(),
    ///                 email: "email".to_string(),
    ///                 password: "password".to_string(),
    ///                 profile: UserProfile {
    ///                     name: "name".to_string(),
    ///                     verification: UserProfileVerification {
    ///                         verified: "verified".to_string(),
    ///                         ..Default::default()
    ///                     },
    ///                     ssn: "ssn".to_string(),
    ///                     ..Default::default()
    ///                 },
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_user(
        &self,
        request: &User,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
