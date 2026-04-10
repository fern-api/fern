pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct V2V3TestCaseMetadata {
    #[serde(default)]
    pub id: V2V3TestCaseId,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub hidden: bool,
}

impl V2V3TestCaseMetadata {
    pub fn builder() -> V2V3TestCaseMetadataBuilder {
        <V2V3TestCaseMetadataBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3TestCaseMetadataBuilder {
    id: Option<V2V3TestCaseId>,
    name: Option<String>,
    hidden: Option<bool>,
}

impl V2V3TestCaseMetadataBuilder {
    pub fn id(mut self, value: V2V3TestCaseId) -> Self {
        self.id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn hidden(mut self, value: bool) -> Self {
        self.hidden = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3TestCaseMetadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](V2V3TestCaseMetadataBuilder::id)
    /// - [`name`](V2V3TestCaseMetadataBuilder::name)
    /// - [`hidden`](V2V3TestCaseMetadataBuilder::hidden)
    pub fn build(self) -> Result<V2V3TestCaseMetadata, BuildError> {
        Ok(V2V3TestCaseMetadata {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            hidden: self.hidden.ok_or_else(|| BuildError::missing_field("hidden"))?,
        })
    }
}
