pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserOrAdminDiscriminatedTwo {
    pub r#type: UserOrAdminDiscriminatedTwoType,
}

impl UserOrAdminDiscriminatedTwo {
    pub fn builder() -> UserOrAdminDiscriminatedTwoBuilder {
        <UserOrAdminDiscriminatedTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserOrAdminDiscriminatedTwoBuilder {
    r#type: Option<UserOrAdminDiscriminatedTwoType>,
}

impl UserOrAdminDiscriminatedTwoBuilder {
    pub fn r#type(mut self, value: UserOrAdminDiscriminatedTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserOrAdminDiscriminatedTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](UserOrAdminDiscriminatedTwoBuilder::r#type)
    pub fn build(self) -> Result<UserOrAdminDiscriminatedTwo, BuildError> {
        Ok(UserOrAdminDiscriminatedTwo {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
