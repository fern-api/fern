use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum UndiscriminatedLiteral {
        String(String),

        Literal(String),

        Literal(String),

        Literal(bool),

        Literal(bool),

        Boolean(bool),
}

impl UndiscriminatedLiteral {
    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_literal(&self) -> bool {
        matches!(self, Self::Literal(_))
    }

    pub fn is_literal(&self) -> bool {
        matches!(self, Self::Literal(_))
    }

    pub fn is_literal(&self) -> bool {
        matches!(self, Self::Literal(_))
    }

    pub fn is_literal(&self) -> bool {
        matches!(self, Self::Literal(_))
    }

    pub fn is_boolean(&self) -> bool {
        matches!(self, Self::Boolean(_))
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

    pub fn as_literal(&self) -> Option<&bool> {
        match self {
                    Self::Literal(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_literal(self) -> Option<bool> {
        match self {
                    Self::Literal(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_literal(&self) -> Option<&bool> {
        match self {
                    Self::Literal(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_literal(self) -> Option<bool> {
        match self {
                    Self::Literal(value) => Some(value),
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
