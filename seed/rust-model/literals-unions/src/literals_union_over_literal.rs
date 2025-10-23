pub use crate::prelude::*;

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

impl fmt::Display for UnionOverLiteral {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::String(value) => write!(f, "{}", value),
            Self::LiteralString(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
