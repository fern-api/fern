pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum PlaylistIdNotFoundErrorBody {
    #[serde(rename = "playlistId")]
    #[non_exhaustive]
    PlaylistId { value: PlaylistId },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl PlaylistIdNotFoundErrorBody {
    pub fn playlist_id(value: PlaylistId) -> Self {
        Self::PlaylistId { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
