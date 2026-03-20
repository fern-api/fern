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

    pub async fn search(
        &self,
        request: &SearchQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<SearchResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "user/getUsername",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .string("id", request.id.clone())
                    .date("date", request.date.clone())
                    .datetime("deadline", request.deadline.clone())
                    .string("bytes", request.bytes.clone())
                    .serialize("user", Some(request.user.clone()))
                    .serialize_array("userList", request.user_list.clone())
                    .datetime("optionalDeadline", request.optional_deadline.clone())
                    .serialize("keyValue", request.key_value.clone())
                    .string("optionalString", request.optional_string.clone())
                    .serialize("nestedUser", request.nested_user.clone())
                    .serialize("optionalUser", request.optional_user.clone())
                    .serialize_array("excludeUser", request.exclude_user.clone())
                    .string_array("filter", request.filter.clone())
                    .string_array("tags", request.tags.clone())
                    .string_array("optionalTags", request.optional_tags.clone())
                    .serialize("neighbor", request.neighbor.clone())
                    .serialize("neighborRequired", Some(request.neighbor_required.clone()))
                    .build(),
                options,
            )
            .await
    }
}
