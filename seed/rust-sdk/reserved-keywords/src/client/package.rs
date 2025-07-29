use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct PackageClient {
    pub client: Client,
    pub base_url: String,
}

impl PackageClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn test(&self, for_: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
