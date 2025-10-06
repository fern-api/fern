pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ReferenceContainerObject {
    #[serde(rename = "nestedObjects")]
    pub nested_objects: Vec<ReferenceNestedObjectWithLiterals>,
}
