//! Service clients and API endpoints
//!
//! This module provides the client implementations for all available services.

use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
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

    pub async fn search_rule_types(
        &self,
        request: &SearchRuleTypesQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<RuleTypeSearchResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "rule-types",
                None,
                QueryBuilder::new()
                    .structured_query("query", request.query.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn create_rule(
        &self,
        request: &RuleCreateRequest,
        options: Option<RequestOptions>,
    ) -> Result<RuleResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "rules",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn list_users(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<UserSearchResponse, ApiError> {
        self.http_client
            .execute_request(Method::GET, "users", None, None, options)
            .await
    }

    pub async fn get_entity(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<CombinedEntity, ApiError> {
        self.http_client
            .execute_request(Method::GET, "entities", None, None, options)
            .await
    }

    pub async fn get_organization(
        &self,
        options: Option<RequestOptions>,
    ) -> Result<Organization, ApiError> {
        self.http_client
            .execute_request(Method::GET, "organizations", None, None, options)
            .await
    }

    /// Tests three-level allOf chain where a parent schema itself uses allOf with $ref elements. The grandparent's properties must be resolved through the nested $ref.
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
        request: &PlantPost,
        options: Option<RequestOptions>,
    ) -> Result<PlantStrict, ApiError> {
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

    /// Tests that when a parent's allOf contains multiple $ref entries, all of them are resolved and their properties merged.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn create_tree(
        &self,
        request: &TreeRecord,
        options: Option<RequestOptions>,
    ) -> Result<TreeRecord, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "trees",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
