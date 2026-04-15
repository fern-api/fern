pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Organization {
    #[serde(default)]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<OrganizationMetadata>,
    #[serde(default)]
    pub name: String,
}

impl Organization {
    pub fn builder() -> OrganizationBuilder {
        <OrganizationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct OrganizationBuilder {
    id: Option<String>,
    metadata: Option<OrganizationMetadata>,
    name: Option<String>,
}

impl OrganizationBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn metadata(mut self, value: OrganizationMetadata) -> Self {
        self.metadata = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Organization`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](OrganizationBuilder::id)
    /// - [`name`](OrganizationBuilder::name)
    pub fn build(self) -> Result<Organization, BuildError> {
        Ok(Organization {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            metadata: self.metadata,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
