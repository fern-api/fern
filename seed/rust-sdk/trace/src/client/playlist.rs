use crate::types::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct PlaylistClient {
    pub http_client: HttpClient,
}

impl PlaylistClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })
    }

    pub async fn create_playlist(
        &self,
        service_param: i32,
        datetime: Option<chrono::DateTime<chrono::Utc>>,
        optional_datetime: Option<chrono::DateTime<chrono::Utc>>,
        request: &PlaylistCreateRequest,
        options: Option<RequestOptions>,
    ) -> Result<Playlist, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/v2/playlist/{}", service_param),
                Some(serde_json::to_value(request).unwrap_or_default()),
                QueryBuilder::new()
                    .datetime("datetime", datetime)
                    .datetime("optionalDatetime", optional_datetime)
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_playlists(
        &self,
        service_param: i32,
        limit: Option<i32>,
        other_field: Option<String>,
        multi_line_docs: Option<String>,
        optional_multiple_field: Option<String>,
        multiple_field: Option<String>,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Playlist>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/v2/playlist/{}", service_param),
                None,
                QueryBuilder::new()
                    .int("limit", limit)
                    .string("otherField", other_field)
                    .string("multiLineDocs", multi_line_docs)
                    .string("optionalMultipleField", optional_multiple_field)
                    .string("multipleField", multiple_field)
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_playlist(
        &self,
        service_param: i32,
        playlist_id: &PlaylistId,
        options: Option<RequestOptions>,
    ) -> Result<Playlist, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/v2/playlist/{}{}", service_param, playlist_id.0),
                None,
                None,
                options,
            )
            .await
    }

    pub async fn update_playlist(
        &self,
        service_param: i32,
        playlist_id: &PlaylistId,
        request: &Option<UpdatePlaylistRequest>,
        options: Option<RequestOptions>,
    ) -> Result<Option<Playlist>, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!("/v2/playlist/{}{}", service_param, playlist_id.0),
                Some(serde_json::to_value(request).unwrap_or_default()),
                None,
                options,
            )
            .await
    }

    pub async fn delete_playlist(
        &self,
        service_param: i32,
        playlist_id: &PlaylistId,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                &format!("/v2/playlist/{}{}", service_param, playlist_id.0),
                None,
                None,
                options,
            )
            .await
    }
}
