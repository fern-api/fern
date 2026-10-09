pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
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

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
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

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
