pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Organization {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub tags: Vec<String>,
}

impl Organization {
    pub fn builder() -> OrganizationBuilder {
        <OrganizationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct OrganizationBuilder {
    name: Option<String>,
    tags: Option<Vec<String>>,
}

impl OrganizationBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn tags(mut self, value: Vec<String>) -> Self {
        self.tags = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Organization`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](OrganizationBuilder::name)
    /// - [`tags`](OrganizationBuilder::tags)
    pub fn build(self) -> Result<Organization, BuildError> {
        Ok(Organization {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            tags: self.tags.ok_or_else(|| BuildError::missing_field("tags"))?,
        })
    }
}
