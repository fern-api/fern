pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct UsereventsMetadata {
    #[serde(default)]
    pub id: Id,
    pub value: serde_json::Value,
}

impl UsereventsMetadata {
    pub fn builder() -> UsereventsMetadataBuilder {
        <UsereventsMetadataBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UsereventsMetadataBuilder {
    id: Option<Id>,
    value: Option<serde_json::Value>,
}

impl UsereventsMetadataBuilder {
    pub fn id(mut self, value: Id) -> Self {
        self.id = Some(value);
        self
    }

    pub fn value(mut self, value: serde_json::Value) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UsereventsMetadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](UsereventsMetadataBuilder::id)
    /// - [`value`](UsereventsMetadataBuilder::value)
    pub fn build(self) -> Result<UsereventsMetadata, BuildError> {
        Ok(UsereventsMetadata {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            value: self
                .value
                .ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
