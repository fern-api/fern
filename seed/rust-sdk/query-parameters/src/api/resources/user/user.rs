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

    pub async fn getusername(
        &self,
        request: &GetusernameQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "user",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .string("id", request.id.clone())
                    .date("date", request.date.clone())
                    .datetime("deadline", request.deadline.clone())
                    .string("bytes", request.bytes.clone())
                    .serialize("user", Some(request.user.clone()))
                    .serialize_array("userList", request.user_list.clone())
                    .serialize("optionalDeadline", request.optional_deadline.clone())
                    .serialize("keyValue", Some(request.key_value.clone()))
                    .serialize("optionalString", request.optional_string.clone())
                    .serialize("nestedUser", Some(request.nested_user.clone()))
                    .serialize("optionalUser", request.optional_user.clone())
                    .serialize_array("excludeUser", request.exclude_user.clone())
                    .string_array("filter", request.filter.clone())
                    .build(),
                options,
            )
            .await
    }
}
