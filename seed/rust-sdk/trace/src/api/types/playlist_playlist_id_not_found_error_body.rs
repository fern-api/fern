pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum PlaylistIdNotFoundErrorBody {
    #[serde(rename = "playlistId")]
    #[non_exhaustive]
    PlaylistId { value: PlaylistId },
}

impl PlaylistIdNotFoundErrorBody {
    pub fn playlist_id(value: PlaylistId) -> Self {
        Self::PlaylistId { value }
    }
}
