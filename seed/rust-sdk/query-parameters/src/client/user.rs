use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct UserClient {
    pub client: Client,
    pub base_url: String,
}

impl UserClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_username(&self, limit: Option<&String>, id: Option<&String>, date: Option<&String>, deadline: Option<&String>, bytes: Option<&String>, user: Option<&String>, user_list: Option<&String>, optional_deadline: Option<&String>, key_value: Option<&String>, optional_string: Option<&String>, nested_user: Option<&String>, optional_user: Option<&String>, exclude_user: Option<&String>, filter: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
