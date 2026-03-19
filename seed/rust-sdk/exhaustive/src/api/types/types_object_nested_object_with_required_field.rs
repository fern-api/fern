pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct NestedObjectWithRequiredField {
    #[serde(default)]
    pub string: String,
    #[serde(rename = "NestedObject")]
    #[serde(default)]
    pub nested_object: ObjectWithOptionalField,
}
