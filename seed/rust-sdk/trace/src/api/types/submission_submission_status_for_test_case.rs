use crate::submission_test_case_grade::TestCaseGrade;
use crate::submission_test_case_result_with_stdout::TestCaseResultWithStdout;
use crate::submission_traced_test_case::TracedTestCase;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
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
