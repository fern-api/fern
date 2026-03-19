pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Playlist {
    #[serde(flatten)]
    pub playlist_create_request_fields: PlaylistCreateRequest,
    #[serde(default)]
    pub playlist_id: PlaylistId,
    #[serde(rename = "owner-id")]
    #[serde(default)]
    pub owner_id: UserId,
}