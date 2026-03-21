pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GenericValue {
    #[serde(rename = "stringifiedType")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stringified_type: Option<String>,
    #[serde(rename = "stringifiedValue")]
    #[serde(default)]
    pub stringified_value: String,
}

impl GenericValue {
    pub fn builder() -> GenericValueBuilder {
        GenericValueBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GenericValueBuilder {
    stringified_type: Option<String>,
    stringified_value: Option<String>,
}

impl GenericValueBuilder {
    pub fn stringified_type(mut self, value: impl Into<String>) -> Self {
        self.stringified_type = Some(value.into());
        self
    }

    pub fn stringified_value(mut self, value: impl Into<String>) -> Self {
        self.stringified_value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GenericValue`].
    /// This method will fail if any of the following fields are not set:
    /// - [`stringified_value`](GenericValueBuilder::stringified_value)
    pub fn build(self) -> Result<GenericValue, BuildError> {
        Ok(GenericValue {
            stringified_type: self.stringified_type,
            stringified_value: self
                .stringified_value
                .ok_or_else(|| BuildError::missing_field("stringified_value"))?,
        })
    }
}
