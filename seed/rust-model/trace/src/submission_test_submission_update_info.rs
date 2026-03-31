pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestSubmissionUpdateInfo {
        #[serde(rename = "running")]
        #[non_exhaustive]
        Running {
            value: RunningSubmissionState,
        },

        #[serde(rename = "stopped")]
        #[non_exhaustive]
        Stopped {},

        #[serde(rename = "errored")]
        #[non_exhaustive]
        Errored {
            value: ErrorInfo,
        },

        #[serde(rename = "gradedTestCase")]
        #[non_exhaustive]
        GradedTestCase {
            #[serde(rename = "testCaseId")]
            #[serde(default)]
            test_case_id: TestCaseId,
            grade: TestCaseGrade,
        },

        #[serde(rename = "recordedTestCase")]
        #[non_exhaustive]
        RecordedTestCase {
            #[serde(rename = "testCaseId")]
            #[serde(default)]
            test_case_id: TestCaseId,
            #[serde(rename = "traceResponsesSize")]
            #[serde(default)]
            trace_responses_size: i64,
        },

        #[serde(rename = "finished")]
        #[non_exhaustive]
        Finished {},
}

impl TestSubmissionUpdateInfo {
    pub fn running(value: RunningSubmissionState) -> Self {
        Self::Running { value }
    }

    pub fn stopped() -> Self {
        Self::Stopped {}
    }

    pub fn errored(value: ErrorInfo) -> Self {
        Self::Errored { value }
    }

    pub fn graded_test_case(test_case_id: TestCaseId, grade: TestCaseGrade) -> Self {
        Self::GradedTestCase { test_case_id, grade }
    }

    pub fn recorded_test_case(test_case_id: TestCaseId, trace_responses_size: i64) -> Self {
        Self::RecordedTestCase { test_case_id, trace_responses_size }
    }

    pub fn finished() -> Self {
        Self::Finished {}
    }
}
