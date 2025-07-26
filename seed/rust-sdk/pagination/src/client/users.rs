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

    pub async fn list_with_cursor_pagination(&self, page: Option<&String>, per_page: Option<&String>, order: Option<&String>, starting_after: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn list_with_mixed_type_cursor_pagination(&self, cursor: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn list_with_body_cursor_pagination(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn list_with_offset_pagination(&self, page: Option<&String>, per_page: Option<&String>, order: Option<&String>, starting_after: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn list_with_double_offset_pagination(&self, page: Option<&String>, per_page: Option<&String>, order: Option<&String>, starting_after: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn list_with_body_offset_pagination(&self, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn list_with_offset_step_pagination(&self, page: Option<&String>, limit: Option<&String>, order: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn list_with_offset_pagination_has_next_page(&self, page: Option<&String>, limit: Option<&String>, order: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn list_with_extended_results(&self, cursor: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn list_with_extended_results_and_optional_data(&self, cursor: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn list_usernames(&self, starting_after: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn list_with_global_config(&self, offset: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
