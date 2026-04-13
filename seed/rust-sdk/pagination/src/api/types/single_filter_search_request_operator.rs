pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum SingleFilterSearchRequestOperator {
    EqualTo,
    NotEquals,
    In,
    Nin,
    LessThan,
    GreaterThan,
    Tilde,
    NotTilde,
    Caret,
    Dollar,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for SingleFilterSearchRequestOperator {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::EqualTo => serializer.serialize_str("="),
            Self::NotEquals => serializer.serialize_str("!="),
            Self::In => serializer.serialize_str("IN"),
            Self::Nin => serializer.serialize_str("NIN"),
            Self::LessThan => serializer.serialize_str("<"),
            Self::GreaterThan => serializer.serialize_str(">"),
            Self::Tilde => serializer.serialize_str("~"),
            Self::NotTilde => serializer.serialize_str("!~"),
            Self::Caret => serializer.serialize_str("^"),
            Self::Dollar => serializer.serialize_str("$"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for SingleFilterSearchRequestOperator {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "=" => Ok(Self::EqualTo),
            "!=" => Ok(Self::NotEquals),
            "IN" => Ok(Self::In),
            "NIN" => Ok(Self::Nin),
            "<" => Ok(Self::LessThan),
            ">" => Ok(Self::GreaterThan),
            "~" => Ok(Self::Tilde),
            "!~" => Ok(Self::NotTilde),
            "^" => Ok(Self::Caret),
            "$" => Ok(Self::Dollar),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for SingleFilterSearchRequestOperator {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::EqualTo => write!(f, "="),
            Self::NotEquals => write!(f, "!="),
            Self::In => write!(f, "IN"),
            Self::Nin => write!(f, "NIN"),
            Self::LessThan => write!(f, "<"),
            Self::GreaterThan => write!(f, ">"),
            Self::Tilde => write!(f, "~"),
            Self::NotTilde => write!(f, "!~"),
            Self::Caret => write!(f, "^"),
            Self::Dollar => write!(f, "$"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
