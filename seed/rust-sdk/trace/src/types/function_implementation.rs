use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FunctionImplementation {
    pub impl: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub imports: Option<String>,
}