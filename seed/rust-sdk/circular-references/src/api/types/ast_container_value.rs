pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ContainerValue {
    #[serde(rename = "list")]
    #[non_exhaustive]
    List { value: Vec<Box<FieldValue>> },

    #[serde(rename = "optional")]
    #[non_exhaustive]
    Optional { value: Option<Box<FieldValue>> },
}

impl ContainerValue {
    pub fn list(value: Vec<Box<FieldValue>>) -> Self {
        Self::List { value }
    }

    pub fn optional(value: Option<Box<FieldValue>>) -> Self {
        Self::Optional { value }
    }
}
