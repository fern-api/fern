pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum SubmissionRequest {
    SubmissionRequestZero(SubmissionRequestZero),

    SubmissionRequestType(SubmissionRequestType),

    SubmissionRequestTwo(SubmissionRequestTwo),

    SubmissionRequestThree(SubmissionRequestThree),

    SubmissionRequestFour(SubmissionRequestFour),
}

impl SubmissionRequest {
    pub fn is_submission_request_zero(&self) -> bool {
        matches!(self, Self::SubmissionRequestZero(_))
    }

    pub fn is_submission_request_type(&self) -> bool {
        matches!(self, Self::SubmissionRequestType(_))
    }

    pub fn is_submission_request_two(&self) -> bool {
        matches!(self, Self::SubmissionRequestTwo(_))
    }

    pub fn is_submission_request_three(&self) -> bool {
        matches!(self, Self::SubmissionRequestThree(_))
    }

    pub fn is_submission_request_four(&self) -> bool {
        matches!(self, Self::SubmissionRequestFour(_))
    }

    pub fn as_submission_request_zero(&self) -> Option<&SubmissionRequestZero> {
        match self {
            Self::SubmissionRequestZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_submission_request_zero(self) -> Option<SubmissionRequestZero> {
        match self {
            Self::SubmissionRequestZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_submission_request_type(&self) -> Option<&SubmissionRequestType> {
        match self {
            Self::SubmissionRequestType(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_submission_request_type(self) -> Option<SubmissionRequestType> {
        match self {
            Self::SubmissionRequestType(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_submission_request_two(&self) -> Option<&SubmissionRequestTwo> {
        match self {
            Self::SubmissionRequestTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_submission_request_two(self) -> Option<SubmissionRequestTwo> {
        match self {
            Self::SubmissionRequestTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_submission_request_three(&self) -> Option<&SubmissionRequestThree> {
        match self {
            Self::SubmissionRequestThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_submission_request_three(self) -> Option<SubmissionRequestThree> {
        match self {
            Self::SubmissionRequestThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_submission_request_four(&self) -> Option<&SubmissionRequestFour> {
        match self {
            Self::SubmissionRequestFour(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_submission_request_four(self) -> Option<SubmissionRequestFour> {
        match self {
            Self::SubmissionRequestFour(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for SubmissionRequest {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::SubmissionRequestZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::SubmissionRequestType(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::SubmissionRequestTwo(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::SubmissionRequestThree(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::SubmissionRequestFour(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
