use crate::reference_nested_object_with_literals::NestedObjectWithLiterals;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ContainerObject {
    #[serde(rename = "nestedObjects")]
    pub nested_objects: Vec<NestedObjectWithLiterals>,
}