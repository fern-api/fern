use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
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
                    .serialize("bytes", Some(request.bytes.clone()))
                    .serialize("user", Some(request.user.clone()))
                    .serialize("userList", Some(request.user_list.clone()))
                    .datetime("optionalDeadline", request.optional_deadline.clone())
                    .serialize("keyValue", Some(request.key_value.clone()))
                    .string("optionalString", request.optional_string.clone())
                    .serialize("nestedUser", Some(request.nested_user.clone()))
                    .serialize("optionalUser", request.optional_user.clone())
                    .serialize_array("excludeUser", request.exclude_user.clone())
                    .string_array("filter", request.filter.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_username_with_raw_response(
        &self,
        request: &GetUsernameQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<User>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                "/user",
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .uuid("id", request.id.clone())
                    .date("date", request.date.clone())
                    .datetime("deadline", request.deadline.clone())
                    .serialize("bytes", Some(request.bytes.clone()))
                    .serialize("user", Some(request.user.clone()))
                    .serialize("userList", Some(request.user_list.clone()))
                    .datetime("optionalDeadline", request.optional_deadline.clone())
                    .serialize("keyValue", Some(request.key_value.clone()))
                    .string("optionalString", request.optional_string.clone())
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
