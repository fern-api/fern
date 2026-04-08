pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct NestedUser {
    #[serde(rename = "Name")]
    #[serde(default)]
    pub name: String,
    #[serde(rename = "NestedUser")]
    #[serde(default)]
    pub nested_user: User,
}

impl NestedUser {
    pub fn builder() -> NestedUserBuilder {
        <NestedUserBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct NestedUserBuilder {
    name: Option<String>,
    nested_user: Option<User>,
}

impl NestedUserBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn nested_user(mut self, value: User) -> Self {
        self.nested_user = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`NestedUser`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](NestedUserBuilder::name)
    /// - [`nested_user`](NestedUserBuilder::nested_user)
    pub fn build(self) -> Result<NestedUser, BuildError> {
        Ok(NestedUser {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            nested_user: self.nested_user.ok_or_else(|| BuildError::missing_field("nested_user"))?,
        })
    }
}
