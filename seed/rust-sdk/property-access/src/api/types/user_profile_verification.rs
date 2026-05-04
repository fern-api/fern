pub use crate::prelude::*;

/// User profile verification object
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UserProfileVerification {
    /// User profile verification status
    #[serde(default)]
    pub verified: String,
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
    /// This method will fail if any of the following fields are not set:
    /// - [`verified`](UserProfileVerificationBuilder::verified)
    pub fn build(self) -> Result<UserProfileVerification, BuildError> {
        Ok(UserProfileVerification {
            verified: self
                .verified
                .ok_or_else(|| BuildError::missing_field("verified"))?,
        })
    }
}
