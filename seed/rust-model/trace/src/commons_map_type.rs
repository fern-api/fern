pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MapType {
    #[serde(rename = "keyType")]
    pub key_type: Box<VariableType>,
    #[serde(rename = "valueType")]
    pub value_type: Box<VariableType>,
}

impl MapType {
    pub fn builder() -> MapTypeBuilder {
        MapTypeBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MapTypeBuilder {
    key_type: Option<Box<VariableType>>,
    value_type: Option<Box<VariableType>>,
}

impl MapTypeBuilder {
    pub fn key_type(mut self, value: Box<VariableType>) -> Self {
        self.key_type = Some(value);
        self
    }

    pub fn value_type(mut self, value: Box<VariableType>) -> Self {
        self.value_type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`MapType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`key_type`](MapTypeBuilder::key_type)
    /// - [`value_type`](MapTypeBuilder::value_type)
    pub fn build(self) -> Result<MapType, BuildError> {
        Ok(MapType {
            key_type: self.key_type.ok_or_else(|| BuildError::missing_field("key_type"))?,
            value_type: self.value_type.ok_or_else(|| BuildError::missing_field("value_type"))?,
        })
    }
}
