pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ContainerValue {
    List { value: Vec<Box<FieldValue>> },

    Optional { value: Option<Box<FieldValue>> },
}
