pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionSubmissionStatusForTestCase {
    Graded {
        #[serde(flatten)]
        data: SubmissionTestCaseResultWithStdout,
    },

    GradedV2 {
        value: SubmissionTestCaseGrade,
    },

    Traced {
        #[serde(flatten)]
        data: SubmissionTracedTestCase,
    },
}
