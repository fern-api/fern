use crate::problem_problem_description_board::ProblemDescriptionBoard;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemDescription {
    pub boards: Vec<ProblemDescriptionBoard>,
}
