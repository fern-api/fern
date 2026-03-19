pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TraceResponseV2 {
    #[serde(rename = "submissionId")]
    #[serde(default)]
    pub submission_id: SubmissionId,
    #[serde(rename = "lineNumber")]
    #[serde(default)]
    pub line_number: i64,
    #[serde(default)]
    pub file: TracedFile,
    #[serde(rename = "returnValue")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub return_value: Option<DebugVariableValue>,
    #[serde(rename = "expressionLocation")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expression_location: Option<ExpressionLocation>,
    #[serde(default)]
    pub stack: StackInformation,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stdout: Option<String>,
}
