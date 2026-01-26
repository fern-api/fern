pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ContainerObject {
    #[serde(rename = "nestedObjects")]
    pub nested_objects: Vec<NestedObjectWithLiterals>,
}