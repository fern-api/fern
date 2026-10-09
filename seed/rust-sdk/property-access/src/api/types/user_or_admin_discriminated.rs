pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
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

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
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

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }

    pub fn get_normal(&self) -> &str {
        match self {
            Self::User { normal, .. } => normal,
            Self::Admin { normal, .. } => normal,
            Self::Empty { normal, .. } => normal,
            Self::__Unknown(_) => panic!(
                "get_normal() called on __Unknown variant; inspect the raw JSON value directly"
            ),
        }
    }

    pub fn get_foo(&self) -> &Foo {
        match self {
            Self::User { foo, .. } => foo,
            Self::Admin { foo, .. } => foo,
            Self::Empty { foo, .. } => foo,
            Self::__Unknown(_) => {
                panic!("get_foo() called on __Unknown variant; inspect the raw JSON value directly")
            }
        }
    }
}
