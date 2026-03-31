pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DebugKeyValuePairs {
    pub key: Box<DebugVariableValue>,
    pub value: Box<DebugVariableValue>,
}

impl DebugKeyValuePairs {
    pub fn builder() -> DebugKeyValuePairsBuilder {
        <DebugKeyValuePairsBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DebugKeyValuePairsBuilder {
    key: Option<Box<DebugVariableValue>>,
    value: Option<Box<DebugVariableValue>>,
}

impl DebugKeyValuePairsBuilder {
    pub fn key(mut self, value: Box<DebugVariableValue>) -> Self {
        self.key = Some(value);
        self
    }

    pub fn value(mut self, value: Box<DebugVariableValue>) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`DebugKeyValuePairs`].
    /// This method will fail if any of the following fields are not set:
    /// - [`key`](DebugKeyValuePairsBuilder::key)
    /// - [`value`](DebugKeyValuePairsBuilder::value)
    pub fn build(self) -> Result<DebugKeyValuePairs, BuildError> {
        Ok(DebugKeyValuePairs {
            key: self.key.ok_or_else(|| BuildError::missing_field("key"))?,
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
