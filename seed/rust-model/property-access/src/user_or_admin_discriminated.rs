pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UserOrAdminDiscriminated {
        #[serde(rename = "user")]
        #[non_exhaustive]
        User {
            #[serde(flatten)]
            data: User,
            normal: String,
            foo: Foo,
        },

        #[serde(rename = "admin")]
        #[non_exhaustive]
        Admin {
            admin: Admin,
            normal: String,
            foo: Foo,
        },

        #[serde(rename = "empty")]
        #[non_exhaustive]
        Empty {},
}

impl UserOrAdminDiscriminated {
    pub fn user(data: User, normal: String, foo: Foo) -> Self {
        Self::User { data, normal, foo }
    }

    pub fn admin(admin: Admin, normal: String, foo: Foo) -> Self {
        Self::Admin { admin, normal, foo }
    }

    pub fn empty() -> Self {
        Self::Empty {}
    }

    pub fn get_normal(&self) -> &str {
        match self {
                    Self::User { normal, .. } => normal,
                    Self::Admin { normal, .. } => normal,
                    Self::Empty { normal, .. } => normal,
                }
    }

    pub fn get_foo(&self) -> &Foo {
        match self {
                    Self::User { foo, .. } => foo,
                    Self::Admin { foo, .. } => foo,
                    Self::Empty { foo, .. } => foo,
                }
    }
}
