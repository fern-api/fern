//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ApiClient {
    pub config: ClientConfig,
    pub http_client: HttpClient,
}

impl ApiClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            config: config.clone(),
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Returns a paginated list of all plants currently in the store inventory.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client.list_plants(None).await;
    /// }
    /// ```
    pub async fn list_plants(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Plant>, ApiError> {
        self.http_client
            .execute_request(Method::GET, "plants", None, None, options)
            .await
    }

    /// Retrieve details about a specific plant by its unique identifier.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_api::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = ApiClient::new(config).expect("Failed to build client");
    ///     client.get_plant(&"plantId".to_string(), None).await;
    /// }
    /// ```
    pub async fn get_plant(
        &self,
        plant_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<Plant, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("plants/{}", plant_id),
                None,
                None,
                options,
            )
            .await
    }
}
