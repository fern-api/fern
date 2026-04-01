use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, QueryBuilder, RequestOptions, WithRawResponse};
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

    /// Create a new playlist
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn create_playlist(
        &self,
        service_param: i64,
        request: &CreatePlaylistRequest,
        options: Option<RequestOptions>,
    ) -> Result<Playlist, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/v2/playlist/{}/create", service_param),
                Some(serde_json::to_value(&request.body).map_err(ApiError::Serialization)?),
                QueryBuilder::new()
                    .datetime("datetime", request.datetime.clone())
                    .datetime("optionalDatetime", request.optional_datetime.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Create a new playlist
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn create_playlist_with_raw_response(
        &self,
        service_param: i64,
        request: &CreatePlaylistRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Playlist>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::POST,
                &format!("/v2/playlist/{}/create", service_param),
                Some(serde_json::to_value(&request.body).map_err(ApiError::Serialization)?),
                QueryBuilder::new()
                    .datetime("datetime", request.datetime.clone())
                    .datetime("optionalDatetime", request.optional_datetime.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Returns the user's playlists
    ///
    /// # Arguments
    ///
    /// * `other_field` - i'm another field
    /// * `multi_line_docs` - I'm a multiline
    /// description
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_playlists(
        &self,
        service_param: i64,
        request: &GetPlaylistsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<Vec<Playlist>, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/v2/playlist/{}/all", service_param),
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .string("otherField", request.other_field.clone())
                    .string("multiLineDocs", request.multi_line_docs.clone())
                    .string_array(
                        "optionalMultipleField",
                        request.optional_multiple_field.clone(),
                    )
                    .string_array("multipleField", request.multiple_field.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Returns the user's playlists
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `other_field` - i'm another field
    /// * `multi_line_docs` - I'm a multiline
    /// description
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_playlists_with_raw_response(
        &self,
        service_param: i64,
        request: &GetPlaylistsQueryRequest,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Vec<Playlist>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                &format!("/v2/playlist/{}/all", service_param),
                None,
                QueryBuilder::new()
                    .int("limit", request.limit.clone())
                    .string("otherField", request.other_field.clone())
                    .string("multiLineDocs", request.multi_line_docs.clone())
                    .string_array(
                        "optionalMultipleField",
                        request.optional_multiple_field.clone(),
                    )
                    .string_array("multipleField", request.multiple_field.clone())
                    .build(),
                options,
            )
            .await
    }

    /// Returns a playlist
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn get_playlist(
        &self,
        service_param: i64,
        playlist_id: &PlaylistId,
        options: Option<RequestOptions>,
    ) -> Result<Playlist, ApiError> {
        self.http_client
            .execute_request(
                Method::GET,
                &format!("/v2/playlist/{}/{}", service_param, playlist_id.0),
                None,
                None,
                options,
            )
            .await
    }

    /// Returns a playlist
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn get_playlist_with_raw_response(
        &self,
        service_param: i64,
        playlist_id: &PlaylistId,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Playlist>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::GET,
                &format!("/v2/playlist/{}/{}", service_param, playlist_id.0),
                None,
                None,
                options,
            )
            .await
    }

    /// Updates a playlist
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    pub async fn update_playlist(
        &self,
        service_param: i64,
        playlist_id: &PlaylistId,
        request: &Option<UpdatePlaylistRequest>,
        options: Option<RequestOptions>,
    ) -> Result<Option<Playlist>, ApiError> {
        self.http_client
            .execute_request(
                Method::PUT,
                &format!("/v2/playlist/{}/{}", service_param, playlist_id.0),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Updates a playlist
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn update_playlist_with_raw_response(
        &self,
        service_param: i64,
        playlist_id: &PlaylistId,
        request: &Option<UpdatePlaylistRequest>,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<Option<Playlist>>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::PUT,
                &format!("/v2/playlist/{}/{}", service_param, playlist_id.0),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Deletes a playlist
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    pub async fn delete_playlist(
        &self,
        service_param: i64,
        playlist_id: &PlaylistId,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                &format!("/v2/playlist/{}/{}", service_param, playlist_id.0),
                None,
                None,
                options,
            )
            .await
    }

    /// Deletes a playlist
    ///
    /// This method returns a `WithRawResponse<T>` that includes both the parsed
    /// response data and the raw HTTP response metadata (status code and headers).
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// The parsed response wrapped with raw HTTP metadata
    pub async fn delete_playlist_with_raw_response(
        &self,
        service_param: i64,
        playlist_id: &PlaylistId,
        options: Option<RequestOptions>,
    ) -> Result<WithRawResponse<()>, ApiError> {
        self.http_client
            .execute_request_with_raw_response(
                Method::DELETE,
                &format!("/v2/playlist/{}/{}", service_param, playlist_id.0),
                None,
                None,
                options,
            )
            .await
    }
}
