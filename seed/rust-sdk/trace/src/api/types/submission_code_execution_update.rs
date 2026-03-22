pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CodeExecutionUpdate {
    #[serde(rename = "buildingExecutor")]
    #[non_exhaustive]
    BuildingExecutor {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
        status: ExecutionSessionStatus,
    },

    #[serde(rename = "running")]
    #[non_exhaustive]
    Running {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
        state: RunningSubmissionState,
    },

    #[serde(rename = "errored")]
    #[non_exhaustive]
    Errored {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
        #[serde(rename = "errorInfo")]
        error_info: ErrorInfo,
    },

    #[serde(rename = "stopped")]
    #[non_exhaustive]
    Stopped {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
    },

    #[serde(rename = "graded")]
    #[non_exhaustive]
    Graded {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
        #[serde(rename = "testCases")]
        #[serde(default)]
        test_cases: HashMap<String, TestCaseResultWithStdout>,
    },

    #[serde(rename = "gradedV2")]
    #[non_exhaustive]
    GradedV2 {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
        #[serde(rename = "testCases")]
        #[serde(default)]
        test_cases: HashMap<TestCaseId, TestCaseGrade>,
    },

    #[serde(rename = "workspaceRan")]
    #[non_exhaustive]
    WorkspaceRan {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
        #[serde(rename = "runDetails")]
        #[serde(default)]
        run_details: WorkspaceRunDetails,
    },

    #[serde(rename = "recording")]
    #[non_exhaustive]
    Recording {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
        #[serde(rename = "testCaseId")]
        #[serde(skip_serializing_if = "Option::is_none")]
        test_case_id: Option<String>,
        #[serde(rename = "lineNumber")]
        #[serde(default)]
        line_number: i64,
        #[serde(rename = "lightweightStackInfo")]
        #[serde(default)]
        lightweight_stack_info: LightweightStackframeInformation,
        #[serde(rename = "tracedFile")]
        #[serde(skip_serializing_if = "Option::is_none")]
        traced_file: Option<TracedFile>,
    },

    #[serde(rename = "recorded")]
    #[non_exhaustive]
    Recorded {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
        #[serde(rename = "traceResponsesSize")]
        #[serde(default)]
        trace_responses_size: i64,
        #[serde(rename = "testCaseId")]
        #[serde(skip_serializing_if = "Option::is_none")]
        test_case_id: Option<String>,
    },

    #[serde(rename = "invalidRequest")]
    #[non_exhaustive]
    InvalidRequest {
        request: SubmissionRequest,
        cause: InvalidRequestCause,
    },

    #[serde(rename = "finished")]
    #[non_exhaustive]
    Finished {
        #[serde(rename = "submissionId")]
        #[serde(default)]
        submission_id: SubmissionId,
    },
}

impl CodeExecutionUpdate {
    pub fn building_executor(submission_id: SubmissionId, status: ExecutionSessionStatus) -> Self {
        Self::BuildingExecutor {
            submission_id,
            status,
        }
    }

    pub fn running(submission_id: SubmissionId, state: RunningSubmissionState) -> Self {
        Self::Running {
            submission_id,
            state,
        }
    }

    pub fn errored(submission_id: SubmissionId, error_info: ErrorInfo) -> Self {
        Self::Errored {
            submission_id,
            error_info,
        }
    }

    pub fn stopped(submission_id: SubmissionId) -> Self {
        Self::Stopped { submission_id }
    }

    pub fn graded(
        submission_id: SubmissionId,
        test_cases: HashMap<String, TestCaseResultWithStdout>,
    ) -> Self {
        Self::Graded {
            submission_id,
            test_cases,
        }
    }

    pub fn graded_v_2(
        submission_id: SubmissionId,
        test_cases: HashMap<TestCaseId, TestCaseGrade>,
    ) -> Self {
        Self::GradedV2 {
            submission_id,
            test_cases,
        }
    }

    pub fn workspace_ran(submission_id: SubmissionId, run_details: WorkspaceRunDetails) -> Self {
        Self::WorkspaceRan {
            submission_id,
            run_details,
        }
    }

    pub fn recording(
        submission_id: SubmissionId,
        line_number: i64,
        lightweight_stack_info: LightweightStackframeInformation,
    ) -> Self {
        Self::Recording {
            submission_id,
            test_case_id: None,
            line_number,
            lightweight_stack_info,
            traced_file: None,
        }
    }

    pub fn recorded(submission_id: SubmissionId, trace_responses_size: i64) -> Self {
        Self::Recorded {
            submission_id,
            trace_responses_size,
            test_case_id: None,
        }
    }

    pub fn invalid_request(request: SubmissionRequest, cause: InvalidRequestCause) -> Self {
        Self::InvalidRequest { request, cause }
    }

    pub fn finished(submission_id: SubmissionId) -> Self {
        Self::Finished { submission_id }
    }

    pub fn recording_with_test_case_id(
        submission_id: SubmissionId,
        test_case_id: String,
        line_number: i64,
        lightweight_stack_info: LightweightStackframeInformation,
    ) -> Self {
        Self::Recording {
            submission_id,
            test_case_id: Some(test_case_id),
            line_number,
            lightweight_stack_info,
            traced_file: None,
        }
    }

    pub fn recording_with_traced_file(
        submission_id: SubmissionId,
        line_number: i64,
        lightweight_stack_info: LightweightStackframeInformation,
        traced_file: TracedFile,
    ) -> Self {
        Self::Recording {
            submission_id,
            test_case_id: None,
            line_number,
            lightweight_stack_info,
            traced_file: Some(traced_file),
        }
    }

    pub fn recorded_with_test_case_id(
        submission_id: SubmissionId,
        trace_responses_size: i64,
        test_case_id: String,
    ) -> Self {
        Self::Recorded {
            submission_id,
            trace_responses_size,
            test_case_id: Some(test_case_id),
        }
    }
}
