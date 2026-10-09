pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct StreamEntity {
    #[serde(default)]
    pub entity_id: String,
}

impl StreamEntity {
    pub fn builder() -> StreamEntityBuilder {
        <StreamEntityBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct StreamEntityBuilder {
    entity_id: Option<String>,
}

impl StreamEntityBuilder {
    pub fn entity_id(mut self, value: impl Into<String>) -> Self {
        self.entity_id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`StreamEntity`].
    /// This method will fail if any of the following fields are not set:
    /// - [`entity_id`](StreamEntityBuilder::entity_id)
    pub fn build(self) -> Result<StreamEntity, BuildError> {
        Ok(StreamEntity {
            entity_id: self.entity_id.ok_or_else(|| BuildError::missing_field("entity_id"))?,
        })
    }
}
