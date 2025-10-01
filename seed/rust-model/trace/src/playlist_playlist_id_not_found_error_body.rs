use crate::playlist_playlist_id::PlaylistId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum PlaylistIdNotFoundErrorBody {
        PlaylistId {
            value: PlaylistId,
        },
}
