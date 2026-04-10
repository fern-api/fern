pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UndiscriminatedLiteral {
        String(String),

        UndiscriminatedLiteralOne(UndiscriminatedLiteralOne),

        UndiscriminatedLiteralTwo(UndiscriminatedLiteralTwo),

        Boolean(bool),
}

impl UndiscriminatedLiteral {
    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_undiscriminated_literal_one(&self) -> bool {
        matches!(self, Self::UndiscriminatedLiteralOne(_))
    }

    pub fn is_undiscriminated_literal_two(&self) -> bool {
        matches!(self, Self::UndiscriminatedLiteralTwo(_))
    }

    pub fn is_boolean(&self) -> bool {
        matches!(self, Self::Boolean(_))
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

    pub fn as_undiscriminated_literal_one(&self) -> Option<&UndiscriminatedLiteralOne> {
        match self {
                    Self::UndiscriminatedLiteralOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_undiscriminated_literal_one(self) -> Option<UndiscriminatedLiteralOne> {
        match self {
                    Self::UndiscriminatedLiteralOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_undiscriminated_literal_two(&self) -> Option<&UndiscriminatedLiteralTwo> {
        match self {
                    Self::UndiscriminatedLiteralTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_undiscriminated_literal_two(self) -> Option<UndiscriminatedLiteralTwo> {
        match self {
                    Self::UndiscriminatedLiteralTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_boolean(&self) -> Option<&bool> {
        match self {
                    Self::Boolean(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_boolean(self) -> Option<bool> {
        match self {
                    Self::Boolean(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for UndiscriminatedLiteral {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::String(value) => write!(f, "{}", value),
            Self::UndiscriminatedLiteralOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::UndiscriminatedLiteralTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::Boolean(value) => write!(f, "{}", value),
        }
    }
}
