pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct BaseOrg {
    #[serde(default)]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<BaseOrgMetadata>,
}

impl BaseOrg {
    pub fn builder() -> BaseOrgBuilder {
        <BaseOrgBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct BaseOrgBuilder {
    id: Option<String>,
    metadata: Option<BaseOrgMetadata>,
}

impl BaseOrgBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn metadata(mut self, value: BaseOrgMetadata) -> Self {
        self.metadata = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`BaseOrg`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](BaseOrgBuilder::id)
    pub fn build(self) -> Result<BaseOrg, BuildError> {
        Ok(BaseOrg {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            metadata: self.metadata,
        })
    }
}
