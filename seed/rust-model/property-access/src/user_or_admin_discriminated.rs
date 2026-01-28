pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UserOrAdminDiscriminated {
        #[serde(rename = "user")]
        User {
            #[serde(flatten)]
            data: User,
            normal: String,
            foo: Foo,
        },

        #[serde(rename = "admin")]
        Admin {
            admin: Admin,
            normal: String,
            foo: Foo,
        },

        #[serde(rename = "empty")]
        Empty,
}

impl UserOrAdminDiscriminated {
    pub fn get_normal(&self) -> &String {
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
