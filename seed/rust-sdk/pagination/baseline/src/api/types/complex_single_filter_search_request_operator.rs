pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum SingleFilterSearchRequestOperator {
    Equals,
    NotEquals,
    In,
    NotIn,
    LessThan,
    GreaterThan,
    Contains,
    DoesNotContain,
    StartsWith,
    EndsWith,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for SingleFilterSearchRequestOperator {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Equals => serializer.serialize_str("="),
            Self::NotEquals => serializer.serialize_str("!="),
            Self::In => serializer.serialize_str("IN"),
            Self::NotIn => serializer.serialize_str("NIN"),
            Self::LessThan => serializer.serialize_str("<"),
            Self::GreaterThan => serializer.serialize_str(">"),
            Self::Contains => serializer.serialize_str("~"),
            Self::DoesNotContain => serializer.serialize_str("!~"),
            Self::StartsWith => serializer.serialize_str("^"),
            Self::EndsWith => serializer.serialize_str("$"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for SingleFilterSearchRequestOperator {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "=" => Ok(Self::Equals),
            "!=" => Ok(Self::NotEquals),
            "IN" => Ok(Self::In),
            "NIN" => Ok(Self::NotIn),
            "<" => Ok(Self::LessThan),
            ">" => Ok(Self::GreaterThan),
            "~" => Ok(Self::Contains),
            "!~" => Ok(Self::DoesNotContain),
            "^" => Ok(Self::StartsWith),
            "$" => Ok(Self::EndsWith),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for SingleFilterSearchRequestOperator {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Equals => write!(f, "="),
            Self::NotEquals => write!(f, "!="),
            Self::In => write!(f, "IN"),
            Self::NotIn => write!(f, "NIN"),
            Self::LessThan => write!(f, "<"),
            Self::GreaterThan => write!(f, ">"),
            Self::Contains => write!(f, "~"),
            Self::DoesNotContain => write!(f, "!~"),
            Self::StartsWith => write!(f, "^"),
            Self::EndsWith => write!(f, "$"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
