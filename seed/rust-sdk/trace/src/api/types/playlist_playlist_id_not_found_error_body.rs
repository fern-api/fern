pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum PlaylistIdNotFoundErrorBody {
        #[serde(rename = "playlistId")]
        PlaylistId {
            value: PlaylistId,
        },
}
