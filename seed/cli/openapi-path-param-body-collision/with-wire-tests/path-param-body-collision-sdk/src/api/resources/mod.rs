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

    /// # Examples
    ///
    /// ```no_run
    /// use path_param_body_collision_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = PathParamBodyCollisionClient::new(config).expect("Failed to build client");
    ///     client
    ///         .update_profile_identifier(
    ///             &"profile_123".to_string(),
    ///             &"email".to_string(),
    ///             &IdentifierUpdate {
    ///                 id_type: "phone".to_string(),
    ///                 old_value: "+13175556789".to_string(),
    ///                 new_value: "+13175556798".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update_profile_identifier(
        &self,
        profile_id: &str,
        id_type_path_param: &str,
        request: &IdentifierUpdate,
        options: Option<RequestOptions>,
    ) -> Result<UpdateProfileIdentifierResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("Profiles/{}/Identifiers/{}", profile_id, id_type_path_param),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
