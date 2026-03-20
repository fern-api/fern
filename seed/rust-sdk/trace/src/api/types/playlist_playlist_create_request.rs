pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct PlaylistCreateRequest {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub problems: Vec<ProblemId>,
}
