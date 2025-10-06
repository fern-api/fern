pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProblemProblemDescription {
    pub boards: Vec<ProblemProblemDescriptionBoard>,
}