pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PostWithObjectBody {
    #[serde(default)]
    pub string: String,
    #[serde(default)]
    pub integer: i64,
    #[serde(rename = "NestedObject")]
    #[serde(default)]
    pub nested_object: ObjectWithOptionalField,
}
