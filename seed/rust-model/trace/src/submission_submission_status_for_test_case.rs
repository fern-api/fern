pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionStatusForTestCase {
        #[serde(rename = "graded")]
        Graded {
            #[serde(flatten)]
            data: TestCaseResultWithStdout,
        },

        #[serde(rename = "gradedV2")]
        GradedV2 {
            value: TestCaseGrade,
        },

        #[serde(rename = "traced")]
        Traced {
            #[serde(flatten)]
            data: TracedTestCase,
        },
}
