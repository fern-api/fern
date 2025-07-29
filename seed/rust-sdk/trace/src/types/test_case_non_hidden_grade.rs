use crate::variable_value::VariableValue;
use crate::exception_v_2::ExceptionV2;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseNonHiddenGrade {
    pub passed: bool,
    #[serde(rename = "actualResult")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actual_result: Option<VariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exception: Option<ExceptionV2>,
    pub stdout: String,
}