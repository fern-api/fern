use crate::commons_problem_id::ProblemId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UpdatePlaylistRequest {
    pub name: String,
    /// The problems that make up the playlist.
    pub problems: Vec<ProblemId>,
}
