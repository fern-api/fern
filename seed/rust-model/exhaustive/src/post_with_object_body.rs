use crate::types_object_object_with_optional_field::ObjectWithOptionalField;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostWithObjectBody {
    pub string: String,
    pub integer: i32,
    #[serde(rename = "NestedObject")]
    pub nested_object: ObjectWithOptionalField,
}