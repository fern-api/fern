use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct NullableClient {
    pub http_client: HttpClient,
}

impl NullableClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn getusers(
        &self,
        request: &GetusersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "users",
                None,
                QueryBuilder::new()
                    .serialize_array("usernames", request.usernames.clone())
                    .serialize("avatar", request.avatar.clone())
                    .serialize_array("activated", request.activated.clone())
                    .serialize_array("tags", request.tags.clone())
                    .serialize("extra", request.extra.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn createuser(
        &self,
        request: &NullableCreateUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn deleteuser(
        &self,
        request: &NullableDeleteUserRequest,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                "users",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
