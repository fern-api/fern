pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserV2 {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub profile: UserV2Profile,
}

impl UserV2 {
    pub fn builder() -> UserV2Builder {
        <UserV2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserV2Builder {
    id: Option<String>,
    profile: Option<UserV2Profile>,
}

impl UserV2Builder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn profile(mut self, value: UserV2Profile) -> Self {
        self.profile = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserV2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](UserV2Builder::id)
    /// - [`profile`](UserV2Builder::profile)
    pub fn build(self) -> Result<UserV2, BuildError> {
        Ok(UserV2 {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            profile: self
                .profile
                .ok_or_else(|| BuildError::missing_field("profile"))?,
        })
    }
}
