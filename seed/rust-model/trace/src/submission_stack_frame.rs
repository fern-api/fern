pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct StackFrame {
    #[serde(rename = "methodName")]
    #[serde(default)]
    pub method_name: String,
    #[serde(rename = "lineNumber")]
    #[serde(default)]
    pub line_number: i64,
    #[serde(default)]
    pub scopes: Vec<Scope>,
}