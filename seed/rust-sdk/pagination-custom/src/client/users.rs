use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct UsersClient {
    pub client: Client,
    pub base_url: String,
}

impl UsersClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn list_usernames_custom(&self, starting_after: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
