pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum SubmissionRequest {
    #[serde(rename = "initializeProblemRequest")]
    #[non_exhaustive]
    InitializeProblemRequest {
        #[serde(rename = "problemId")]
        #[serde(default)]
        problem_id: ProblemId,
        #[serde(rename = "problemVersion")]
        #[serde(skip_serializing_if = "Option::is_none")]
        problem_version: Option<i64>,
    },

    #[serde(rename = "initializeWorkspaceRequest")]
    #[non_exhaustive]
    InitializeWorkspaceRequest {},

    #[serde(rename = "submitV2")]
    #[non_exhaustive]
    SubmitV2 {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
        language: Language,
        #[serde(rename = "submissionFiles")]
        #[serde(default)]
        submission_files: Vec<SubmissionFileInfo>,
        #[serde(rename = "problemId")]
        #[serde(default)]
        problem_id: ProblemId,
        #[serde(rename = "problemVersion")]
        #[serde(skip_serializing_if = "Option::is_none")]
        problem_version: Option<i64>,
        #[serde(rename = "userId")]
        #[serde(skip_serializing_if = "Option::is_none")]
        user_id: Option<String>,
    },

    #[serde(rename = "workspaceSubmit")]
    #[non_exhaustive]
    WorkspaceSubmit {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
        language: Language,
        #[serde(rename = "submissionFiles")]
        #[serde(default)]
        submission_files: Vec<SubmissionFileInfo>,
        #[serde(rename = "userId")]
        #[serde(skip_serializing_if = "Option::is_none")]
        user_id: Option<String>,
    },

    #[serde(rename = "stop")]
    #[non_exhaustive]
    Stop {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl SubmissionRequest {
    pub fn initialize_problem_request(problem_id: ProblemId) -> Self {
        Self::InitializeProblemRequest {
            problem_id,
            problem_version: None,
        }
    }

    pub fn initialize_workspace_request() -> Self {
        Self::InitializeWorkspaceRequest {}
    }

    pub fn submit_v2(
        submission_id: SubmissionId,
        language: Language,
        submission_files: Vec<SubmissionFileInfo>,
        problem_id: ProblemId,
    ) -> Self {
        Self::SubmitV2 {
            submission_id,
            language,
            submission_files,
            problem_id,
            problem_version: None,
            user_id: None,
        }
    }

    pub fn workspace_submit(
        submission_id: SubmissionId,
        language: Language,
        submission_files: Vec<SubmissionFileInfo>,
    ) -> Self {
        Self::WorkspaceSubmit {
            submission_id,
            language,
            submission_files,
            user_id: None,
        }
    }

    pub fn stop(submission_id: SubmissionId) -> Self {
        Self::Stop { submission_id }
    }

    pub fn initialize_problem_request_with_problem_version(
        problem_id: ProblemId,
        problem_version: i64,
    ) -> Self {
        Self::InitializeProblemRequest {
            problem_id,
            problem_version: Some(problem_version),
        }
    }

    pub fn submit_v2_with_problem_version(
        submission_id: SubmissionId,
        language: Language,
        submission_files: Vec<SubmissionFileInfo>,
        problem_id: ProblemId,
        problem_version: i64,
        user_id: Option<String>,
    ) -> Self {
        Self::SubmitV2 {
            submission_id,
            language,
            submission_files,
            problem_id,
            problem_version: Some(problem_version),
            user_id,
        }
    }

    pub fn submit_v2_with_user_id(
        submission_id: SubmissionId,
        language: Language,
        submission_files: Vec<SubmissionFileInfo>,
        problem_id: ProblemId,
        problem_version: Option<i64>,
        user_id: String,
    ) -> Self {
        Self::SubmitV2 {
            submission_id,
            language,
            submission_files,
            problem_id,
            problem_version,
            user_id: Some(user_id),
        }
    }

    pub fn workspace_submit_with_user_id(
        submission_id: SubmissionId,
        language: Language,
        submission_files: Vec<SubmissionFileInfo>,
        user_id: String,
    ) -> Self {
        Self::WorkspaceSubmit {
            submission_id,
            language,
            submission_files,
            user_id: Some(user_id),
        }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
