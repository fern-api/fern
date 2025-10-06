pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ProblemGenericCreateProblemError {
    pub message: String,
    pub r#type: String,
    pub stacktrace: String,
}
