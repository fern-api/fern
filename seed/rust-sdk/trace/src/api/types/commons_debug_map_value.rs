pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct DebugMapValue {
    #[serde(rename = "keyValuePairs")]
    #[serde(default)]
    pub key_value_pairs: Vec<Box<DebugKeyValuePairs>>,
}

impl DebugMapValue {
    pub fn builder() -> DebugMapValueBuilder {
        DebugMapValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugMapValueBuilder {
    key_value_pairs: Option<Vec<Box<DebugKeyValuePairs>>>,
}

impl DebugMapValueBuilder {
    pub fn key_value_pairs(mut self, value: Vec<Box<DebugKeyValuePairs>>) -> Self {
        self.key_value_pairs = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugMapValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`key_value_pairs`](DebugMapValueBuilder::key_value_pairs)
    pub fn build(self) -> Result<DebugMapValue, BuildError> {
        Ok(DebugMapValue {
            key_value_pairs: self
                .key_value_pairs
                .ok_or_else(|| BuildError::missing_field("key_value_pairs"))?,
        })
    }
}
