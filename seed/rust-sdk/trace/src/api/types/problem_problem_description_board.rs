pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ProblemDescriptionBoard {
        #[serde(rename = "html")]
        Html {
            value: String,
        },

        #[serde(rename = "variable")]
        Variable {
            value: VariableValue,
        },

        #[serde(rename = "testCaseId")]
        TestCaseId {
            value: String,
        },
}
