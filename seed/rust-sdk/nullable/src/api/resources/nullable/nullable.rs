use crate::api::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct NullableClient {
    pub http_client: HttpClient,
}

impl NullableClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config)?,
        })
    }

    pub async fn get_users(
        &self,
        usernames: Option<String>,
        avatar: Option<String>,
        activated: Option<bool>,
        tags: Option<Option<String>>,
        extra: Option<Option<bool>>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                "/users",
                None,
                QueryBuilder::new()
                    .string("usernames", usernames)
                    .string("avatar", avatar)
                    .bool("activated", activated)
                    .serialize("tags", tags)
                    .serialize("extra", extra)
                    .build(),
                options,
            )
            .await
    }

    pub async fn create_user(
        &self,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/users",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn delete_user(
        &self,
        request: &serde_json::Value,
        options: Option<RequestOptions>,
    ) -> Result<bool, ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                "/users",
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }
}
