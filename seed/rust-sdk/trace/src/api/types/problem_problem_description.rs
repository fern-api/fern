pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ProblemDescription {
    #[serde(default)]
    pub boards: Vec<ProblemDescriptionBoard>,
}