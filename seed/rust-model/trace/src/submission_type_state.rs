pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum SubmissionTypeState {
        SubmissionTypeStateZero(SubmissionTypeStateZero),

        SubmissionTypeStateOne(SubmissionTypeStateOne),
}

impl SubmissionTypeState {
    pub fn is_submission_type_state_zero(&self) -> bool {
        matches!(self, Self::SubmissionTypeStateZero(_))
    }

    pub fn is_submission_type_state_one(&self) -> bool {
        matches!(self, Self::SubmissionTypeStateOne(_))
    }


    pub fn as_submission_type_state_zero(&self) -> Option<&SubmissionTypeStateZero> {
        match self {
                    Self::SubmissionTypeStateZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_submission_type_state_zero(self) -> Option<SubmissionTypeStateZero> {
        match self {
                    Self::SubmissionTypeStateZero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_submission_type_state_one(&self) -> Option<&SubmissionTypeStateOne> {
        match self {
                    Self::SubmissionTypeStateOne(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_submission_type_state_one(self) -> Option<SubmissionTypeStateOne> {
        match self {
                    Self::SubmissionTypeStateOne(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for SubmissionTypeState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::SubmissionTypeStateZero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::SubmissionTypeStateOne(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
