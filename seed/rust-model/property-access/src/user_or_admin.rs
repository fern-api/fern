use crate::user::User;
use crate::admin::Admin;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UserOrAdmin {
        User(User),

        Admin(Admin),
}

impl UserOrAdmin {
    pub fn is_user(&self) -> bool {
        matches!(self, Self::User(_))
    }

    pub fn is_admin(&self) -> bool {
        matches!(self, Self::Admin(_))
    }


    pub fn as_user(&self) -> Option<&User> {
        match self {
                    Self::User(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_user(self) -> Option<User> {
        match self {
                    Self::User(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_admin(&self) -> Option<&Admin> {
        match self {
                    Self::Admin(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_admin(self) -> Option<Admin> {
        match self {
                    Self::Admin(value) => Some(value),
                    _ => None,
                }
    }

}
