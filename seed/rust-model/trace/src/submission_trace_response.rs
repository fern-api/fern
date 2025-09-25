use crate::submission_submission_id::SubmissionId;
use crate::commons_debug_variable_value::DebugVariableValue;
use crate::submission_expression_location::ExpressionLocation;
use crate::submission_stack_information::StackInformation;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    #[serde(rename = "lineNumber")]
    pub line_number: i32,
    #[serde(rename = "returnValue")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub return_value: Option<DebugVariableValue>,
    #[serde(rename = "expressionLocation")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expression_location: Option<ExpressionLocation>,
    pub stack: StackInformation,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stdout: Option<String>,
}