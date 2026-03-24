pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NestedUser {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<User>,
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
    pub fn build(self) -> Result<NestedUser, BuildError> {
        Ok(NestedUser {
            name: self.name,
            user: self.user,
        })
    }
}
