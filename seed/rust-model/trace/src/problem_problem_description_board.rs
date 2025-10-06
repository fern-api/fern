pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ProblemProblemDescriptionBoard {
        Html {
            value: String,
        },

        Variable {
            value: CommonsVariableValue,
        },

        TestCaseId {
            value: String,
        },
}
