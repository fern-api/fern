use crate::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;
use std::collections::HashMap;

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn get_username(
        &self,
        limit: Option<i32>,
        id: Option<uuid::Uuid>,
        date: Option<chrono::NaiveDate>,
        deadline: Option<chrono::DateTime<chrono::Utc>>,
        bytes: Option<String>,
        user: Option<User>,
        user_list: Option<Vec<User>>,
        optional_deadline: Option<chrono::DateTime<chrono::Utc>>,
        key_value: Option<HashMap<String, String>>,
        optional_string: Option<String>,
        nested_user: Option<NestedUser>,
        optional_user: Option<User>,
        exclude_user: Option<User>,
        filter: Option<String>,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/user",
                None,
                QueryBuilder::new()
                    .int("limit", limit)
                    .uuid("id", id)
                    .date("date", date)
                    .datetime("deadline", deadline)
                    .string("bytes", bytes)
                    .serialize("user", user)
                    .serialize("userList", user_list)
                    .datetime("optionalDeadline", optional_deadline)
                    .serialize("keyValue", key_value)
                    .string("optionalString", optional_string)
                    .serialize("nestedUser", nested_user)
                    .serialize("optionalUser", optional_user)
                    .serialize("excludeUser", exclude_user)
                    .string("filter", filter)
                    .build(),
                options,
            )
            .await
    }
}
