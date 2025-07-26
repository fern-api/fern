use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct MetadataClient {
    pub client: Client,
    pub base_url: String,
}

impl MetadataClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn get_metadata(&self, id: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
