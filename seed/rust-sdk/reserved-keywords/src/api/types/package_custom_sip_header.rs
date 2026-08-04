pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct CustomSipHeader {
    #[serde(default)]
    pub key: String,
    #[serde(default)]
    pub value: String,
}

impl CustomSipHeader {
    pub fn builder() -> CustomSipHeaderBuilder {
        <CustomSipHeaderBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CustomSipHeaderBuilder {
    key: Option<String>,
    value: Option<String>,
}

impl CustomSipHeaderBuilder {
    pub fn key(mut self, value: impl Into<String>) -> Self {
        self.key = Some(value.into());
        self
    }

    pub fn value(mut self, value: impl Into<String>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CustomSipHeader`].
    /// This method will fail if any of the following fields are not set:
    /// - [`key`](CustomSipHeaderBuilder::key)
    /// - [`value`](CustomSipHeaderBuilder::value)
    pub fn build(self) -> Result<CustomSipHeader, BuildError> {
        Ok(CustomSipHeader {
            key: self.key.ok_or_else(|| BuildError::missing_field("key"))?,
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
