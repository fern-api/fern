pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesObjectNestedObjectWithRequiredField {
    pub string: String,
    #[serde(rename = "NestedObject")]
    pub nested_object: TypesObjectObjectWithOptionalField,
}
