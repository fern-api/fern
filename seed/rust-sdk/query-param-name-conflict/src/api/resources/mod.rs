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
