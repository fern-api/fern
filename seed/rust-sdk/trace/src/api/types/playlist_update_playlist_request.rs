pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UpdatePlaylistRequest {
    #[serde(default)]
    pub name: String,
    /// The problems that make up the playlist.
    #[serde(default)]
    pub problems: Vec<ProblemId>,
}
