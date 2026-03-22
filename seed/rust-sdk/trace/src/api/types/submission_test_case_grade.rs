pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseGrade {
    #[serde(rename = "hidden")]
    #[non_exhaustive]
    Hidden {
        #[serde(default)]
        passed: bool,
    },

    #[serde(rename = "nonHidden")]
    #[non_exhaustive]
    NonHidden {
        #[serde(default)]
        passed: bool,
        #[serde(rename = "actualResult")]
        #[serde(skip_serializing_if = "Option::is_none")]
        actual_result: Option<VariableValue>,
        #[serde(skip_serializing_if = "Option::is_none")]
        exception: Option<ExceptionV2>,
        #[serde(default)]
        stdout: String,
    },
}

impl TestCaseGrade {
    pub fn hidden(passed: bool) -> Self {
        Self::Hidden { passed }
    }

    pub fn non_hidden(passed: bool, stdout: String) -> Self {
        Self::NonHidden {
            passed,
            actual_result: None,
            exception: None,
            stdout,
        }
    }
}
