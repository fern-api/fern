use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct QueryParamClient {
    pub client: Client,
    pub base_url: String,
}

impl QueryParamClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn send(&self, operand: Option<&String>, maybe_operand: Option<&String>, operand_or_color: Option<&String>, maybe_operand_or_color: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn send_list(&self, operand: Option<&String>, maybe_operand: Option<&String>, operand_or_color: Option<&String>, maybe_operand_or_color: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
