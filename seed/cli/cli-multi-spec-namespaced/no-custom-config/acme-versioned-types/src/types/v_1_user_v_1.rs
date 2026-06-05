pub use crate::prelude::*;
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserV1 {
    #[serde(default)]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
}

impl UserV1 {
    pub fn builder() -> UserV1Builder {
        <UserV1Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserV1Builder {
    id: Option<String>,
    email: Option<String>,
}

impl UserV1Builder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UserV1`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](UserV1Builder::id)
    pub fn build(self) -> Result<UserV1, BuildError> {
        Ok(UserV1 {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            email: self.email,
        })
    }
}
