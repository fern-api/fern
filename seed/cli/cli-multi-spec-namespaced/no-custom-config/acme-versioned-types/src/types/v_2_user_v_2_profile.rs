pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserV2Profile {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    #[serde(rename = "displayName")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
}

impl UserV2Profile {
    pub fn builder() -> UserV2ProfileBuilder {
        <UserV2ProfileBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserV2ProfileBuilder {
    email: Option<String>,
    display_name: Option<String>,
}

impl UserV2ProfileBuilder {
    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    pub fn display_name(mut self, value: impl Into<String>) -> Self {
        self.display_name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UserV2Profile`].
    pub fn build(self) -> Result<UserV2Profile, BuildError> {
        Ok(UserV2Profile {
            email: self.email,
            display_name: self.display_name,
        })
    }
}
