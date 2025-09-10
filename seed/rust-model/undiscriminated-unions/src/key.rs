use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum Key {
        KeyType(KeyType),

        Literal(String),
}

impl Key {
    pub fn is_keytype(&self) -> bool {
        matches!(self, Self::KeyType(_))
    }

    pub fn is_literal(&self) -> bool {
        matches!(self, Self::Literal(_))
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

    pub fn as_literal(&self) -> Option<&String> {
        match self {
                    Self::Literal(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_literal(self) -> Option<String> {
        match self {
                    Self::Literal(value) => Some(value),
                    _ => None,
                }
    }

}
