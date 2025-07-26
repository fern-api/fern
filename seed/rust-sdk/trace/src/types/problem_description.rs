use crate::problem_description_board::ProblemDescriptionBoard;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProblemDescription {
    pub boards: Vec<ProblemDescriptionBoard>,
}