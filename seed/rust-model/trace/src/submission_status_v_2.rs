pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum SubmissionStatusV2 {
        SubmissionStatusV2Zero(SubmissionStatusV2Zero),

        SubmissionStatusV2One(SubmissionStatusV2One),
}

impl SubmissionStatusV2 {
    pub fn is_submission_status_v2zero(&self) -> bool {
        matches!(self, Self::SubmissionStatusV2Zero(_))
    }

    pub fn is_submission_status_v2one(&self) -> bool {
        matches!(self, Self::SubmissionStatusV2One(_))
    }


    pub fn as_submission_status_v2zero(&self) -> Option<&SubmissionStatusV2Zero> {
        match self {
                    Self::SubmissionStatusV2Zero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_submission_status_v2zero(self) -> Option<SubmissionStatusV2Zero> {
        match self {
                    Self::SubmissionStatusV2Zero(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_submission_status_v2one(&self) -> Option<&SubmissionStatusV2One> {
        match self {
                    Self::SubmissionStatusV2One(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_submission_status_v2one(self) -> Option<SubmissionStatusV2One> {
        match self {
                    Self::SubmissionStatusV2One(value) => Some(value),
                    _ => None,
                }
    }
}

impl fmt::Display for SubmissionStatusV2 {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::SubmissionStatusV2Zero(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
            Self::SubmissionStatusV2One(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),
        }
    }
}
