use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UpdatePlaylistRequest {
    pub name: String,
    pub problems: Vec<ProblemId>,
}