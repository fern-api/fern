pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserOrAdminDiscriminatedZero {
    #[serde(flatten)]
    pub user_fields: User,
    pub r#type: UserOrAdminDiscriminatedZeroType,
}

impl UserOrAdminDiscriminatedZero {
    pub fn builder() -> UserOrAdminDiscriminatedZeroBuilder {
        <UserOrAdminDiscriminatedZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserOrAdminDiscriminatedZeroBuilder {
    user_fields: Option<User>,
    r#type: Option<UserOrAdminDiscriminatedZeroType>,
}

impl UserOrAdminDiscriminatedZeroBuilder {
    pub fn user_fields(mut self, value: User) -> Self {
        self.user_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: UserOrAdminDiscriminatedZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserOrAdminDiscriminatedZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`user_fields`](UserOrAdminDiscriminatedZeroBuilder::user_fields)
    /// - [`r#type`](UserOrAdminDiscriminatedZeroBuilder::r#type)
    pub fn build(self) -> Result<UserOrAdminDiscriminatedZero, BuildError> {
        Ok(UserOrAdminDiscriminatedZero {
            user_fields: self.user_fields.ok_or_else(|| BuildError::missing_field("user_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
