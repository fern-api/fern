use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct MigrationClient {
    pub client: Client,
    pub base_url: String,
}

impl MigrationClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_attempted_migrations(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
