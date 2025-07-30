use crate::object_with_optional_field::ObjectWithOptionalField;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NestedObjectWithOptionalField {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub string: Option<String>,
    #[serde(rename = "NestedObject")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nested_object: Option<ObjectWithOptionalField>,
}