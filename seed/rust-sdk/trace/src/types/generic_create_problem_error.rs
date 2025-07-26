use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GenericCreateProblemError {
    pub message: String,
    pub r#type: String,
    pub stacktrace: String,
}