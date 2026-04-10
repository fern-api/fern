pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct KeyValuePair {
    pub key: Box<VariableValue>,
    pub value: Box<VariableValue>,
}

impl KeyValuePair {
    pub fn builder() -> KeyValuePairBuilder {
        <KeyValuePairBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct KeyValuePairBuilder {
    key: Option<Box<VariableValue>>,
    value: Option<Box<VariableValue>>,
}

impl KeyValuePairBuilder {
    pub fn key(mut self, value: Box<VariableValue>) -> Self {
        self.key = Some(value);
        self
    }

    pub fn value(mut self, value: Box<VariableValue>) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`KeyValuePair`].
    /// This method will fail if any of the following fields are not set:
    /// - [`key`](KeyValuePairBuilder::key)
    /// - [`value`](KeyValuePairBuilder::value)
    pub fn build(self) -> Result<KeyValuePair, BuildError> {
        Ok(KeyValuePair {
            key: self.key.ok_or_else(|| BuildError::missing_field("key"))?,
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
