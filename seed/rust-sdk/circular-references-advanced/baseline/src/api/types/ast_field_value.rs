pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum FieldValue {
    #[serde(rename = "primitive_value")]
    #[non_exhaustive]
    PrimitiveValue { value: PrimitiveValue },

    #[serde(rename = "object_value")]
    #[non_exhaustive]
    ObjectValue {},

    #[serde(rename = "container_value")]
    #[non_exhaustive]
    ContainerValue { value: Box<ContainerValue> },
}

impl FieldValue {
    pub fn primitive_value(value: PrimitiveValue) -> Self {
        Self::PrimitiveValue { value }
    }

    pub fn object_value() -> Self {
        Self::ObjectValue {}
    }

    pub fn container_value(value: Box<ContainerValue>) -> Self {
        Self::ContainerValue { value }
    }
}
