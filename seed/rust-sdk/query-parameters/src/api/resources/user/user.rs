use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;
use std::collections::HashMap;

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn get_username(
        &self,
        request: &GetUsernameQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/user",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .uuid("id", request.id.clone())
                    .date("date", request.date.clone())
                    .datetime("deadline", request.deadline.clone())
                    .string("bytes", request.bytes.clone())
                    .serialize("user", request.user.clone())
                    .serialize("userList", request.user_list.clone())
                    .datetime("optionalDeadline", request.optional_deadline.clone())
                    .serialize("keyValue", request.key_value.clone())
                    .string("optionalString", request.optional_string.clone())
                    .serialize("nestedUser", request.nested_user.clone())
                    .serialize("optionalUser", request.optional_user.clone())
                    .serialize("excludeUser", request.exclude_user.clone())
                    .string("filter", request.filter.clone())
                    .build(),
                options,
            )
            .await
    }
}
