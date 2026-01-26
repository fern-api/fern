use crate::{ClientConfig, ApiError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::api::{*};

pub struct UserClient {
    pub http_client: HttpClient,
}

impl UserClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
    http_client: HttpClient::new(config.clone())?
})
    }

    /// Retrieve a user.
    /// This endpoint is used to retrieve a user.
    ///
    /// # Arguments
    ///
    /// * `user_id` - The ID of the user to retrieve.
    /// This ID is unique to each user.
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    pub async fn get_user(&self, user_id: &String, options: Option<RequestOptions>) -> Result<(), ApiError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("users/{}", user_id),
            None,
            None,
            options,
        ).await
    }

    /// Create a new user.
    /// This endpoint is used to create a new user.
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn create_user(&self, request: &CreateUserRequest, options: Option<RequestOptions>) -> Result<User, ApiError> {
        self.http_client.execute_request(
            Method::POST,
            "users",
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

}

