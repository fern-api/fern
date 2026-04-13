pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ContainerValue {
    #[serde(rename = "list")]
    #[non_exhaustive]
    List {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<Vec<Box<FieldValue>>>,
    },

    #[serde(rename = "optional")]
    #[non_exhaustive]
    Optional {
        #[serde(skip_serializing_if = "Option::is_none")]
        value: Option<Box<FieldValue>>,
    },
}

impl ContainerValue {
    pub fn list() -> Self {
        Self::List { value: None }
    }

    pub fn optional() -> Self {
        Self::Optional { value: None }
    }

    pub fn list_with_value(value: Vec<Box<FieldValue>>) -> Self {
        Self::List { value: Some(value) }
    }

    pub fn optional_with_value(value: Box<FieldValue>) -> Self {
        Self::Optional { value: Some(value) }
    }
}
