use crate::error::ApiError;
use crate::types::*;
use reqwest::Client;

pub struct PlaylistClient {
    pub client: Client,
    pub base_url: String,
}

impl PlaylistClient {
    pub fn new(base_url: String) -> Self {
        Self {
            client: Client::new(),
            base_url,
        }
    }

    pub async fn create_playlist(&self, service_param: &String, datetime: Option<&String>, optional_datetime: Option<&String>, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_playlists(&self, service_param: &String, limit: Option<&String>, other_field: Option<&String>, multi_line_docs: Option<&String>, optional_multiple_field: Option<&String>, multiple_field: Option<&String>) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn get_playlist(&self, service_param: &String, playlist_id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn update_playlist(&self, service_param: &String, playlist_id: &String, request: &serde_json::Value) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

    pub async fn delete_playlist(&self, service_param: &String, playlist_id: &String) -> Result<serde_json::Value, ApiError> {
        todo!()
    }

}
