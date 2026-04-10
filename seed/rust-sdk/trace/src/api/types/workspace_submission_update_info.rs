pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum WorkspaceSubmissionUpdateInfo {
    WorkspaceSubmissionUpdateInfoZero(WorkspaceSubmissionUpdateInfoZero),

    WorkspaceSubmissionUpdateInfoOne(WorkspaceSubmissionUpdateInfoOne),

    WorkspaceSubmissionUpdateInfoTwo(WorkspaceSubmissionUpdateInfoTwo),

    WorkspaceSubmissionUpdateInfoThree(WorkspaceSubmissionUpdateInfoThree),

    WorkspaceSubmissionUpdateInfoFour(WorkspaceSubmissionUpdateInfoFour),

    WorkspaceSubmissionUpdateInfoFive(WorkspaceSubmissionUpdateInfoFive),

    WorkspaceSubmissionUpdateInfoType(WorkspaceSubmissionUpdateInfoType),
}

impl WorkspaceSubmissionUpdateInfo {
    pub fn is_workspace_submission_update_info_zero(&self) -> bool {
        matches!(self, Self::WorkspaceSubmissionUpdateInfoZero(_))
    }

    pub fn is_workspace_submission_update_info_one(&self) -> bool {
        matches!(self, Self::WorkspaceSubmissionUpdateInfoOne(_))
    }

    pub fn is_workspace_submission_update_info_two(&self) -> bool {
        matches!(self, Self::WorkspaceSubmissionUpdateInfoTwo(_))
    }

    pub fn is_workspace_submission_update_info_three(&self) -> bool {
        matches!(self, Self::WorkspaceSubmissionUpdateInfoThree(_))
    }

    pub fn is_workspace_submission_update_info_four(&self) -> bool {
        matches!(self, Self::WorkspaceSubmissionUpdateInfoFour(_))
    }

    pub fn is_workspace_submission_update_info_five(&self) -> bool {
        matches!(self, Self::WorkspaceSubmissionUpdateInfoFive(_))
    }

    pub fn is_workspace_submission_update_info_type(&self) -> bool {
        matches!(self, Self::WorkspaceSubmissionUpdateInfoType(_))
    }

    pub fn as_workspace_submission_update_info_zero(
        &self,
    ) -> Option<&WorkspaceSubmissionUpdateInfoZero> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_workspace_submission_update_info_zero(
        self,
    ) -> Option<WorkspaceSubmissionUpdateInfoZero> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_workspace_submission_update_info_one(
        &self,
    ) -> Option<&WorkspaceSubmissionUpdateInfoOne> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_workspace_submission_update_info_one(
        self,
    ) -> Option<WorkspaceSubmissionUpdateInfoOne> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_workspace_submission_update_info_two(
        &self,
    ) -> Option<&WorkspaceSubmissionUpdateInfoTwo> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_workspace_submission_update_info_two(
        self,
    ) -> Option<WorkspaceSubmissionUpdateInfoTwo> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoTwo(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_workspace_submission_update_info_three(
        &self,
    ) -> Option<&WorkspaceSubmissionUpdateInfoThree> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_workspace_submission_update_info_three(
        self,
    ) -> Option<WorkspaceSubmissionUpdateInfoThree> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoThree(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_workspace_submission_update_info_four(
        &self,
    ) -> Option<&WorkspaceSubmissionUpdateInfoFour> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoFour(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_workspace_submission_update_info_four(
        self,
    ) -> Option<WorkspaceSubmissionUpdateInfoFour> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoFour(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_workspace_submission_update_info_five(
        &self,
    ) -> Option<&WorkspaceSubmissionUpdateInfoFive> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoFive(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_workspace_submission_update_info_five(
        self,
    ) -> Option<WorkspaceSubmissionUpdateInfoFive> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoFive(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_workspace_submission_update_info_type(
        &self,
    ) -> Option<&WorkspaceSubmissionUpdateInfoType> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoType(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_workspace_submission_update_info_type(
        self,
    ) -> Option<WorkspaceSubmissionUpdateInfoType> {
        match self {
            Self::WorkspaceSubmissionUpdateInfoType(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for WorkspaceSubmissionUpdateInfo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::WorkspaceSubmissionUpdateInfoZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::WorkspaceSubmissionUpdateInfoOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::WorkspaceSubmissionUpdateInfoTwo(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::WorkspaceSubmissionUpdateInfoThree(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::WorkspaceSubmissionUpdateInfoFour(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::WorkspaceSubmissionUpdateInfoFive(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::WorkspaceSubmissionUpdateInfoType(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
