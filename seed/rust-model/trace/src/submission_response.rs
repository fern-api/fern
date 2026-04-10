pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum SubmissionResponse {
        SubmissionResponseZero(SubmissionResponseZero),

        SubmissionResponseOne(SubmissionResponseOne),

        SubmissionResponseTwo(SubmissionResponseTwo),

        SubmissionResponseThree(SubmissionResponseThree),

        SubmissionResponseFour(SubmissionResponseFour),

        SubmissionResponseFive(SubmissionResponseFive),
}

impl SubmissionResponse {
    pub fn is_submission_response_zero(&self) -> bool {
        matches!(self, Self::SubmissionResponseZero(_))
    }

    pub fn is_submission_response_one(&self) -> bool {
        matches!(self, Self::SubmissionResponseOne(_))
    }

    pub fn is_submission_response_two(&self) -> bool {
        matches!(self, Self::SubmissionResponseTwo(_))
    }

    pub fn is_submission_response_three(&self) -> bool {
        matches!(self, Self::SubmissionResponseThree(_))
    }

    pub fn is_submission_response_four(&self) -> bool {
        matches!(self, Self::SubmissionResponseFour(_))
    }

    pub fn is_submission_response_five(&self) -> bool {
        matches!(self, Self::SubmissionResponseFive(_))
    }


    pub fn as_submission_response_zero(&self) -> Option<&SubmissionResponseZero> {
        match self {
                    Self::SubmissionResponseZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_submission_response_zero(self) -> Option<SubmissionResponseZero> {
        match self {
                    Self::SubmissionResponseZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_submission_response_one(&self) -> Option<&SubmissionResponseOne> {
        match self {
                    Self::SubmissionResponseOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_submission_response_one(self) -> Option<SubmissionResponseOne> {
        match self {
                    Self::SubmissionResponseOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_submission_response_two(&self) -> Option<&SubmissionResponseTwo> {
        match self {
                    Self::SubmissionResponseTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_submission_response_two(self) -> Option<SubmissionResponseTwo> {
        match self {
                    Self::SubmissionResponseTwo(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_submission_response_three(&self) -> Option<&SubmissionResponseThree> {
        match self {
                    Self::SubmissionResponseThree(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_submission_response_three(self) -> Option<SubmissionResponseThree> {
        match self {
                    Self::SubmissionResponseThree(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_submission_response_four(&self) -> Option<&SubmissionResponseFour> {
        match self {
                    Self::SubmissionResponseFour(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_submission_response_four(self) -> Option<SubmissionResponseFour> {
        match self {
                    Self::SubmissionResponseFour(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_submission_response_five(&self) -> Option<&SubmissionResponseFive> {
        match self {
                    Self::SubmissionResponseFive(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_submission_response_five(self) -> Option<SubmissionResponseFive> {
        match self {
                    Self::SubmissionResponseFive(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for SubmissionResponse {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::SubmissionResponseZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::SubmissionResponseOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::SubmissionResponseTwo(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::SubmissionResponseThree(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::SubmissionResponseFour(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::SubmissionResponseFive(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
