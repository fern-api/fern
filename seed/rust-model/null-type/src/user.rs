pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct User {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    /// Always null for active users.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub deleted_at: Option<serde_json::Value>,
}

impl User {
    pub fn builder() -> UserBuilder {
        <UserBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserBuilder {
    id: Option<String>,
    name: Option<String>,
    deleted_at: Option<serde_json::Value>,
}

impl UserBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn deleted_at(mut self, value: serde_json::Value) -> Self {
        self.deleted_at = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`User`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](UserBuilder::id)
    /// - [`name`](UserBuilder::name)
    pub fn build(self) -> Result<User, BuildError> {
        Ok(User {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            deleted_at: self.deleted_at,
        })
    }
}
