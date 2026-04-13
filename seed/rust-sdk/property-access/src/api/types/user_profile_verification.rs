pub use crate::prelude::*;

/// User profile verification object
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserProfileVerification {
    /// User profile verification status
    #[serde(skip_serializing_if = "Option::is_none")]
    pub verified: Option<String>,
}

impl UserProfileVerification {
    pub fn builder() -> UserProfileVerificationBuilder {
        <UserProfileVerificationBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserProfileVerificationBuilder {
    verified: Option<String>,
}

impl UserProfileVerificationBuilder {
    pub fn verified(mut self, value: impl Into<String>) -> Self {
        self.verified = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UserProfileVerification`].
    pub fn build(self) -> Result<UserProfileVerification, BuildError> {
        Ok(UserProfileVerification {
            verified: self.verified,
        })
    }
}
