pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NestedUser {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub user: User,
}

impl NestedUser {
    pub fn builder() -> NestedUserBuilder {
        NestedUserBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NestedUserBuilder {
    name: Option<String>,
    user: Option<User>,
}

impl NestedUserBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn user(mut self, value: User) -> Self {
        self.user = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NestedUser`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](NestedUserBuilder::name)
    /// - [`user`](NestedUserBuilder::user)
    pub fn build(self) -> Result<NestedUser, BuildError> {
        Ok(NestedUser {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            user: self.user.ok_or_else(|| BuildError::missing_field("user"))?,
        })
    }
}
