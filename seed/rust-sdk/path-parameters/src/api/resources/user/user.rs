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

    pub async fn getuser(
        &self,
        tenant_id: &str,
        user_id: &str,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("{}/user/{}", tenant_id, user_id),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn updateuser(
        &self,
        tenant_id: &str,
        user_id: &str,
        request: &User,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::PATCH,
                &format!("{}/user/{}", tenant_id, user_id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn createuser(
        &self,
        tenant_id: &str,
        request: &User,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("{}/user/", tenant_id),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    pub async fn searchusers(
        &self,
        tenant_id: &str,
        user_id: &str,
        request: &SearchusersQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<User>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("{}/user/{}/search", tenant_id, user_id),
                None,
                QueryBuilder::new()
                    .serialize("limit", request.limit.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Test endpoint with path parameter that has a text prefix (v{version})
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn getusermetadata(
        &self,
        tenant_id: &str,
        user_id: &str,
        version: i64,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("{}/user/{}/metadata/v{}", tenant_id, user_id, version),
                None,
                None,
                options,
            )
            .await
    }

    /// Test endpoint with path parameters listed in different order than found in path
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn getuserspecifics(
        &self,
        tenant_id: &str,
        user_id: &str,
        version: i64,
        thought: &str,
        options: Option<RequestOptions>,
    ) -> Result<User, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!(
                    "{}/user/{}/specifics/{}/{}",
                    tenant_id, user_id, version, thought
                ),
                None,
                None,
                options,
            )
            .await
    }
}
