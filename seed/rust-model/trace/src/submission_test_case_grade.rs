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
        Self::NonHidden { passed, actual_result: None, exception: None, stdout }
    }

    pub fn non_hidden_with_actual_result(passed: bool, actual_result: VariableValue, exception: Option<ExceptionV2>, stdout: String) -> Self {
        Self::NonHidden { passed, actual_result: Some(actual_result), exception, stdout }
    }

    pub fn non_hidden_with_exception(passed: bool, actual_result: Option<VariableValue>, exception: ExceptionV2, stdout: String) -> Self {
        Self::NonHidden { passed, actual_result, exception: Some(exception), stdout }
    }
}
