pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserCreatedPayload {
    #[serde(rename = "userId")]
    #[serde(default)]
    pub user_id: String,
    #[serde(default)]
    pub email: String,
    #[serde(rename = "createdAt")]
    #[serde(default)]
    pub created_at: String,
}

impl UserCreatedPayload {
    pub fn builder() -> UserCreatedPayloadBuilder {
        UserCreatedPayloadBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserCreatedPayloadBuilder {
    user_id: Option<String>,
    email: Option<String>,
    created_at: Option<String>,
}

impl UserCreatedPayloadBuilder {
    pub fn user_id(mut self, value: impl Into<String>) -> Self {
        self.user_id = Some(value.into());
        self
    }

    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    pub fn created_at(mut self, value: impl Into<String>) -> Self {
        self.created_at = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UserCreatedPayload`].
    /// This method will fail if any of the following fields are not set:
    /// - [`user_id`](UserCreatedPayloadBuilder::user_id)
    /// - [`email`](UserCreatedPayloadBuilder::email)
    /// - [`created_at`](UserCreatedPayloadBuilder::created_at)
    pub fn build(self) -> Result<UserCreatedPayload, BuildError> {
        Ok(UserCreatedPayload {
            user_id: self.user_id.ok_or_else(|| BuildError::missing_field("user_id"))?,
            email: self.email.ok_or_else(|| BuildError::missing_field("email"))?,
            created_at: self.created_at.ok_or_else(|| BuildError::missing_field("created_at"))?,
        })
    }
}
