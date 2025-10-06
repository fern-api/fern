pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionTestCaseGrade {
        Hidden {
            #[serde(flatten)]
            data: SubmissionTestCaseHiddenGrade,
        },

        NonHidden {
            #[serde(flatten)]
            data: SubmissionTestCaseNonHiddenGrade,
        },
}
