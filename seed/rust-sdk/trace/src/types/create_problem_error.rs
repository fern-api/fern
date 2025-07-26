use crate::generic_create_problem_error::GenericCreateProblemError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "_type")]
pub enum CreateProblemError {
        Generic {
            #[serde(flatten)]
            data: GenericCreateProblemError,
        },
}
