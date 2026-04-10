pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum Key {
        KeyType(KeyType),

        KeyOne(KeyOne),
}

impl Key {
    pub fn is_key_type(&self) -> bool {
        matches!(self, Self::KeyType(_))
    }

    pub fn is_key_one(&self) -> bool {
        matches!(self, Self::KeyOne(_))
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

    pub fn as_key_one(&self) -> Option<&KeyOne> {
        match self {
                    Self::KeyOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_key_one(self) -> Option<KeyOne> {
        match self {
                    Self::KeyOne(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for Key {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::KeyType(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::KeyOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
