use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::{Method};
use crate::{types::*};

pub struct PlaylistClient {
    pub http_client: HttpClient,
}

impl PlaylistClient {
    pub fn new(config: ClientConfig) -> Result<Self, ClientError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn create_playlist(&self, service_param: i32, datetime: Option<chrono::DateTime<chrono::Utc>>, optional_datetime: Option<Option<chrono::DateTime<chrono::Utc>>>, request: &PlaylistCreateRequest, options: Option<RequestOptions>) -> Result<Playlist, ClientError> {
        self.http_client.execute_request(
            Method::POST,
            &format!("/v2/playlist/{}", service_param),
            Some(serde_json::to_value(request).unwrap_or_default()),
            {
            let mut query_params = Vec::new();
            if let Some(value) = datetime {
                query_params.push(("datetime".to_string(), value.to_string()));
            }
            if let Some(Some(value)) = optional_datetime {
                query_params.push(("optionalDatetime".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn get_playlists(&self, service_param: i32, limit: Option<Option<i32>>, other_field: Option<String>, multi_line_docs: Option<String>, optional_multiple_field: Option<Option<String>>, multiple_field: Option<String>, options: Option<RequestOptions>) -> Result<Vec<Playlist>, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/v2/playlist/{}", service_param),
            None,
            {
            let mut query_params = Vec::new();
            if let Some(Some(value)) = limit {
                query_params.push(("limit".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = other_field {
                query_params.push(("otherField".to_string(), value.to_string()));
            }
            if let Some(value) = multi_line_docs {
                query_params.push(("multiLineDocs".to_string(), value.to_string()));
            }
            if let Some(Some(value)) = optional_multiple_field {
                query_params.push(("optionalMultipleField".to_string(), serde_json::to_string(&value).unwrap_or_default()));
            }
            if let Some(value) = multiple_field {
                query_params.push(("multipleField".to_string(), value.to_string()));
            }
            Some(query_params)
        },
            options,
        ).await
    }

    pub async fn get_playlist(&self, service_param: i32, playlist_id: &PlaylistId, options: Option<RequestOptions>) -> Result<Playlist, ClientError> {
        self.http_client.execute_request(
            Method::GET,
            &format!("/v2/playlist/{}{}", service_param, playlist_id.0),
            None,
            None,
            options,
        ).await
    }

    pub async fn update_playlist(&self, service_param: i32, playlist_id: &PlaylistId, request: &Option<UpdatePlaylistRequest>, options: Option<RequestOptions>) -> Result<Option<Playlist>, ClientError> {
        self.http_client.execute_request(
            Method::PUT,
            &format!("/v2/playlist/{}{}", service_param, playlist_id.0),
            Some(serde_json::to_value(request).unwrap_or_default()),
            None,
            options,
        ).await
    }

    pub async fn delete_playlist(&self, service_param: i32, playlist_id: &PlaylistId, options: Option<RequestOptions>) -> Result<(), ClientError> {
        self.http_client.execute_request(
            Method::DELETE,
            &format!("/v2/playlist/{}{}", service_param, playlist_id.0),
            None,
            None,
            options,
        ).await
    }

}

