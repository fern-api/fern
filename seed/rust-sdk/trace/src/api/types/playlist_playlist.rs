pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PlaylistPlaylist {
    #[serde(flatten)]
    pub playlist_create_request_fields: PlaylistPlaylistCreateRequest,
    pub playlist_id: PlaylistPlaylistId,
    #[serde(rename = "owner-id")]
    pub owner_id: CommonsUserId,
}
