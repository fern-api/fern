use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use std::collections::{HashMap};
use crate::{types::*};

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_username(&self, limit: Option<i32>, id: Option<uuid::Uuid>, date: Option<chrono::NaiveDate>, deadline: Option<chrono::DateTime<chrono::Utc>>, bytes: Option<String>, user: Option<User>, user_list: Option<Vec<User>>, optional_deadline: Option<chrono::DateTime<chrono::Utc>>, key_value: Option<HashMap<String, String>>, optional_string: Option<String>, nested_user: Option<NestedUser>, optional_user: Option<User>, exclude_user: Option<User>, filter: Option<String>, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client.execute_request(
            Method::GET,
            "/user",
            None,
            {
            let mut query_builder = crate::QueryParameterBuilder::new();
            if let Some(value) = limit {
                query_builder.add_simple("limit", &value.to_string());
            }
            if let Some(value) = id {
                query_builder.add_simple("id", &value.to_string());
            }
            if let Some(value) = date {
                query_builder.add_simple("date", &value.to_rfc3339());
            }
            if let Some(value) = deadline {
                query_builder.add_simple("deadline", &value.to_rfc3339());
            }
            if let Some(value) = bytes {
                query_builder.add_simple("bytes", &value.to_string());
            }
            if let Some(value) = user {
                query_builder.add_simple("user", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = user_list {
                query_builder.add_simple("userList", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = optional_deadline {
                query_builder.add_simple("optionalDeadline", &value.to_rfc3339());
            }
            if let Some(value) = key_value {
                query_builder.add_simple("keyValue", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = optional_string {
                query_builder.add_simple("optionalString", &value);
            }
            if let Some(value) = nested_user {
                query_builder.add_simple("nestedUser", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = optional_user {
                query_builder.add_simple("optionalUser", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = exclude_user {
                query_builder.add_simple("excludeUser", &serde_json::to_string(&value).unwrap_or_default());
            }
            if let Some(value) = filter {
                query_builder.add_simple("filter", &value);
            }
            let params = query_builder.build();
            if params.is_empty() { None } else { Some(params) }
        },
            options,
        ).await
    }

}

