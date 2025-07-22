use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PlaylistCreateRequest {
    pub name: String,
    pub problems: Vec<ProblemId>,
}