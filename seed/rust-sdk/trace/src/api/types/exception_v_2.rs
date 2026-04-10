pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum ExceptionV2 {
    ExceptionV2Zero(ExceptionV2Zero),

    ExceptionV2Type(ExceptionV2Type),
}

impl ExceptionV2 {
    pub fn is_exception_v2zero(&self) -> bool {
        matches!(self, Self::ExceptionV2Zero(_))
    }

    pub fn is_exception_v2type(&self) -> bool {
        matches!(self, Self::ExceptionV2Type(_))
    }

    pub fn as_exception_v2zero(&self) -> Option<&ExceptionV2Zero> {
        match self {
            Self::ExceptionV2Zero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_exception_v2zero(self) -> Option<ExceptionV2Zero> {
        match self {
            Self::ExceptionV2Zero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_exception_v2type(&self) -> Option<&ExceptionV2Type> {
        match self {
            Self::ExceptionV2Type(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_exception_v2type(self) -> Option<ExceptionV2Type> {
        match self {
            Self::ExceptionV2Type(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for ExceptionV2 {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::ExceptionV2Zero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::ExceptionV2Type(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
