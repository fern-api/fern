pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum Exception {
        ExceptionZero(ExceptionZero),

        ExceptionType(ExceptionType),
}

impl Exception {
    pub fn is_exception_zero(&self) -> bool {
        matches!(self, Self::ExceptionZero(_))
    }

    pub fn is_exception_type(&self) -> bool {
        matches!(self, Self::ExceptionType(_))
    }


    pub fn as_exception_zero(&self) -> Option<&ExceptionZero> {
        match self {
                    Self::ExceptionZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_exception_zero(self) -> Option<ExceptionZero> {
        match self {
                    Self::ExceptionZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_exception_type(&self) -> Option<&ExceptionType> {
        match self {
                    Self::ExceptionType(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_exception_type(self) -> Option<ExceptionType> {
        match self {
                    Self::ExceptionType(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for Exception {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::ExceptionZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::ExceptionType(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
