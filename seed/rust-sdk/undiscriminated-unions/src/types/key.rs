use crate::key_type::KeyType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum Key {
        KeyType(KeyType),

        Literal1(String),
}

impl Key {
    pub fn is_keytype(&self) -> bool {
        matches!(self, Self::KeyType(_))
    }

    pub fn is_literal1(&self) -> bool {
        matches!(self, Self::Literal1(_))
    }


    pub fn as_keytype(&self) -> Option<&KeyType> {
        match self {
                    Self::KeyType(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_keytype(self) -> Option<KeyType> {
        match self {
                    Self::KeyType(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_literal1(&self) -> Option<&String> {
        match self {
                    Self::Literal1(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_literal1(self) -> Option<String> {
        match self {
                    Self::Literal1(value) => Some(value),
                    _ => None,
                }
    }

}
