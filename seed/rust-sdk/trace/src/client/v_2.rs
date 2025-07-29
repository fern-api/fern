use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct V2Client {
    pub client: Client,
    pub base_url: String,
}

impl V2Client {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn test(&self) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
