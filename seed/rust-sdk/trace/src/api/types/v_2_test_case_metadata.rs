pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct V2TestCaseMetadata {
    #[serde(default)]
    pub id: V2TestCaseId,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub hidden: bool,
}

impl V2TestCaseMetadata {
    pub fn builder() -> V2TestCaseMetadataBuilder {
        <V2TestCaseMetadataBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2TestCaseMetadataBuilder {
    id: Option<V2TestCaseId>,
    name: Option<String>,
    hidden: Option<bool>,
}

impl V2TestCaseMetadataBuilder {
    pub fn id(mut self, value: V2TestCaseId) -> Self {
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

    /// Consumes the builder and constructs a [`V2TestCaseMetadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](V2TestCaseMetadataBuilder::id)
    /// - [`name`](V2TestCaseMetadataBuilder::name)
    /// - [`hidden`](V2TestCaseMetadataBuilder::hidden)
    pub fn build(self) -> Result<V2TestCaseMetadata, BuildError> {
        Ok(V2TestCaseMetadata {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            hidden: self
                .hidden
                .ok_or_else(|| BuildError::missing_field("hidden"))?,
        })
    }
}
