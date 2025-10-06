pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PlaylistUpdatePlaylistRequest {
    pub name: String,
    /// The problems that make up the playlist.
    pub problems: Vec<CommonsProblemId>,
}