use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UndiscriminatedLiteral {
        String(String),

        Literal1(String),

        Literal2(String),

        Literal3(bool),

        Literal4(bool),

        Boolean(bool),
}

impl UndiscriminatedLiteral {
    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_literal1(&self) -> bool {
        matches!(self, Self::Literal1(_))
    }

    pub fn is_literal2(&self) -> bool {
        matches!(self, Self::Literal2(_))
    }

    pub fn is_literal3(&self) -> bool {
        matches!(self, Self::Literal3(_))
    }

    pub fn is_literal4(&self) -> bool {
        matches!(self, Self::Literal4(_))
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

    pub fn as_literal2(&self) -> Option<&String> {
        match self {
                    Self::Literal2(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_literal2(self) -> Option<String> {
        match self {
                    Self::Literal2(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_literal3(&self) -> Option<&bool> {
        match self {
                    Self::Literal3(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_literal3(self) -> Option<bool> {
        match self {
                    Self::Literal3(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_literal4(&self) -> Option<&bool> {
        match self {
                    Self::Literal4(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_literal4(self) -> Option<bool> {
        match self {
                    Self::Literal4(value) => Some(value),
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
