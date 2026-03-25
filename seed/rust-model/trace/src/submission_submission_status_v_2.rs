pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionStatusV2 {
        #[serde(rename = "test")]
        #[non_exhaustive]
        Test {
            #[serde(default)]
            updates: Vec<TestSubmissionUpdate>,
            #[serde(rename = "problemId")]
            #[serde(default)]
            problem_id: ProblemId,
            #[serde(rename = "problemVersion")]
            #[serde(default)]
            problem_version: i64,
            #[serde(rename = "problemInfo")]
            problem_info: ProblemInfoV2,
        },

        #[serde(rename = "workspace")]
        #[non_exhaustive]
        Workspace {
            #[serde(default)]
            updates: Vec<WorkspaceSubmissionUpdate>,
        },
}

impl SubmissionStatusV2 {
    pub fn test(updates: Vec<TestSubmissionUpdate>, problem_id: ProblemId, problem_version: i64, problem_info: ProblemInfoV2) -> Self {
        Self::Test { updates, problem_id, problem_version, problem_info }
    }

    pub fn workspace(updates: Vec<WorkspaceSubmissionUpdate>) -> Self {
        Self::Workspace { updates }
    }
}
