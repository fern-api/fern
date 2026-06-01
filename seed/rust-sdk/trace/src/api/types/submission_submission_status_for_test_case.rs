pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum SubmissionStatusForTestCase {
    #[serde(rename = "graded")]
    #[non_exhaustive]
    Graded {
        #[serde(flatten)]
        data: TestCaseResultWithStdout,
    },

    #[serde(rename = "gradedV2")]
    #[non_exhaustive]
    GradedV2 { value: TestCaseGrade },

    #[serde(rename = "traced")]
    #[non_exhaustive]
    Traced {
        result: TestCaseResultWithStdout,
        #[serde(rename = "traceResponsesSize")]
        #[serde(default)]
        trace_responses_size: i64,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl SubmissionStatusForTestCase {
    pub fn graded(data: TestCaseResultWithStdout) -> Self {
        Self::Graded { data }
    }

    pub fn graded_v2(value: TestCaseGrade) -> Self {
        Self::GradedV2 { value }
    }

    pub fn traced(result: TestCaseResultWithStdout, trace_responses_size: i64) -> Self {
        Self::Traced {
            result,
            trace_responses_size,
        }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
