pub use crate::prelude::*;

/// User profile object
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserProfile {
    /// The name of the user.
    #[serde(default)]
    pub name: String,
    /// User profile verification object
    #[serde(default)]
    pub verification: UserProfileVerification,
    /// The social security number of the user.
    #[serde(default)]
    pub ssn: String,
}

impl UserProfile {
    pub fn builder() -> UserProfileBuilder {
        UserProfileBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserProfileBuilder {
    name: Option<String>,
    verification: Option<UserProfileVerification>,
    ssn: Option<String>,
}

impl UserProfileBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn verification(mut self, value: UserProfileVerification) -> Self {
        self.verification = Some(value);
        self
    }

    pub fn ssn(mut self, value: impl Into<String>) -> Self {
        self.ssn = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UserProfile`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](UserProfileBuilder::name)
    /// - [`verification`](UserProfileBuilder::verification)
    /// - [`ssn`](UserProfileBuilder::ssn)
    pub fn build(self) -> Result<UserProfile, BuildError> {
        Ok(UserProfile {
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            verification: self
                .verification
                .ok_or_else(|| BuildError::missing_field("verification"))?,
            ssn: self.ssn.ok_or_else(|| BuildError::missing_field("ssn"))?,
        })
    }
}
