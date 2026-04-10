pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum InvalidRequestCause {
        InvalidRequestCauseZero(InvalidRequestCauseZero),

        InvalidRequestCauseOne(InvalidRequestCauseOne),

        InvalidRequestCauseTwo(InvalidRequestCauseTwo),
}

impl InvalidRequestCause {
    pub fn is_invalid_request_cause_zero(&self) -> bool {
        matches!(self, Self::InvalidRequestCauseZero(_))
    }

    pub fn is_invalid_request_cause_one(&self) -> bool {
        matches!(self, Self::InvalidRequestCauseOne(_))
    }

    pub fn is_invalid_request_cause_two(&self) -> bool {
        matches!(self, Self::InvalidRequestCauseTwo(_))
    }


    pub fn as_invalid_request_cause_zero(&self) -> Option<&InvalidRequestCauseZero> {
        match self {
                    Self::InvalidRequestCauseZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_invalid_request_cause_zero(self) -> Option<InvalidRequestCauseZero> {
        match self {
                    Self::InvalidRequestCauseZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_invalid_request_cause_one(&self) -> Option<&InvalidRequestCauseOne> {
        match self {
                    Self::InvalidRequestCauseOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_invalid_request_cause_one(self) -> Option<InvalidRequestCauseOne> {
        match self {
                    Self::InvalidRequestCauseOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_invalid_request_cause_two(&self) -> Option<&InvalidRequestCauseTwo> {
        match self {
                    Self::InvalidRequestCauseTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_invalid_request_cause_two(self) -> Option<InvalidRequestCauseTwo> {
        match self {
                    Self::InvalidRequestCauseTwo(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for InvalidRequestCause {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidRequestCauseZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::InvalidRequestCauseOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::InvalidRequestCauseTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
