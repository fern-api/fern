pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct WithMetadata {
    #[serde(default)]
    pub metadata: HashMap<String, String>,
}

impl WithMetadata {
    pub fn builder() -> WithMetadataBuilder {
        WithMetadataBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WithMetadataBuilder {
    metadata: Option<HashMap<String, String>>,
}

impl WithMetadataBuilder {
    pub fn metadata(mut self, value: HashMap<String, String>) -> Self {
        self.metadata = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WithMetadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`metadata`](WithMetadataBuilder::metadata)
    pub fn build(self) -> Result<WithMetadata, BuildError> {
        Ok(WithMetadata {
            metadata: self
                .metadata
                .ok_or_else(|| BuildError::missing_field("metadata"))?,
        })
    }
}
