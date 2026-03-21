pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct MapValue {
    #[serde(rename = "keyValuePairs")]
    #[serde(default)]
    pub key_value_pairs: Vec<Box<KeyValuePair>>,
}

impl MapValue {
    pub fn builder() -> MapValueBuilder {
        MapValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MapValueBuilder {
    key_value_pairs: Option<Vec<Box<KeyValuePair>>>,
}

impl MapValueBuilder {
    pub fn key_value_pairs(mut self, value: Vec<Box<KeyValuePair>>) -> Self {
        self.key_value_pairs = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`MapValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`key_value_pairs`](MapValueBuilder::key_value_pairs)
    pub fn build(self) -> Result<MapValue, BuildError> {
        Ok(MapValue {
            key_value_pairs: self.key_value_pairs.ok_or_else(|| BuildError::missing_field("key_value_pairs"))?,
        })
    }
}
