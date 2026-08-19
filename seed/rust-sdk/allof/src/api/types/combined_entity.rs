pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CombinedEntity {
    pub status: CombinedEntityStatus,
    /// Unique identifier.
    #[serde(default)]
    pub id: String,
    /// Display name from Identifiable.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// A short summary.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
}

impl CombinedEntity {
    pub fn builder() -> CombinedEntityBuilder {
        <CombinedEntityBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CombinedEntityBuilder {
    status: Option<CombinedEntityStatus>,
    id: Option<String>,
    name: Option<String>,
    summary: Option<String>,
}

impl CombinedEntityBuilder {
    pub fn status(mut self, value: CombinedEntityStatus) -> Self {
        self.status = Some(value);
        self
    }

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

    /// Consumes the builder and constructs a [`CombinedEntity`].
    /// This method will fail if any of the following fields are not set:
    /// - [`status`](CombinedEntityBuilder::status)
    /// - [`id`](CombinedEntityBuilder::id)
    pub fn build(self) -> Result<CombinedEntity, BuildError> {
        Ok(CombinedEntity {
            status: self
                .status
                .ok_or_else(|| BuildError::missing_field("status"))?,
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name,
            summary: self.summary,
        })
    }
}
