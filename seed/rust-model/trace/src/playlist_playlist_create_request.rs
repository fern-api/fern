pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct PlaylistCreateRequest {
    pub name: String,
    pub problems: Vec<ProblemId>,
}