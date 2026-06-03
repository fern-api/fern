pub use crate::prelude::*;

/// Execution environment for a rule.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum RuleExecutionContext {
    Prod,
    Staging,
    Dev,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for RuleExecutionContext {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Prod => serializer.serialize_str("prod"),
            Self::Staging => serializer.serialize_str("staging"),
            Self::Dev => serializer.serialize_str("dev"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for RuleExecutionContext {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "prod" => Ok(Self::Prod),
            "staging" => Ok(Self::Staging),
            "dev" => Ok(Self::Dev),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for RuleExecutionContext {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Prod => write!(f, "prod"),
            Self::Staging => write!(f, "staging"),
            Self::Dev => write!(f, "dev"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
