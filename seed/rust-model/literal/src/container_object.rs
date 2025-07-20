use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ContainerObject {
    #[serde(rename = "nestedObjects")]
    pub nested_objects: Vec<NestedObjectWithLiterals>,
}