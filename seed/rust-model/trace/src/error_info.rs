pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum ErrorInfo {
        ErrorInfoZero(ErrorInfoZero),

        ErrorInfoOne(ErrorInfoOne),

        ErrorInfoTwo(ErrorInfoTwo),
}

impl ErrorInfo {
    pub fn is_error_info_zero(&self) -> bool {
        matches!(self, Self::ErrorInfoZero(_))
    }

    pub fn is_error_info_one(&self) -> bool {
        matches!(self, Self::ErrorInfoOne(_))
    }

    pub fn is_error_info_two(&self) -> bool {
        matches!(self, Self::ErrorInfoTwo(_))
    }


    pub fn as_error_info_zero(&self) -> Option<&ErrorInfoZero> {
        match self {
                    Self::ErrorInfoZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_error_info_zero(self) -> Option<ErrorInfoZero> {
        match self {
                    Self::ErrorInfoZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_error_info_one(&self) -> Option<&ErrorInfoOne> {
        match self {
                    Self::ErrorInfoOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_error_info_one(self) -> Option<ErrorInfoOne> {
        match self {
                    Self::ErrorInfoOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_error_info_two(&self) -> Option<&ErrorInfoTwo> {
        match self {
                    Self::ErrorInfoTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_error_info_two(self) -> Option<ErrorInfoTwo> {
        match self {
                    Self::ErrorInfoTwo(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for ErrorInfo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::ErrorInfoZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::ErrorInfoOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::ErrorInfoTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
