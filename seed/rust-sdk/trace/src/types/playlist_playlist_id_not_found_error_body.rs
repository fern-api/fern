use crate::playlist_playlist_id::PlaylistId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum PlaylistIdNotFoundErrorBody {
    PlaylistId { value: PlaylistId },
}
