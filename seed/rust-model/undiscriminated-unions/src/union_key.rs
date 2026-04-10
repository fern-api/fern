pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum Key {
        KeyType(KeyType),

        String(String),
}

impl Key {
    pub fn is_key_type(&self) -> bool {
        matches!(self, Self::KeyType(_))
    }

    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }


    pub fn as_key_type(&self) -> Option<&KeyType> {
        match self {
                    Self::KeyType(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_key_type(self) -> Option<KeyType> {
        match self {
                    Self::KeyType(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_string(&self) -> Option<&str> {
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
}
