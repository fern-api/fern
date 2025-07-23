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
