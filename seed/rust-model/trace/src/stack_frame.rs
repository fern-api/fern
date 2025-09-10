use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StackFrame {
    #[serde(rename = "methodName")]
    pub method_name: String,
    #[serde(rename = "lineNumber")]
    pub line_number: i32,
    pub scopes: Vec<Scope>,
}