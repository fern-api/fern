pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ProblemDescriptionBoard {
        #[serde(rename = "html")]
        #[non_exhaustive]
        Html {
            value: String,
        },

        #[serde(rename = "variable")]
        #[non_exhaustive]
        Variable {
            value: VariableValue,
        },

        #[serde(rename = "testCaseId")]
        #[non_exhaustive]
        TestCaseId {
            value: String,
        },
}

impl ProblemDescriptionBoard {
    pub fn html(value: String) -> Self {
        Self::Html { value }
    }

    pub fn variable(value: VariableValue) -> Self {
        Self::Variable { value }
    }

    pub fn test_case_id(value: String) -> Self {
        Self::TestCaseId { value }
    }
}
