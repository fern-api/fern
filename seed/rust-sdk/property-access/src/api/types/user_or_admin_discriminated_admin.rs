pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserOrAdminDiscriminatedAdmin {
    pub r#type: UserOrAdminDiscriminatedAdminType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub admin: Option<Admin>,
}

impl UserOrAdminDiscriminatedAdmin {
    pub fn builder() -> UserOrAdminDiscriminatedAdminBuilder {
        <UserOrAdminDiscriminatedAdminBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UserOrAdminDiscriminatedAdminBuilder {
    r#type: Option<UserOrAdminDiscriminatedAdminType>,
    admin: Option<Admin>,
}

impl UserOrAdminDiscriminatedAdminBuilder {
    pub fn r#type(mut self, value: UserOrAdminDiscriminatedAdminType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn admin(mut self, value: Admin) -> Self {
        self.admin = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UserOrAdminDiscriminatedAdmin`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](UserOrAdminDiscriminatedAdminBuilder::r#type)
    pub fn build(self) -> Result<UserOrAdminDiscriminatedAdmin, BuildError> {
        Ok(UserOrAdminDiscriminatedAdmin {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            admin: self.admin,
        })
    }
}
