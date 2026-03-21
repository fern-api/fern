pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Organization {
    #[serde(default)]
    pub name: String,
}

impl Organization {
    pub fn builder() -> OrganizationBuilder {
        OrganizationBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct OrganizationBuilder {
    name: Option<String>,
}

impl OrganizationBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Organization`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](OrganizationBuilder::name)
    pub fn build(self) -> Result<Organization, BuildError> {
        Ok(Organization {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
