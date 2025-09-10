use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionStatusForTestCase {
        Graded {
            #[serde(flatten)]
            data: TestCaseResultWithStdout,
        },

        GradedV2 {
            value: TestCaseGrade,
        },

        Traced {
            #[serde(flatten)]
            data: TracedTestCase,
        },
}
