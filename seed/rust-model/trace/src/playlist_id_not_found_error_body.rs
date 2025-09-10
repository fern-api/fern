use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum PlaylistIdNotFoundErrorBody {
        PlaylistId {
            value: PlaylistId,
        },
}
