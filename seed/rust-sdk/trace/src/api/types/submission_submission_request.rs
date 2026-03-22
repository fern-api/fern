pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
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
}

impl SubmissionRequest {
    pub fn initialize_problem_request(problem_id: ProblemId) -> Self {
        Self::InitializeProblemRequest { problem_id, problem_version: None }
    }

    pub fn initialize_workspace_request() -> Self {
        Self::InitializeWorkspaceRequest {}
    }

    pub fn submit_v_2(submission_id: SubmissionId, language: Language, submission_files: Vec<SubmissionFileInfo>, problem_id: ProblemId) -> Self {
        Self::SubmitV2 { submission_id, language, submission_files, problem_id, problem_version: None, user_id: None }
    }

    pub fn workspace_submit(submission_id: SubmissionId, language: Language, submission_files: Vec<SubmissionFileInfo>) -> Self {
        Self::WorkspaceSubmit { submission_id, language, submission_files, user_id: None }
    }

    pub fn stop(submission_id: SubmissionId) -> Self {
        Self::Stop { submission_id }
    }
}
