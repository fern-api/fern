pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Organization {
    #[serde(default)]
    pub id: Id,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub users: Vec<User>,
}

impl Organization {
    pub fn builder() -> OrganizationBuilder {
        <OrganizationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct OrganizationBuilder {
    id: Option<Id>,
    name: Option<String>,
    users: Option<Vec<User>>,
}

impl OrganizationBuilder {
    pub fn id(mut self, value: Id) -> Self {
        self.id = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn users(mut self, value: Vec<User>) -> Self {
        self.users = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Organization`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](OrganizationBuilder::id)
    /// - [`name`](OrganizationBuilder::name)
    /// - [`users`](OrganizationBuilder::users)
    pub fn build(self) -> Result<Organization, BuildError> {
        Ok(Organization {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            users: self.users.ok_or_else(|| BuildError::missing_field("users"))?,
        })
    }
}
