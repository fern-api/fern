pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UnionWithReservedNames {
        Literal0(String),

        Literal1(String),

        String(String),
}

impl UnionWithReservedNames {
    pub fn is_literal0(&self) -> bool {
        matches!(self, Self::Literal0(_))
    }

    pub fn is_literal1(&self) -> bool {
        matches!(self, Self::Literal1(_))
    }

    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }


    pub fn as_literal0(&self) -> Option<&String> {
        match self {
                    Self::Literal0(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_literal0(self) -> Option<String> {
        match self {
                    Self::Literal0(value) => Some(value),
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

}
