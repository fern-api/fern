pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionStackFrame {
    #[serde(rename = "methodName")]
    pub method_name: String,
    #[serde(rename = "lineNumber")]
    pub line_number: i64,
    pub scopes: Vec<SubmissionScope>,
}
