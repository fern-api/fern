use crate::user::User;
use crate::admin::Admin;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UserOrAdminDiscriminated {
        User {
            #[serde(flatten)]
            data: User,
            normal: String,
            foo: Foo,
        },

        Admin {
            admin: Admin,
            normal: String,
            foo: Foo,
        },

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
