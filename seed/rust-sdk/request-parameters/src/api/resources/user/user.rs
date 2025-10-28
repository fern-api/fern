use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn create_username(
        &self,
        request: &CreateUsernameRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/user/username",
                Some(serde_json::to_value(request).unwrap_or_default()),
                QueryBuilder::new()
                    .serialize("tags", Some(request.tags.clone()))
                    .build(),
                options,
            )
            .await
    }

    pub async fn create_username_with_referenced_type(
        &self,
        request: &CreateUsernameBody,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/user/username-referenced",
                Some(serde_json::to_value(request).unwrap_or_default()),
                QueryBuilder::new()
                    .serialize("tags", Some(request.tags.clone()))
                    .build(),
                options,
            )
            .await
    }

    pub async fn create_username_optional(
        &self,
        request: &Option<Option<CreateUsernameBodyOptionalProperties>>,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/user/username-optional",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
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
                    .serialize("user", Some(request.user.clone()))
                    .serialize("userList", Some(request.user_list.clone()))
                    .datetime("optionalDeadline", request.optional_deadline.clone())
                    .serialize("keyValue", Some(request.key_value.clone()))
                    .string("optionalString", request.optional_string.clone())
                    .serialize("nestedUser", Some(request.nested_user.clone()))
                    .serialize("optionalUser", request.optional_user.clone())
                    .serialize("excludeUser", Some(request.exclude_user.clone()))
                    .string("filter", request.filter.clone())
                    .int("longParam", request.long_param.clone())
                    .string("bigIntParam", request.big_int_param.clone())
                    .build(),
                options,
            )
            .await
    }
}
