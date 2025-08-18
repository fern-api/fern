use crate::problem_id::ProblemId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UpdatePlaylistRequest {
    pub name: String,
    pub problems: Vec<ProblemId>,
}