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

    /// # Examples
    ///
    /// ```no_run
    /// use query_param_name_conflict_api_sdk::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         ..Default::default()
    ///     };
    ///     let client = QueryParamNameConflictApiClient::new(config).expect("Failed to build client");
    ///     client
    ///         .bulk_update_tasks(
    ///             &BulkUpdateTasksRequest {
    ///                 ..Default::default()
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn bulk_update_tasks(
        &self,
        request: &BulkUpdateTasksRequest,
        options: Option<RequestOptions>,
    ) -> Result<BulkUpdateTasksResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                "task/",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                QueryBuilder::new()
                    .serialize("assigned_to", request.filter_assigned_to.clone())
                    .serialize("is_complete", request.filter_is_complete.clone())
                    .serialize("date", request.filter_date.clone())
                    .string("_fields", request.fields.clone())
                    .build(),
                options,
            )
            .await
    }
}
