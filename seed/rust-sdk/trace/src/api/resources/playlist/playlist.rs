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

    /// Create a new playlist
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .playlist
    ///         .create_playlist(
    ///             1,
    ///             &CreatePlaylistRequest {
    ///                 datetime: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                 optional_datetime: Some(
    ///                     DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                 ),
    ///                 body: PlaylistCreateRequest {
    ///                     name: "name".to_string(),
    ///                     problems: vec![
    ///                         ProblemId("problems".to_string()),
    ///                         ProblemId("problems".to_string()),
    ///                     ],
    ///                     ..Default::default()
    ///                 },
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .playlist
    ///         .get_playlists(
    ///             1,
    ///             &GetPlaylistsQueryRequest {
    ///                 limit: Some(1),
    ///                 other_field: "otherField".to_string(),
    ///                 multi_line_docs: "multiLineDocs".to_string(),
    ///                 optional_multiple_field: vec![Some("optionalMultipleField".to_string())],
    ///                 multiple_field: vec!["multipleField".to_string()],
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// Returns a playlist
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .playlist
    ///         .get_playlist(1, &PlaylistId("playlistId".to_string()), None)
    ///         .await;
    /// }
    /// ```
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

    /// Updates a playlist
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .playlist
    ///         .update_playlist(
    ///             1,
    ///             &PlaylistId("playlistId".to_string()),
    ///             &Some(UpdatePlaylistRequest {
    ///                 name: "name".to_string(),
    ///                 problems: vec![
    ///                     ProblemId("problems".to_string()),
    ///                     ProblemId("problems".to_string()),
    ///                 ],
    ///                 ..Default::default()
    ///             }),
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
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

    /// Deletes a playlist
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    ///
    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .playlist
    ///         .delete_playlist(1, &PlaylistId("playlist_id".to_string()), None)
    ///         .await;
    /// }
    /// ```
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
}
