pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
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

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl SubmissionStatusV2 {
    pub fn test(
        updates: Vec<TestSubmissionUpdate>,
        problem_id: ProblemId,
        problem_version: i64,
        problem_info: ProblemInfoV2,
    ) -> Self {
        Self::Test {
            updates,
            problem_id,
            problem_version,
            problem_info,
        }
    }

    pub fn workspace(updates: Vec<WorkspaceSubmissionUpdate>) -> Self {
        Self::Workspace { updates }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
