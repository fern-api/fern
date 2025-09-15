use crate::literals_literal_string::LiteralString;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UnionOverLiteral {
        String(String),

        LiteralString(LiteralString),
}

impl UnionOverLiteral {
    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_literalstring(&self) -> bool {
        matches!(self, Self::LiteralString(_))
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

    pub fn as_literalstring(&self) -> Option<&LiteralString> {
        match self {
                    Self::LiteralString(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_literalstring(self) -> Option<LiteralString> {
        match self {
                    Self::LiteralString(value) => Some(value),
                    _ => None,
                }
    }

}
