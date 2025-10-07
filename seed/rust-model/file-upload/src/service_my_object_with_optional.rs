pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ServiceMyObjectWithOptional {
    pub prop: String,
    #[serde(rename = "optionalProp")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_prop: Option<String>,
}