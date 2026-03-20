pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UnionWithTypeAliases {
    String(String),

    UserId(UserId),

    Name(Name),
}

impl UnionWithTypeAliases {
    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_userid(&self) -> bool {
        matches!(self, Self::UserId(_))
    }

    pub fn is_name(&self) -> bool {
        matches!(self, Self::Name(_))
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

    pub fn as_userid(&self) -> Option<&UserId> {
        match self {
            Self::UserId(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_userid(self) -> Option<UserId> {
        match self {
            Self::UserId(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_name(&self) -> Option<&Name> {
        match self {
            Self::Name(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_name(self) -> Option<Name> {
        match self {
            Self::Name(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for UnionWithTypeAliases {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::String(value) => write!(f, "{}", value),
            Self::UserId(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::Name(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
