use crate::problem_id::ProblemId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PlaylistCreateRequest {
    pub name: String,
    pub problems: Vec<ProblemId>,
}