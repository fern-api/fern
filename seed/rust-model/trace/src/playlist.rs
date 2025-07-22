use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Playlist {
    pub playlist_id: PlaylistId,
    #[serde(rename = "owner-id")]
    pub owner_id: UserId,
}