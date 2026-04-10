pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionStatusForTestCase {
        #[serde(rename = "graded")]
        #[non_exhaustive]
        Graded {
            #[serde(flatten)]
            data: TestCaseResultWithStdout,
        },

        #[serde(rename = "gradedV2")]
        #[non_exhaustive]
        GradedV2 {
            value: TestCaseGrade,
        },

        #[serde(rename = "traced")]
        #[non_exhaustive]
        Traced {
            result: TestCaseResultWithStdout,
            #[serde(rename = "traceResponsesSize")]
            #[serde(default)]
            trace_responses_size: i64,
        },
}

impl SubmissionStatusForTestCase {
    pub fn graded(data: TestCaseResultWithStdout) -> Self {
        Self::Graded { data }
    }

    pub fn graded_v2(value: TestCaseGrade) -> Self {
        Self::GradedV2 { value }
    }

    pub fn traced(result: TestCaseResultWithStdout, trace_responses_size: i64) -> Self {
        Self::Traced { result, trace_responses_size }
    }
}
