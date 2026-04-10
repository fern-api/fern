pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct NamedMetadata {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub value: HashMap<String, serde_json::Value>,
}

impl NamedMetadata {
    pub fn builder() -> NamedMetadataBuilder {
        <NamedMetadataBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NamedMetadataBuilder {
    name: Option<String>,
    value: Option<HashMap<String, serde_json::Value>>,
}

impl NamedMetadataBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn value(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NamedMetadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](NamedMetadataBuilder::name)
    /// - [`value`](NamedMetadataBuilder::value)
    pub fn build(self) -> Result<NamedMetadata, BuildError> {
        Ok(NamedMetadata {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
