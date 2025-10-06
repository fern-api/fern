pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionTraceResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionSubmissionId,
    #[serde(rename = "lineNumber")]
    pub line_number: i64,
    #[serde(rename = "returnValue")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub return_value: Option<CommonsDebugVariableValue>,
    #[serde(rename = "expressionLocation")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expression_location: Option<SubmissionExpressionLocation>,
    pub stack: SubmissionStackInformation,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stdout: Option<String>,
}