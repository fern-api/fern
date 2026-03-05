pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum SearchRequestNeighborRequired {
    User(User),

    NestedUser(NestedUser),

    String(String),

    Integer(i64),
}

impl SearchRequestNeighborRequired {
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

    pub fn as_integer(&self) -> Option<&i64> {
        match self {
            Self::Integer(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_integer(self) -> Option<i64> {
        match self {
            Self::Integer(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for SearchRequestNeighborRequired {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::User(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::NestedUser(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::String(value) => write!(f, "{}", value),
            Self::Integer(value) => write!(f, "{}", value),
        }
    }
}
