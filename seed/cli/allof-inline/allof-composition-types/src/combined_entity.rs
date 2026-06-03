pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CombinedEntity {
    /// Unique identifier.
    #[serde(default)]
    pub id: String,
    /// Display name from Describable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// A short summary.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    pub status: CombinedEntityStatus,
}

impl CombinedEntity {
    pub fn builder() -> CombinedEntityBuilder {
        <CombinedEntityBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CombinedEntityBuilder {
    id: Option<String>,
    name: Option<String>,
    summary: Option<String>,
    status: Option<CombinedEntityStatus>,
}

impl CombinedEntityBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn summary(mut self, value: impl Into<String>) -> Self {
        self.summary = Some(value.into());
        self
    }

    pub fn status(mut self, value: CombinedEntityStatus) -> Self {
        self.status = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CombinedEntity`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](CombinedEntityBuilder::id)
    /// - [`status`](CombinedEntityBuilder::status)
    pub fn build(self) -> Result<CombinedEntity, BuildError> {
        Ok(CombinedEntity {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name,
            summary: self.summary,
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
