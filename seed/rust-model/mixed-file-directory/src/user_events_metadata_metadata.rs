pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Metadata {
    #[serde(default)]
    pub id: Id,
    pub value: serde_json::Value,
}

impl Metadata {
    pub fn builder() -> MetadataBuilder {
        MetadataBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MetadataBuilder {
    id: Option<Id>,
    value: Option<serde_json::Value>,
}

impl MetadataBuilder {
    pub fn id(mut self, value: Id) -> Self {
        self.id = Some(value);
        self
    }

    pub fn value(mut self, value: serde_json::Value) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Metadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](MetadataBuilder::id)
    /// - [`value`](MetadataBuilder::value)
    pub fn build(self) -> Result<Metadata, BuildError> {
        Ok(Metadata {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            value: self.value.ok_or_else(|| BuildError::missing_field("value"))?,
        })
    }
}
