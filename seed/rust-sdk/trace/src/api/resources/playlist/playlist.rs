use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions};
use reqwest::Method;

pub struct PlaylistClient {
    pub http_client: HttpClient,
}

impl PlaylistClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    pub async fn create_playlist(
        &self,
        service_param: i32,
        request: &PlaylistCreateRequest,
        options: Option<RequestOptions>,
    ) -> Result<Playlist, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/v2/playlist/{}", service_param),
                Some(serde_json::to_value(request).unwrap_or_default()),
                QueryBuilder::new()
                    .datetime("datetime", request.datetime.clone())
                    .datetime("optionalDatetime", request.optional_datetime.clone())
                    .build(),
                options,
            )
            .await
    }

    pub async fn get_playlists(
        &self,
        service_param: i32,
        request: &GetPlaylistsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Playlist>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/v2/playlist/{}", service_param),
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .string("otherField", request.other_field.clone())
                    .string("multiLineDocs", request.multi_line_docs.clone())
                    .string(
                        "optionalMultipleField",
                        request.optional_multiple_field.clone(),
                    )
                    .string("multipleField", request.multiple_field.clone())
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
