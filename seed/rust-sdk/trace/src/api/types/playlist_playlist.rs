use crate::commons_user_id::UserId;
use crate::playlist_playlist_create_request::PlaylistCreateRequest;
use crate::playlist_playlist_id::PlaylistId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Playlist {
    #[serde(flatten)]
    pub playlist_create_request_fields: PlaylistCreateRequest,
    pub playlist_id: PlaylistId,
    #[serde(rename = "owner-id")]
    pub owner_id: UserId,
}
