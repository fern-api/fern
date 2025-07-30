use crate::user::User;
use crate::nested_user::NestedUser;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum SearchRequestNeighbor {
        User(User),

        NestedUser(NestedUser),

        String(String),

        Integer(i32),
}

impl SearchRequestNeighbor {
    pub fn is_user(&self) -> bool {
        matches!(self, Self::User(_))
    }

    pub fn is_nesteduser(&self) -> bool {
        matches!(self, Self::NestedUser(_))
    }

    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_integer(&self) -> bool {
        matches!(self, Self::Integer(_))
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

    pub fn as_nesteduser(&self) -> Option<&NestedUser> {
        match self {
                    Self::NestedUser(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_nesteduser(self) -> Option<NestedUser> {
        match self {
                    Self::NestedUser(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_string(&self) -> Option<&String> {
        match self {
                    Self::String(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_string(self) -> Option<String> {
        match self {
                    Self::String(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_integer(&self) -> Option<&i32> {
        match self {
                    Self::Integer(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_integer(self) -> Option<i32> {
        match self {
                    Self::Integer(value) => Some(value),
                    _ => None,
                }
    }

}
