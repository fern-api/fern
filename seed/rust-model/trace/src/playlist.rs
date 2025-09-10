use serde::{Deserialize, Serialize};
use crate::types::playlist_create_request::PlaylistCreateRequest;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Playlist {
    #[serde(flatten)]
    pub playlist_create_request_fields: PlaylistCreateRequest,
    pub playlist_id: PlaylistId,
    #[serde(rename = "owner-id")]
    pub owner_id: UserId,
}