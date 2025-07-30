use crate::problem_id::ProblemId;
use crate::create_problem_error::CreateProblemError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CreateProblemResponse {
        Success {
            value: ProblemId,
        },

        Error {
            value: CreateProblemError,
        },
}
