pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct ContainerObject {
    #[serde(rename = "nestedObjects")]
    #[serde(default)]
    pub nested_objects: Vec<NestedObjectWithLiterals>,
}