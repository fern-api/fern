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

    /// Creates a plant with example JSON but no request body schema.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn create_plant(
        &self,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<CreatePlantResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "plants",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Updates a plant with example JSON but no request body schema.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn update_plant(
        &self,
        plant_id: &str,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<UpdatePlantResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!("plants/{}", plant_id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// A control endpoint that has both schema and example defined.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn create_plant_with_schema(
        &self,
        request: &CreatePlantWithSchemaRequest,
        options: Option<RequestOptions>,
    ) -> Result<CreatePlantWithSchemaResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "plants/with-schema",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
