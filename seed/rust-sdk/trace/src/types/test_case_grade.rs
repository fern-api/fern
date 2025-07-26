use crate::test_case_hidden_grade::TestCaseHiddenGrade;
use crate::test_case_non_hidden_grade::TestCaseNonHiddenGrade;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseGrade {
        Hidden {
            #[serde(flatten)]
            data: TestCaseHiddenGrade,
        },

        NonHidden {
            #[serde(flatten)]
            data: TestCaseNonHiddenGrade,
        },
}
