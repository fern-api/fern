use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MyObjectWithOptional {
    pub prop: String,
    #[serde(rename = "optionalProp")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_prop: Option<String>,
}