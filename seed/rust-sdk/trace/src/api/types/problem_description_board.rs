pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ProblemDescriptionBoard {
    #[serde(rename = "html")]
    #[non_exhaustive]
    Html {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<String>,
    },

    #[serde(rename = "variable")]
    #[non_exhaustive]
    Variable {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<VariableValue>,
    },

    #[serde(rename = "testCaseId")]
    #[non_exhaustive]
    TestCaseId {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<String>,
    },
}

impl ProblemDescriptionBoard {
    pub fn html() -> Self {
        Self::Html { value: None }
    }

    pub fn variable() -> Self {
        Self::Variable { value: None }
    }

    pub fn test_case_id() -> Self {
        Self::TestCaseId { value: None }
    }

    pub fn html_with_value(value: String) -> Self {
        Self::Html { value: Some(value) }
    }

    pub fn variable_with_value(value: VariableValue) -> Self {
        Self::Variable { value: Some(value) }
    }

    pub fn test_case_id_with_value(value: String) -> Self {
        Self::TestCaseId { value: Some(value) }
    }
}
