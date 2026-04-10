pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum WorkspaceSubmissionStatus {
    WorkspaceSubmissionStatusZero(WorkspaceSubmissionStatusZero),

    WorkspaceSubmissionStatusOne(WorkspaceSubmissionStatusOne),

    WorkspaceSubmissionStatusType(WorkspaceSubmissionStatusType),

    WorkspaceSubmissionStatusThree(WorkspaceSubmissionStatusThree),

    WorkspaceSubmissionStatusFour(WorkspaceSubmissionStatusFour),
}

impl WorkspaceSubmissionStatus {
    pub fn is_workspace_submission_status_zero(&self) -> bool {
        matches!(self, Self::WorkspaceSubmissionStatusZero(_))
    }

    pub fn is_workspace_submission_status_one(&self) -> bool {
        matches!(self, Self::WorkspaceSubmissionStatusOne(_))
    }

    pub fn is_workspace_submission_status_type(&self) -> bool {
        matches!(self, Self::WorkspaceSubmissionStatusType(_))
    }

    pub fn is_workspace_submission_status_three(&self) -> bool {
        matches!(self, Self::WorkspaceSubmissionStatusThree(_))
    }

    pub fn is_workspace_submission_status_four(&self) -> bool {
        matches!(self, Self::WorkspaceSubmissionStatusFour(_))
    }

    pub fn as_workspace_submission_status_zero(&self) -> Option<&WorkspaceSubmissionStatusZero> {
        match self {
            Self::WorkspaceSubmissionStatusZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_workspace_submission_status_zero(self) -> Option<WorkspaceSubmissionStatusZero> {
        match self {
            Self::WorkspaceSubmissionStatusZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_workspace_submission_status_one(&self) -> Option<&WorkspaceSubmissionStatusOne> {
        match self {
            Self::WorkspaceSubmissionStatusOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_workspace_submission_status_one(self) -> Option<WorkspaceSubmissionStatusOne> {
        match self {
            Self::WorkspaceSubmissionStatusOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_workspace_submission_status_type(&self) -> Option<&WorkspaceSubmissionStatusType> {
        match self {
            Self::WorkspaceSubmissionStatusType(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_workspace_submission_status_type(self) -> Option<WorkspaceSubmissionStatusType> {
        match self {
            Self::WorkspaceSubmissionStatusType(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_workspace_submission_status_three(&self) -> Option<&WorkspaceSubmissionStatusThree> {
        match self {
            Self::WorkspaceSubmissionStatusThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_workspace_submission_status_three(self) -> Option<WorkspaceSubmissionStatusThree> {
        match self {
            Self::WorkspaceSubmissionStatusThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_workspace_submission_status_four(&self) -> Option<&WorkspaceSubmissionStatusFour> {
        match self {
            Self::WorkspaceSubmissionStatusFour(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_workspace_submission_status_four(self) -> Option<WorkspaceSubmissionStatusFour> {
        match self {
            Self::WorkspaceSubmissionStatusFour(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for WorkspaceSubmissionStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::WorkspaceSubmissionStatusZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::WorkspaceSubmissionStatusOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::WorkspaceSubmissionStatusType(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::WorkspaceSubmissionStatusThree(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::WorkspaceSubmissionStatusFour(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
