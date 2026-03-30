pub use crate::prelude::*;

/// Admin user object
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Admin {
    #[serde(flatten)]
    pub user_fields: User,
    /// The level of admin privileges.
    #[serde(rename = "adminLevel")]
    #[serde(default)]
    pub admin_level: String,
}

impl Admin {
    pub fn builder() -> AdminBuilder {
        <AdminBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AdminBuilder {
    user_fields: Option<User>,
    admin_level: Option<String>,
}

impl AdminBuilder {
    pub fn user_fields(mut self, value: User) -> Self {
        self.user_fields = Some(value);
        self
    }

    pub fn admin_level(mut self, value: impl Into<String>) -> Self {
        self.admin_level = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Admin`].
    /// This method will fail if any of the following fields are not set:
    /// - [`user_fields`](AdminBuilder::user_fields)
    /// - [`admin_level`](AdminBuilder::admin_level)
    pub fn build(self) -> Result<Admin, BuildError> {
        Ok(Admin {
            user_fields: self.user_fields.ok_or_else(|| BuildError::missing_field("user_fields"))?,
            admin_level: self.admin_level.ok_or_else(|| BuildError::missing_field("admin_level"))?,
        })
    }
}
