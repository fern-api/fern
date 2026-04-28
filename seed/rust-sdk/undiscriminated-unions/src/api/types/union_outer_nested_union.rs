pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum OuterNestedUnion {
    String(String),

    WrapperObject(WrapperObject),
}

impl OuterNestedUnion {
    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_wrapper_object(&self) -> bool {
        matches!(self, Self::WrapperObject(_))
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

    pub fn as_wrapper_object(&self) -> Option<&WrapperObject> {
        match self {
            Self::WrapperObject(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_wrapper_object(self) -> Option<WrapperObject> {
        match self {
            Self::WrapperObject(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for OuterNestedUnion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::String(value) => write!(f, "{}", value),
            Self::WrapperObject(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
